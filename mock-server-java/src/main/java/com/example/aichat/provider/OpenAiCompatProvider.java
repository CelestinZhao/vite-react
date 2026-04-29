package com.example.aichat.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenAI Chat Completions 兼容 Provider
 * <p>一个类覆盖三家：OpenAI / 混元 / DeepSeek，仅 baseUrl 和支持模型不同</p>
 * <p>对应 Node 版 providers/openai.js + hunyuan.js + deepseek.js 的合并</p>
 */
@Slf4j
public class OpenAiCompatProvider implements LlmProvider {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final String providerName;
    private final String baseUrl;
    private final String apiKey;
    private final List<String> modelPrefixes;
    private final WebClient webClient;

    public OpenAiCompatProvider(String providerName,
                                 String baseUrl,
                                 String apiKey,
                                 List<String> modelPrefixes) {
        this.providerName = providerName;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey == null ? "" : apiKey;
        this.modelPrefixes = modelPrefixes;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + this.apiKey)
                .build();
    }

    @Override
    public String name() {
        return providerName;
    }

    @Override
    public boolean available() {
        return !apiKey.isBlank();
    }

    @Override
    public List<String> supportedModelPrefixes() {
        return modelPrefixes;
    }

    @Override
    public Flux<String> streamChat(List<Map<String, String>> messages,
                                   String model,
                                   Map<String, Object> params) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("stream", true);
        if (params.get("temperature") != null) body.put("temperature", params.get("temperature"));
        if (params.get("maxTokens") != null) body.put("max_tokens", params.get("maxTokens"));
        if (params.get("topP") != null) body.put("top_p", params.get("topP"));

        return webClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .mapNotNull(sse -> {
                    String data = sse.data();
                    if (data == null || data.isBlank() || "[DONE]".equals(data.trim())) {
                        return null;
                    }
                    return parseDeltaContent(data);
                })
                .filter(s -> !s.isEmpty())
                .doOnError(err -> log.warn("[{}] stream error: {}", providerName, err.getMessage()));
    }

    private String parseDeltaContent(String json) {
        try {
            JsonNode root = MAPPER.readTree(json);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("delta").path("content").asText("");
            }
        } catch (Exception e) {
            log.debug("[{}] parse chunk failed: {}", providerName, e.getMessage());
        }
        return "";
    }
}
