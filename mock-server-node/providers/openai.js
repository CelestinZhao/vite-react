/**
 * OpenAI 兼容 Provider
 * @description 覆盖 OpenAI / 混元 / DeepSeek（三家都是 OpenAI 兼容协议，仅 baseURL+apiKey 不同）
 */
import OpenAI from 'openai';
import { BaseProvider } from './base.js';

export class OpenAICompatibleProvider extends BaseProvider {
	/**
	 * @param {object} cfg
	 * @param {string} cfg.name     - 名称：openai / hunyuan / deepseek
	 * @param {string} cfg.apiKey
	 * @param {string} cfg.baseURL
	 */
	constructor({ name, apiKey, baseURL }) {
		super(name);
		this.apiKey = apiKey;
		this.baseURL = baseURL;
		this.client = apiKey ? new OpenAI({ apiKey, baseURL }) : null;
	}

	isAvailable() {
		return Boolean(this.apiKey);
	}

	async streamChat({
		messages,
		model,
		temperature = 0.7,
		maxTokens,
		signal,
		onChunk,
		onDone,
		onError,
	}) {
		if (!this.client) {
			onError?.(new Error(`${this.name} 未配置 API Key`));
			return;
		}

		try {
			const stream = await this.client.chat.completions.create(
				{
					model,
					messages,
					temperature,
					max_tokens: maxTokens,
					stream: true,
				},
				{ signal },
			);

			let tokensOut = 0;

			for await (const part of stream) {
				// 每个 part 形如：{ choices: [{ delta: { content: 'xxx' } }] }
				const delta = part?.choices?.[0]?.delta?.content;
				if (delta) {
					tokensOut += 1; // 粗略统计（真实应从 usage 字段取）
					onChunk?.(delta);
				}

				// finish_reason 出现即结束
				const finish = part?.choices?.[0]?.finish_reason;
				if (finish) break;
			}

			onDone?.({ tokensOut });
		} catch (err) {
			// AbortError 由上层处理
			if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
				onDone?.({ aborted: true });
				return;
			}
			onError?.(err);
		}
	}
}
