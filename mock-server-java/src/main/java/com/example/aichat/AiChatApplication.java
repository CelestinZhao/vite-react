package com.example.aichat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * AiChat 后端服务启动入口
 * <p>
 * - 端口: 3001（与 Node 版对齐）
 * - 架构: WebFlux + JPA + SQLite
 * - 与前端通过 /api/** 联调，SSE 协议完全兼容 Node 版
 */
@SpringBootApplication
public class AiChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiChatApplication.class, args);
    }
}
