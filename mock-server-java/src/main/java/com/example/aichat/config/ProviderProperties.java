package com.example.aichat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 各 Provider 的配置
 * <p>映射 application.yml:</p>
 * <pre>
 * providers:
 *   openai: { base-url, api-key }
 *   anthropic: { base-url, api-key }
 *   hunyuan: { base-url, api-key }
 *   deepseek: { base-url, api-key }
 * </pre>
 */
@ConfigurationProperties(prefix = "providers")
public record ProviderProperties(
        ProviderEntry openai,
        ProviderEntry anthropic,
        ProviderEntry hunyuan,
        ProviderEntry deepseek
) {
    public record ProviderEntry(String baseUrl, String apiKey) {
        public boolean available() {
            return apiKey != null && !apiKey.isBlank();
        }
    }
}
