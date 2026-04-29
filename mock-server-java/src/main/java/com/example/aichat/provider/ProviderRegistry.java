package com.example.aichat.provider;

import com.example.aichat.config.ProviderProperties;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Provider 注册表（对应 Node 版 providers/index.js）
 * <p>启动时根据配置初始化所有 Provider，并按模型 ID 前缀路由请求</p>
 * <p>路由策略：</p>
 * <ol>
 *   <li>按前端传入的 model 前缀匹配可用 Provider（优先精确匹配）</li>
 *   <li>找到但 key 未配置 → 降级 Mock（fallback=true）</li>
 *   <li>完全找不到 → 降级 Mock（fallback=true）</li>
 * </ol>
 */
@Slf4j
@Component
public class ProviderRegistry {

    private final ProviderProperties props;

    /** 所有已注册的 Provider（包含未配置 key 的占位项，用于识别 requestedProvider） */
    private final List<LlmProvider> allProviders = new ArrayList<>();

    @Getter
    private MockProvider mockProvider;

    public ProviderRegistry(ProviderProperties props) {
        this.props = props;
    }

    @PostConstruct
    public void init() {
        // 1. OpenAI
        if (props.openai() != null) {
            allProviders.add(new OpenAiCompatProvider(
                    "openai",
                    props.openai().baseUrl(),
                    props.openai().apiKey(),
                    List.of("gpt-", "o1-", "o3-")
            ));
        }
        // 2. Anthropic
        if (props.anthropic() != null) {
            allProviders.add(new AnthropicProvider(
                    props.anthropic().baseUrl(),
                    props.anthropic().apiKey()
            ));
        }
        // 3. 混元
        if (props.hunyuan() != null) {
            allProviders.add(new OpenAiCompatProvider(
                    "hunyuan",
                    props.hunyuan().baseUrl(),
                    props.hunyuan().apiKey(),
                    List.of("hunyuan-")
            ));
        }
        // 4. DeepSeek
        if (props.deepseek() != null) {
            allProviders.add(new OpenAiCompatProvider(
                    "deepseek",
                    props.deepseek().baseUrl(),
                    props.deepseek().apiKey(),
                    List.of("deepseek-")
            ));
        }
        // 5. Mock（兜底）
        this.mockProvider = new MockProvider();
        allProviders.add(this.mockProvider);

        // 启动日志：仅打印 name 与 available 状态，不打印 key
        String availableList = allProviders.stream()
                .filter(LlmProvider::available)
                .map(LlmProvider::name)
                .toList()
                .toString();
        log.info("[providers] registered={}, available={}", allProviders.size(), availableList);
    }

    /**
     * 根据模型 ID 路由到对应的 Provider
     *
     * @return Resolved：包含实际要调用的 Provider 以及原请求的 Provider 名（用于前端提示 fallback）
     */
    public Resolved resolve(String model) {
        String m = model == null ? "" : model;

        // 先找名义上匹配的 Provider（不管 key 是否配置）
        LlmProvider requestedOwner = allProviders.stream()
                .filter(p -> !MockProvider.NAME.equals(p.name()))
                .filter(p -> p.supportedModelPrefixes().stream().anyMatch(m::startsWith))
                .findFirst()
                .orElse(null);

        if (requestedOwner != null && requestedOwner.available()) {
            return new Resolved(requestedOwner, requestedOwner.name(), false, m);
        }

        // Fallback 到 Mock
        String requested = requestedOwner != null ? requestedOwner.name() : "unknown";
        return new Resolved(mockProvider, requested, true, m);
    }

    /**
     * @param provider           实际调用的 Provider
     * @param requestedProvider  前端请求的 Provider 名（未配 key 时可能 = unknown）
     * @param fallback           是否降级到 Mock
     * @param realModel          实际下发给 Provider 的模型 ID
     */
    public record Resolved(LlmProvider provider, String requestedProvider, boolean fallback, String realModel) {}

    public List<LlmProvider> allProviders() {
        return List.copyOf(allProviders);
    }
}
