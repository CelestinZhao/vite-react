/**
 * Mock Provider - 离线降级兜底
 * @description 不配置任何真实 Provider 密钥时使用，保证开箱即用
 */
import { BaseProvider } from './base.js';
import { getMockStreamChunks } from '../mock/responses.js';

export class MockProvider extends BaseProvider {
	constructor() {
		super('mock');
	}

	isAvailable() {
		return true; // 始终可用
	}

	async streamChat({ messages, model, signal, onChunk, onDone, onError }) {
		// 取最后一条 user 消息作为判断关键词
		const lastUser = [...messages].reverse().find((m) => m.role === 'user');
		const content = lastUser?.content || '';

		const chunks = getMockStreamChunks(content, model);
		let aborted = false;

		if (signal) {
			if (signal.aborted) {
				onDone?.({ aborted: true });
				return;
			}
			signal.addEventListener('abort', () => {
				aborted = true;
			});
		}

		try {
			// 首字节延迟
			await sleep(200 + Math.random() * 300);
			if (aborted) return onDone?.({ aborted: true });

			let tokensOut = 0;
			for (const chunk of chunks) {
				if (aborted) return onDone?.({ aborted: true });
				onChunk?.(chunk);
				tokensOut += chunk.length;
				await sleep(30 + Math.random() * 90);
			}

			onDone?.({ tokensOut });
		} catch (err) {
			onError?.(err);
		}
	}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
