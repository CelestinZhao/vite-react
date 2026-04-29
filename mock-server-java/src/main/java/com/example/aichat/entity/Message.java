package com.example.aichat.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 消息表（对应 Node 版 messages 表结构，字段完全一致）
 */
@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_msg_conv", columnList = "conversation_id, create_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "conversation_id", nullable = false, length = 64)
    private String conversationId;

    /** user / assistant / system */
    @Column(nullable = false, length = 16)
    private String role;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String content = "";

    @Column
    private String model;

    /** JSON 序列化后的字符串 */
    @Column(columnDefinition = "TEXT")
    private String attachments;

    @Column(name = "tokens_in")
    @Builder.Default
    private Integer tokensIn = 0;

    @Column(name = "tokens_out")
    @Builder.Default
    private Integer tokensOut = 0;

    /** stop / abort / error / null */
    @Column(name = "finish_reason", length = 32)
    private String finishReason;

    @Column(columnDefinition = "TEXT")
    private String error;

    @Column(name = "create_time", nullable = false)
    private Long createTime;
}
