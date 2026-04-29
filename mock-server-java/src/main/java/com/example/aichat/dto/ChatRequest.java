package com.example.aichat.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * 聊天接口请求体
 * <p>对应 Node 版前端发送的 JSON，字段名保持一致</p>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ChatRequest(
        String conversationId,           // 可选：为空则自动创建
        String content,                  // 用户输入
        String model,                    // 模型 ID，如 "gpt-4o"
        List<Object> attachments,        // 附件列表，结构对前端透明
        String systemPrompt,             // 系统提示词
        Double temperature,
        Integer maxTokens,
        Double topP,
        Boolean stream
) {
    public ChatRequest {
        if (model == null || model.isBlank()) model = "gpt-4o";
        if (content == null) content = "";
    }
}
