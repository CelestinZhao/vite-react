package com.example.aichat.controller;

import com.example.aichat.dto.ApiResponse;
import com.example.aichat.dto.ProviderInfo;
import com.example.aichat.provider.LlmProvider;
import com.example.aichat.provider.ProviderRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Provider 可用性接口（对应 Node 版 routes/providers.js）
 * GET /api/providers
 */
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderRegistry providerRegistry;

    @GetMapping
    public Mono<ApiResponse<List<ProviderInfo>>> providers() {
        List<ProviderInfo> list = providerRegistry.allProviders().stream()
                .map(p -> new ProviderInfo(p.name(), p.available(), descOf(p)))
                .toList();
        return Mono.just(ApiResponse.ok(list));
    }

    private String descOf(LlmProvider p) {
        return switch (p.name()) {
            case "openai" -> "OpenAI Chat Completions";
            case "anthropic" -> "Anthropic Messages API";
            case "hunyuan" -> "腾讯混元（OpenAI 兼容）";
            case "deepseek" -> "DeepSeek（OpenAI 兼容）";
            case "mock" -> "本地 Mock（无需 Key）";
            default -> p.name();
        };
    }
}
