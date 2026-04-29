package com.example.aichat.controller;

import com.example.aichat.config.AiChatProperties;
import com.example.aichat.dto.ChatRequest;
import com.example.aichat.dto.ChatStreamEvent;
import com.example.aichat.service.ChatService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SSE 聊天接口（对应 Node 版 routes/chat.js）
 * <p>POST /api/chat/completions → text/event-stream</p>
 * <p>使用 Spring 原生 ServerSentEvent，输出格式 <code>data:xxx\n\n</code>，
 * 符合 W3C EventSource 规范（冒号后空格可选）。前端解析器需兼容该格式。</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AiChatProperties props;
    private final ObjectMapper objectMapper;

    /**
     * POST /api/chat/completions
     * <p>produces = TEXT_EVENT_STREAM_VALUE → Spring 自动设置 Content-Type: text/event-stream</p>
     * <p>前端断开 → Flux cancel → WebClient 自动取消上游 HTTP 请求（无需手动 AbortController）</p>
     */
    @PostMapping(value = "/completions", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chat(
            @RequestBody ChatRequest req,
            @RequestParam(value = "mockError", required = false) String mockError) {

        log.info("[chat] conv={} model={} content=\"{}\"",
                req.conversationId() == null ? "NEW" : req.conversationId(),
                req.model(),
                req.content().length() > 40 ? req.content().substring(0, 40) + "..." : req.content());

        boolean forceError = "1".equals(mockError);

        // 业务事件流
        Flux<ServerSentEvent<String>> eventStream = chatService.handleChat(req, forceError)
                .map(this::toSse);

        // 心跳流：每 N 秒发一个 SSE 注释行（: heartbeat），防止代理层超时断连
        Flux<ServerSentEvent<String>> heartbeat = Flux
                .interval(Duration.ofSeconds(props.sseHeartbeatSeconds()))
                .map(i -> ServerSentEvent.<String>builder().comment("heartbeat").build());

        // 合并：业务流 + 心跳流，业务流完成时整体结束
        return Flux.merge(eventStream, heartbeat)
                .takeUntil(sse -> {
                    // 收到 [DONE] 字符串时终止整个 Flux（包括心跳）
                    String data = sse.data();
                    return "[DONE]".equals(data);
                });
    }

    /**
     * 将内部事件转换为 SSE 帧（与 Node 版 sendChunk / sendDone / sendError 对应）
     */
    private ServerSentEvent<String> toSse(ChatStreamEvent event) {
        return switch (event) {
            case ChatStreamEvent.Meta meta -> sse(toJson(meta));
            case ChatStreamEvent.Chunk chunk -> sse(buildChunkJson(chunk));
            case ChatStreamEvent.Finish finish -> sse(buildFinishJson(finish));
            case ChatStreamEvent.Done done -> sse("[DONE]");
            case ChatStreamEvent.Error error -> sse(buildErrorJson(error));
        };
    }

    private ServerSentEvent<String> sse(String data) {
        return ServerSentEvent.<String>builder().data(data).build();
    }

    /** OpenAI 兼容 chunk 格式（与 Node 版 onChunk 推送的 JSON 完全一致） */
    private String buildChunkJson(ChatStreamEvent.Chunk chunk) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", chunk.id());
        payload.put("object", "chat.completion.chunk");
        payload.put("created", chunk.created());
        payload.put("model", chunk.model());
        payload.put("delta", Map.of("content", chunk.textDelta()));
        payload.put("choices", List.of(Map.of(
                "index", 0,
                "delta", Map.of("content", chunk.textDelta()),
                "finish_reason", ""
        )));
        return toJson(payload);
    }

    /** 结束 chunk（finish_reason 非 null） */
    private String buildFinishJson(ChatStreamEvent.Finish finish) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", finish.id());
        payload.put("object", "chat.completion.chunk");
        payload.put("created", finish.created());
        payload.put("model", finish.model());
        payload.put("delta", Map.of());
        payload.put("choices", List.of(Map.of(
                "index", 0,
                "delta", Map.of(),
                "finish_reason", finish.finishReason()
        )));
        return toJson(payload);
    }

    /** 错误帧（与 Node 版 sendError 格式一致） */
    private String buildErrorJson(ChatStreamEvent.Error error) {
        return toJson(Map.of("error", Map.of(
                "code", error.code(),
                "message", error.message()
        )));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
