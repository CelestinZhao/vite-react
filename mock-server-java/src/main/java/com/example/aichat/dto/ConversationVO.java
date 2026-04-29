package com.example.aichat.dto;

import java.util.List;

/**
 * 会话 VO（对外响应格式）
 * 对应 Node 版 formatConv() 的输出字段
 */
public record ConversationVO(
        String id,
        String title,
        String model,
        String systemPrompt,
        String updateTime,     // 格式化后的日期字符串（与 Node 版一致）
        String createTime
) {}
