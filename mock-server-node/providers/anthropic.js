/**
 * Anthropic (Claude) Provider
 */
import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base.js';

export class AnthropicProvider extends BaseProvider {
	constructor({ apiKey }) {
		super('anthropic');
		this.apiKey = apiKey;
		this.client = apiKey ? new Anthropic({ apiKey }) : null;
	}

	isAvailable() {
		return Boolean(this.apiKey);
	}

	/**
	 * Claude Messages API 与 OpenAI 差异：
	 *  - system 作为独立字段，不在 messages 里
	 *  - 需要 max_tokens（必填）
	 *  - 流式 chunk 结构为 { type:'content_block_delta', delta:{ text } }
	 */
	async streamChat({
		messages,
		model,
		temperature = 0.7,
		maxTokens = 4096,
		signal,
		onChunk,
		onDone,
		onError,
	}) {
		if (!this.client) {
			onError?.(new Error('Anthropic 未配置 API Key'));
			return;
		}

		// 拆出 system message
		const systemMsg = messages.find((m) => m.role === 'system');
		const chatMessages = messages
			.filter((m) => m.role !== 'system')
			.map((m) => ({ role: m.role, content: m.content }));

		try {
			const stream = await this.client.messages.stream(
				{
					model,
					system: systemMsg?.content,
					messages: chatMessages,
					temperature,
					max_tokens: maxTokens,
				},
				{ signal },
			);

			let tokensOut = 0;

			for await (const event of stream) {
				if (event.type === 'content_block_delta') {
					const text = event.delta?.text;
					if (text) {
						tokensOut += 1;
						onChunk?.(text);
					}
				}
				if (event.type === 'message_stop') break;
			}

			onDone?.({ tokensOut });
		} catch (err) {
			if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
				onDone?.({ aborted: true });
				return;
			}
			onError?.(err);
		}
	}
}
