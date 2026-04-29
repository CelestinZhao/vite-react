package com.example.aichat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 业务全局配置
 */
@ConfigurationProperties(prefix = "aichat")
public record AiChatProperties(
        /* 上下文窗口：每次请求从 DB 取最近 N 条消息 */
        int contextMessageLimit,
        /* SSE 心跳间隔（秒），防止代理层断连 */
        int sseHeartbeatSeconds
) {
    public AiChatProperties {
        if (contextMessageLimit <= 0) contextMessageLimit = 20;
        if (sseHeartbeatSeconds <= 0) sseHeartbeatSeconds = 15;
    }
}
