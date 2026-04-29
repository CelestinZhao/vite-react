package com.example.aichat.provider;

import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Mock Provider（对应 Node 版 providers/mock.js）
 * <p>无任何外部依赖，将最后一条 user 消息按关键词选择 Mock 内容，逐字/逐词推送</p>
 * <p>用于：</p>
 * <ul>
 *   <li>无任何 Provider 配置 key 时兜底</li>
 *   <li>路由找不到匹配的 Provider 时降级</li>
 *   <li>调试 SSE 链路</li>
 * </ul>
 */
public class MockProvider implements LlmProvider {

    /** 常量名字：供 ProviderRegistry 识别兜底项 */
    public static final String NAME = "mock";

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public boolean available() {
        return true;  // 永远可用
    }

    @Override
    public List<String> supportedModelPrefixes() {
        // 不参与路由，仅作为兜底
        return List.of();
    }

    @Override
    public Flux<String> streamChat(List<Map<String, String>> messages, String model, Map<String, Object> params) {
        String lastUser = messages.stream()
                .filter(m -> "user".equals(m.get("role")))
                .map(m -> m.getOrDefault("content", ""))
                .reduce((a, b) -> b)   // 取最后一条
                .orElse("");

        String full = buildMockResponse(lastUser);
        List<String> chunks = splitToChunks(full);

        // 首字节延迟 300~700ms，chunk 间隔 30~120ms，模拟真实网络
        return Flux.fromIterable(chunks)
                .delayElements(Duration.ofMillis(30 + ThreadLocalRandom.current().nextInt(90)))
                .delaySubscription(Duration.ofMillis(300 + ThreadLocalRandom.current().nextInt(400)));
    }

    /**
     * 按关键词选择不同的 Mock 回复（对应 Node 版 getMockStreamChunks 规则）
     */
    private String buildMockResponse(String userInput) {
        String input = userInput == null ? "" : userInput.toLowerCase();
        if (input.contains("代码") || input.contains("code")) {
            return """
                    好的，这里是一段示例代码：

                    ```js
                    // 简单的数组去重
                    const unique = (arr) => [...new Set(arr)];
                    console.log(unique([1, 2, 2, 3]));  // [1, 2, 3]
                    ```

                    这段代码使用了 ES6 的 Set 特性，简洁高效。
                    """;
        }
        if (input.contains("列表") || input.contains("list")) {
            return """
                    好的，为你总结以下几点：

                    1. 第一点：这里是第一点的内容
                    2. 第二点：这里是第二点的内容
                    3. 第三点：这里是第三点的内容

                    希望对你有帮助。
                    """;
        }
        if (input.isBlank()) {
            return "你好，有什么我可以帮你的吗？";
        }
        return "你好！我收到了你的消息：「" + userInput + "」。这是来自 MockProvider 的模拟回复，"
                + "当前未配置任何真实模型的 API Key。你可以在 application-local.yml 中填入密钥以启用真实模型。";
    }

    /**
     * 切分为 chunk：按 2~4 个字符/汉字一组，制造逐字打印效果
     */
    private List<String> splitToChunks(String text) {
        java.util.ArrayList<String> out = new java.util.ArrayList<>();
        int i = 0;
        while (i < text.length()) {
            int step = 2 + ThreadLocalRandom.current().nextInt(3);  // 2~4
            int end = Math.min(i + step, text.length());
            out.add(text.substring(i, end));
            i = end;
        }
        return out;
    }
}
