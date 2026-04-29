package com.example.aichat.controller;

import com.example.aichat.dto.ApiResponse;
import com.example.aichat.dto.ModelInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * 模型列表接口（对应 Node 版 routes/models.js）
 * GET /api/models
 */
@RestController
@RequestMapping("/api/models")
public class ModelController {

    private static final List<ModelInfo> MODELS = List.of(
            new ModelInfo("gpt-4o", "GPT-4o", "openai", "OpenAI 最新旗舰模型"),
            new ModelInfo("gpt-4o-mini", "GPT-4o Mini", "openai", "OpenAI 轻量快速模型"),
            new ModelInfo("claude-3-5-sonnet-20241022", "Claude 3.5 Sonnet", "anthropic", "Anthropic 最强模型"),
            new ModelInfo("claude-3-opus-20240229", "Claude 3 Opus", "anthropic", "Anthropic 高质量模型"),
            new ModelInfo("hunyuan-pro", "混元 Pro", "hunyuan", "腾讯混元旗舰模型"),
            new ModelInfo("hunyuan-lite", "混元 Lite", "hunyuan", "腾讯混元轻量模型"),
            new ModelInfo("deepseek-chat", "DeepSeek V3", "deepseek", "DeepSeek 最新模型"),
            new ModelInfo("mock", "Mock（离线）", "mock", "无需 API Key，本地模拟回复")
    );

    @GetMapping
    public Mono<ApiResponse<List<ModelInfo>>> models() {
        return Mono.just(ApiResponse.ok(MODELS));
    }
}
