package com.example.aichat.service;

import com.example.aichat.config.AiChatProperties;
import com.example.aichat.dto.ChatRequest;
import com.example.aichat.dto.ChatStreamEvent;
import com.example.aichat.entity.Conversation;
import com.example.aichat.entity.Message;
import com.example.aichat.provider.ProviderRegistry;
import com.example.aichat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 聊天核心编排 Service（对应 Node 版 services/chatService.js）
 * <p>职责：DB 读取历史 → 调 Provider → 流式转发 → DB 持久化</p>
 *
 * <p>WebFlux 注意事项：</p>
 * <ul>
 *   <li>JPA 是阻塞 IO，必须在 boundedElastic 线程池执行，不能阻塞 EventLoop</li>
 *   <li>Flux 取消（前端断开）会自动传播到上游 Provider 的 WebClient 调用</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss").withZone(ZoneId.systemDefault());

    private final MessageRepository msgRepo;
    private final ProviderRegistry providerRegistry;
    private final AiChatProperties props;
    private final ChatPersistenceService persistence;   // 所有 DB 写操作代理到此 Bean，确保 @Transactional 生效

    /**
     * 处理一次聊天请求，返回 Flux 事件流
     * <p>Flux 中的事件类型：Meta → Chunk... → Finish → Done（或 Error）</p>
     */
    public Flux<ChatStreamEvent> handleChat(ChatRequest req, boolean mockError) {
        if (mockError) {
            return Flux.just(
                    new ChatStreamEvent.Error("MOCK_ERROR", "这是一条模拟的错误响应"),
                    new ChatStreamEvent.Done()
            );
        }

        // 使用 Sinks.Many 作为事件总线，在阻塞线程里 emit，在 Flux 里消费
        Sinks.Many<ChatStreamEvent> sink = Sinks.many().unicast().onBackpressureBuffer();

        // 所有 DB 操作 + Provider 调用放在 boundedElastic 线程池，不阻塞 EventLoop
        // 使用 Mono.fromRunnable：任务只需要被执行，不关心返回值
        Mono.fromRunnable(() -> doHandleChat(req, sink))
                .subscribeOn(Schedulers.boundedElastic())
                .subscribe(
                        v -> {},
                        err -> {
                            log.error("[chat] unhandled error: {}", err.getMessage(), err);
                            sink.tryEmitNext(new ChatStreamEvent.Error("INTERNAL_ERROR", err.getMessage()));
                            sink.tryEmitComplete();
                        }
                );

        return sink.asFlux();
    }

    /**
     * 实际编排逻辑（在 boundedElastic 线程执行）
     */
    private void doHandleChat(ChatRequest req, Sinks.Many<ChatStreamEvent> sink) {
        String model = req.model() == null ? "gpt-4o" : req.model();

        // 1. 解析 / 创建会话
        Conversation conv = persistence.resolveOrCreate(
                req.conversationId(), truncateTitle(req.content()), model, req.systemPrompt());

        // 2. 写入用户消息
        Message userMsg = persistence.saveMessage(conv.getId(), "user", req.content(), null, req.attachments());

        // 3. 创建占位 assistant 消息
        Message assistantMsg = persistence.saveMessage(conv.getId(), "assistant", "", model, null);

        // 4. 路由 Provider
        ProviderRegistry.Resolved resolved = providerRegistry.resolve(model);
        log.info("[chat] conv={} model={} provider={} fallback={}",
                conv.getId(), model, resolved.provider().name(), resolved.fallback());

        // 5. 推送 meta 首帧
        sink.tryEmitNext(new ChatStreamEvent.Meta(
                conv.getId(), conv.getTitle(),
                userMsg.getId(), assistantMsg.getId(),
                resolved.provider().name(), resolved.requestedProvider(),
                resolved.fallback(), resolved.realModel()
        ));

        // 6. 组装上下文
        List<Map<String, String>> messages = buildContext(conv, req);

        // 7. 调用 Provider 流式接口
        String chunkId = "chatcmpl-" + Long.toHexString(System.currentTimeMillis());
        long created = System.currentTimeMillis() / 1000;
        AtomicReference<String> fullContent = new AtomicReference<>("");

        Map<String, Object> params = new HashMap<>();
        if (req.temperature() != null) params.put("temperature", req.temperature());
        if (req.maxTokens() != null) params.put("maxTokens", req.maxTokens());
        if (req.topP() != null) params.put("topP", req.topP());

        try {
            resolved.provider()
                    .streamChat(messages, resolved.realModel(), params)
                    .doOnNext(text -> {
                        fullContent.updateAndGet(prev -> prev + text);
                        sink.tryEmitNext(new ChatStreamEvent.Chunk(text, chunkId, created, model));
                    })
                    .doOnComplete(() -> {
                        // 写入 finish chunk
                        sink.tryEmitNext(new ChatStreamEvent.Finish("stop", chunkId, created, model));
                        // 持久化 assistant 消息
                        persistence.finalizeAssistantMessage(assistantMsg.getId(), fullContent.get(), "stop", null);
                        persistence.touchConversation(conv.getId());
                        sink.tryEmitNext(new ChatStreamEvent.Done());
                        sink.tryEmitComplete();
                    })
                    .doOnError(err -> {
                        log.warn("[chat] provider error: {}", err.getMessage());
                        persistence.finalizeAssistantMessage(assistantMsg.getId(), fullContent.get(), "error", err.getMessage());
                        persistence.touchConversation(conv.getId());
                        sink.tryEmitNext(new ChatStreamEvent.Error("PROVIDER_ERROR",
                                "模型调用失败：" + err.getMessage()));
                        sink.tryEmitNext(new ChatStreamEvent.Done());
                        sink.tryEmitComplete();
                    })
                    .blockLast();   // 在 boundedElastic 线程阻塞等待流完成
        } catch (Exception e) {
            if (!Thread.currentThread().isInterrupted()) {
                log.warn("[chat] stream exception: {}", e.getMessage());
                persistence.finalizeAssistantMessage(assistantMsg.getId(), fullContent.get(), "error", e.getMessage());
                persistence.touchConversation(conv.getId());
                sink.tryEmitNext(new ChatStreamEvent.Error("STREAM_ERROR", e.getMessage()));
                sink.tryEmitNext(new ChatStreamEvent.Done());
                sink.tryEmitComplete();
            } else {
                // 前端中断（AbortError），保存已生成部分
                persistence.finalizeAssistantMessage(assistantMsg.getId(), fullContent.get(), "abort", null);
                persistence.touchConversation(conv.getId());
                sink.tryEmitComplete();
            }
        }
    }

    // ---- 私有辅助方法 ----

    private List<Map<String, String>> buildContext(Conversation conv, ChatRequest req) {
        List<Map<String, String>> messages = new ArrayList<>();
        String system = req.systemPrompt() != null ? req.systemPrompt() : conv.getSystemPrompt();
        if (system != null && !system.isBlank()) {
            messages.add(Map.of("role", "system", "content", system));
        }
        // 取最近 N 条（含本轮 user 消息）
        List<Message> recent = msgRepo.findRecent(conv.getId(),
                PageRequest.of(0, props.contextMessageLimit()));
        // findRecent 是 DESC，需要反转
        for (int i = recent.size() - 1; i >= 0; i--) {
            Message m = recent.get(i);
            if (!"system".equals(m.getRole()) && !m.getContent().isBlank()) {
                messages.add(Map.of("role", m.getRole(), "content", m.getContent()));
            }
        }
        return messages;
    }

    private static String truncateTitle(String text) {
        if (text == null || text.isBlank()) return "新会话";
        String t = text.replaceAll("\\s+", " ").trim();
        return t.length() > 20 ? t.substring(0, 20) + "..." : t;
    }

    public String formatTime(long ts) {
        return FORMATTER.format(Instant.ofEpochMilli(ts));
    }
}
