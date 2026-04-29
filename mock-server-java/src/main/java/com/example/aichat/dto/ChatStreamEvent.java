package com.example.aichat.dto;

/**
 * 聊天服务对外的统一流事件
 * <p>由 ChatService 发出，ChatController 转换为 SSE 帧推给前端</p>
 * <p>SSE 协议帧格式与 Node 版完全一致：</p>
 * <pre>
 *   data: {"type":"meta", ...}          ← Meta
 *   data: {"delta":{"content":"你"}, ...} ← Chunk（OpenAI 兼容）
 *   data: {"delta":{},"choices":[{"finish_reason":"stop"}]} ← FinishChunk
 *   data: [DONE]                        ← 终止帧（在 Controller 里以字符串形式输出）
 *   data: {"error":{"code":"...","message":"..."}} ← Error
 * </pre>
 */
public sealed interface ChatStreamEvent
        permits ChatStreamEvent.Meta, ChatStreamEvent.Chunk, ChatStreamEvent.Finish,
                ChatStreamEvent.Done, ChatStreamEvent.Error {

    /**
     * 首帧元数据（对应 Node 版 `type:'meta'`）
     */
    record Meta(
            String type,
            String conversationId,
            String conversationTitle,
            String userMessageId,
            String assistantMessageId,
            String provider,
            String requestedProvider,
            boolean fallback,
            String realModel
    ) implements ChatStreamEvent {
        public Meta(String conversationId, String conversationTitle,
                    String userMessageId, String assistantMessageId,
                    String provider, String requestedProvider,
                    boolean fallback, String realModel) {
            this("meta", conversationId, conversationTitle,
                    userMessageId, assistantMessageId,
                    provider, requestedProvider, fallback, realModel);
        }
    }

    /** OpenAI 兼容的内容 chunk */
    record Chunk(String textDelta, String id, long created, String model) implements ChatStreamEvent {}

    /** 结束 chunk（finish_reason） */
    record Finish(String finishReason, String id, long created, String model) implements ChatStreamEvent {}

    /** 终止帧（下游 Controller 用来发 `data: [DONE]`） */
    record Done() implements ChatStreamEvent {}

    /** 错误帧 */
    record Error(String code, String message) implements ChatStreamEvent {}
}
