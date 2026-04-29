package com.example.aichat.provider;

import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * LLM 提供商统一接口
 * <p>对应 Node 版 providers/base.js，流式使用 Reactor 的 Flux 代替 JS 的 async generator</p>
 */
public interface LlmProvider {

    /** 名称，如 openai / anthropic / hunyuan / deepseek / mock */
    String name();

    /** 是否配置了有效 key（启动时打印可用列表） */
    boolean available();

    /** 声明支持的模型前缀，用于根据前端传入的 model 路由 */
    List<String> supportedModelPrefixes();

    /**
     * 流式聊天调用
     *
     * @param messages 已组装好的 OpenAI 风格消息列表（含 role / content）
     * @param model    真实模型 ID
     * @param params   额外参数 (temperature / maxTokens / topP ...)
     * @return 冷 Flux：每个元素是一段文本 delta；订阅被取消时会传播到上游 HTTP 调用
     */
    Flux<String> streamChat(List<Map<String, String>> messages, String model, Map<String, Object> params);
}
