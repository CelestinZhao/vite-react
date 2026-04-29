package com.example.aichat.service;

import com.example.aichat.entity.Conversation;
import com.example.aichat.entity.Message;
import com.example.aichat.repository.ConversationRepository;
import com.example.aichat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Chat 相关的数据库写入操作（独立 Bean，确保 @Transactional 生效）
 *
 * <p><b>设计背景：</b></p>
 * <ul>
 *   <li>Spring 的 @Transactional 通过 AOP 代理实现，类内部自调用（this.xxx()）不会经过代理，导致事务失效</li>
 *   <li>ChatService 的 doHandleChat 是普通方法（非事务），若直接调用 this.touchConversation()（@Transactional），
 *       实际上事务切面不会被触发 → @Modifying update 会抛 "Executing an update/delete query"</li>
 *   <li>将所有写操作抽离到独立 Bean，通过依赖注入调用，代理链完整，事务正常生效</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ChatPersistenceService {

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;

    /** 根据 conversationId 加载，不存在时创建新会话 */
    @Transactional
    public Conversation resolveOrCreate(String conversationId, String title, String model, String systemPrompt) {
        if (conversationId != null && !conversationId.isBlank()) {
            return convRepo.findById(conversationId)
                    .orElseGet(() -> createConversation(conversationId, title, model, systemPrompt));
        }
        return createConversation(null, title, model, systemPrompt);
    }

    private Conversation createConversation(String presetId, String title, String model, String systemPrompt) {
        long now = System.currentTimeMillis();
        Conversation c = Conversation.builder()
                .id(presetId != null && !presetId.isBlank() ? presetId : genConvId())
                .title(title == null || title.isBlank() ? "新会话" : title)
                .model(model)
                .systemPrompt(systemPrompt)
                .createTime(now)
                .updateTime(now)
                .build();
        return convRepo.save(c);
    }

    /** 保存一条消息（user 或 assistant 占位） */
    @Transactional
    public Message saveMessage(String convId, String role, String content,
                               String model, List<Object> attachments) {
        long now = System.currentTimeMillis();
        Message m = Message.builder()
                .id(genMsgId())
                .conversationId(convId)
                .role(role)
                .content(content == null ? "" : content)
                .model(model)
                .attachments(attachments != null && !attachments.isEmpty()
                        ? attachments.toString() : null)
                .tokensIn(0)
                .tokensOut(0)
                .createTime(now)
                .build();
        return msgRepo.save(m);
    }

    /** 流结束时回填 assistant 消息的正文 / finishReason / error */
    @Transactional
    public void finalizeAssistantMessage(String msgId, String content,
                                         String finishReason, String error) {
        msgRepo.findById(msgId).ifPresent(m -> {
            m.setContent(content == null ? "" : content);
            m.setFinishReason(finishReason);
            m.setError(error);
            msgRepo.save(m);
        });
    }

    /** 更新会话的 updateTime（刷新到列表顶部） */
    @Transactional
    public void touchConversation(String convId) {
        convRepo.touchUpdateTime(convId, System.currentTimeMillis());
    }

    private static String genConvId() {
        return "conv_" + Long.toString(System.currentTimeMillis(), 36)
                + Long.toString(Double.doubleToLongBits(Math.random()), 36).substring(0, 6);
    }

    private static String genMsgId() {
        return "msg_" + Long.toString(System.currentTimeMillis(), 36)
                + Long.toString(Double.doubleToLongBits(Math.random()), 36).substring(0, 6);
    }
}
