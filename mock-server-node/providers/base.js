/**
 * Provider 抽象基类
 * @description 所有模型提供商需实现 streamChat 方法
 */
export class BaseProvider {
	/**
	 * @param {string} name - provider 名称
	 */
	constructor(name) {
		this.name = name;
	}

	/**
	 * 是否可用（由各 provider 根据环境变量自行判断）
	 * @returns {boolean}
	 */
	isAvailable() {
		return false;
	}

	/**
	 * 流式聊天
	 * @param {object} options
	 * @param {Array<{role:string, content:string}>} options.messages - 完整上下文
	 * @param {string} options.model - 模型 id
	 * @param {number} [options.temperature]
	 * @param {number} [options.maxTokens]
	 * @param {AbortSignal} [options.signal]
	 * @param {(chunk:string)=>void} options.onChunk
	 * @param {(meta:{tokensIn?:number,tokensOut?:number})=>void} [options.onDone]
	 * @param {(err:Error)=>void} [options.onError]
	 */
	// eslint-disable-next-line no-unused-vars
	async streamChat(options) {
		throw new Error(`Provider ${this.name} must implement streamChat()`);
	}
}
