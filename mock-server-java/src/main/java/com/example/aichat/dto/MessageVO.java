package com.example.aichat.dto;

import java.util.List;

/**
 * 单条消息 VO（会话详情接口返回）
 */
public record MessageVO(
        String id,
        String role,
        String content,
        String model,
        List<Object> attachments,
        String finishReason,
        String error,
        String createTime
) {}
