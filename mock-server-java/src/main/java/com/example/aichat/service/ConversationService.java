package com.example.aichat.service;

import com.example.aichat.dto.ConversationVO;
import com.example.aichat.dto.MessageVO;
import com.example.aichat.entity.Conversation;
import com.example.aichat.entity.Message;
import com.example.aichat.repository.ConversationRepository;
import com.example.aichat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * 会话管理 Service（对应 Node 版 routes/conversations.js 的业务逻辑部分）
 */
@Service
@RequiredArgsConstructor
public class ConversationService {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss").withZone(ZoneId.systemDefault());

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;

    /** 会话列表（按 updateTime 倒序，最多 100 条） */
    public List<ConversationVO> listConversations() {
        return convRepo.findAllByOrderByUpdateTimeDesc(PageRequest.of(0, 100))
                .stream()
                .map(this::toVO)
                .toList();
    }

    /** 获取单条会话 */
    public Optional<ConversationVO> getConversation(String id) {
        return convRepo.findById(id).map(this::toVO);
    }

    /** 创建会话 */
    @Transactional
    public ConversationVO createConversation(String title, String model, String systemPrompt) {
        long now = System.currentTimeMillis();
        Conversation c = Conversation.builder()
                .id(genId())
                .title(title != null && !title.isBlank() ? title : "新会话")
                .model(model)
                .systemPrompt(systemPrompt)
                .createTime(now)
                .updateTime(now)
                .build();
        return toVO(convRepo.save(c));
    }

    /** 更新会话标题 */
    @Transactional
    public Optional<ConversationVO> updateConversation(String id, String title) {
        return convRepo.findById(id).map(c -> {
            if (title != null && !title.isBlank()) c.setTitle(title);
            c.setUpdateTime(System.currentTimeMillis());
            return toVO(convRepo.save(c));
        });
    }

    /** 删除会话（级联删除消息） */
    @Transactional
    public boolean deleteConversation(String id) {
        if (!convRepo.existsById(id)) return false;
        msgRepo.deleteByConversationId(id);
        convRepo.deleteById(id);
        return true;
    }

    /** 获取会话消息列表 */
    public Optional<List<MessageVO>> listMessages(String convId) {
        return convRepo.findById(convId).map(c ->
                msgRepo.findByConversationIdOrderByCreateTimeAsc(convId)
                        .stream()
                        .map(this::toMsgVO)
                        .toList()
        );
    }

    // ---- 格式化 ----

    private ConversationVO toVO(Conversation c) {
        return new ConversationVO(
                c.getId(), c.getTitle(), c.getModel(), c.getSystemPrompt(),
                fmt(c.getUpdateTime()), fmt(c.getCreateTime())
        );
    }

    private MessageVO toMsgVO(Message m) {
        return new MessageVO(
                m.getId(), m.getRole(), m.getContent(), m.getModel(),
                null,   // attachments 暂不反序列化
                m.getFinishReason(), m.getError(),
                fmt(m.getCreateTime())
        );
    }

    private String fmt(Long ts) {
        if (ts == null) return "";
        return FORMATTER.format(Instant.ofEpochMilli(ts));
    }

    private static String genId() {
        return "conv_" + Long.toString(System.currentTimeMillis(), 36)
                + Long.toString(Double.doubleToLongBits(Math.random()), 36).substring(0, 6);
    }
}
