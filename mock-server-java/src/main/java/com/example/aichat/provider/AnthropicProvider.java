package com.example.aichat.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Anthropic Messages API Provider（对应 Node 版 providers/anthropic.js）
 * <p>与 OpenAI 协议不同：</p>
 * <ul>
 *   <li>接口路径 /v1/messages</li>
 *   <li>请求头 x-api-key + anthropic-version</li>
 *   <li>system 单独字段，messages 中不能含 system</li>
 *   <li>事件类型含 content_block_delta / message_stop 等</li>
 * </ul>
 */
@Slf4j
public class AnthropicProvider implements LlmProvider {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    public static final String NAME = "anthropic";
    private static final List<String> MODEL_PREFIXES = List.of("claude-");

    private final String apiKey;
    private final WebClient webClient;

    public AnthropicProvider(String baseUrl, String apiKey) {
        this.apiKey = apiKey == null ? "" : apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("x-api-key", this.apiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }

    @Override
    public String name() { return NAME; }

    @Override
    public boolean available() { return !apiKey.isBlank(); }

    @Override
    public List<String> supportedModelPrefixes() { return MODEL_PREFIXES; }

    @Override
    public Flux<String> streamChat(List<Map<String, String>> messages, String model, Map<String, Object> params) {
        // 拆出 system
        String system = null;
        List<Map<String, String>> userAssistant = new ArrayList<>();
        for (Map<String, String> m : messages) {
            if ("system".equals(m.get("role"))) {
                system = m.get("content");
            } else {
                userAssistant.add(m);
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", userAssistant);
        body.put("stream", true);
        body.put("max_tokens", params.getOrDefault("maxTokens", 4096));
        if (system != null && !system.isBlank()) body.put("system", system);
        if (params.get("temperature") != null) body.put("temperature", params.get("temperature"));
        if (params.get("topP") != null) body.put("top_p", params.get("topP"));

        return webClient.post()
                .uri("/v1/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .mapNotNull(this::extractText)
                .filter(s -> !s.isEmpty())
                .doOnError(err -> log.warn("[anthropic] stream error: {}", err.getMessage()));
    }

    /**
     * 仅从 content_block_delta 事件中提取 text
     */
    private String extractText(ServerSentEvent<String> sse) {
        String data = sse.data();
        if (data == null || data.isBlank()) return "";
        try {
            JsonNode root = MAPPER.readTree(data);
            if ("content_block_delta".equals(root.path("type").asText())) {
                return root.path("delta").path("text").asText("");
            }
        } catch (Exception e) {
            log.debug("[anthropic] parse chunk failed: {}", e.getMessage());
        }
        return "";
    }
}
