/**
 * 对话 Service
 * @description 编排：DB 读取历史 → 调 Provider → 流式转发 → DB 持久化
 */
import {
	createConversation,
	getConversation,
	touchConversation,
	updateConversation,
} from '../db/dao/conversations.js';
import {
	createMessage,
	finalizeMessage,
	getRecentMessages,
} from '../db/dao/messages.js';
import { resolveProvider } from '../providers/index.js';

const CONTEXT_LIMIT = Number(process.env.CONTEXT_MESSAGE_LIMIT) || 20;

/**
 * 处理一次对话请求
 *
 * @param {object} payload - 前端请求体
 * @param {string} [payload.conversationId] - 会话 id，为空则自动创建
 * @param {string} payload.content - 用户输入
 * @param {string} payload.model
 * @param {Array} [payload.attachments]
 * @param {string} [payload.systemPrompt]
 * @param {number} [payload.temperature]
 * @param {number} [payload.maxTokens]
 *
 * @param {object} handlers
 * @param {(meta:object)=>void} handlers.onMeta  - 首帧元数据（含 conversationId/messageId/provider）
 * @param {(text:string)=>void} handlers.onChunk
 * @param {(result:object)=>void} handlers.onDone
 * @param {(err:Error)=>void} handlers.onError
 * @param {AbortSignal} handlers.signal
 */
export const handleChat = async (payload, handlers) => {
	const {
		conversationId: convIdInput,
		content,
		model = 'gpt-4o',
		attachments = [],
		systemPrompt,
		temperature,
		maxTokens,
	} = payload;
	const { onMeta, onChunk, onDone, onError, signal } = handlers;

	// 1. 解析 / 创建会话
	let conversation = convIdInput ? getConversation(convIdInput) : null;
	if (!conversation) {
		conversation = createConversation({
			title: truncateTitle(content),
			model,
			systemPrompt,
		});
	}

	// 2. 写入用户消息
	const userMsg = createMessage({
		conversationId: conversation.id,
		role: 'user',
		content,
		attachments,
	});

	// 3. 创建占位 assistant 消息（流式过程中追加内容）
	const assistantMsg = createMessage({
		conversationId: conversation.id,
		role: 'assistant',
		content: '',
		model,
	});

	// 4. 解析 Provider
	const { provider, realModel, fallback, requestedProvider } = resolveProvider(model);

	// 5. 推送元数据帧（前端可据此更新 conversationId / 刷新侧边栏）
	onMeta?.({
		conversationId: conversation.id,
		conversationTitle: conversation.title,
		userMessageId: userMsg.id,
		assistantMessageId: assistantMsg.id,
		provider: provider.name,
		requestedProvider,
		fallback,
		realModel,
	});

	// 6. 组装上下文
	const history = getRecentMessages(conversation.id, CONTEXT_LIMIT);
	const messages = [];
	const effectiveSystem = systemPrompt || conversation.systemPrompt;
	if (effectiveSystem) {
		messages.push({ role: 'system', content: effectiveSystem });
	}
	// history 已包含最新的 user 消息（含本轮）
	for (const m of history) {
		if (m.role !== 'system') {
			messages.push({ role: m.role, content: m.content });
		}
	}

	// 7. 流式调用 Provider，同时累积全文以便最终入库
	let fullContent = '';
	let providerError = null;

	await provider.streamChat({
		messages,
		model: realModel,
		temperature,
		maxTokens,
		signal,
		onChunk: (text) => {
			fullContent += text;
			onChunk?.(text);
		},
		onDone: (meta) => {
			const aborted = meta?.aborted || signal?.aborted;
			const finishReason = aborted ? 'abort' : 'stop';

			finalizeMessage(assistantMsg.id, {
				content: fullContent,
				tokensOut: meta?.tokensOut || 0,
				finishReason,
				error: null,
			});
			touchConversation(conversation.id);

			// 首轮对话自动用回复内容优化标题
			if (conversation.title === '新会话' && fullContent) {
				updateConversation(conversation.id, { title: truncateTitle(content) });
			}

			onDone?.({
				conversationId: conversation.id,
				assistantMessageId: assistantMsg.id,
				finishReason,
				contentLength: fullContent.length,
			});
		},
		onError: (err) => {
			providerError = err;
			finalizeMessage(assistantMsg.id, {
				content: fullContent,
				finishReason: 'error',
				error: String(err?.message || err),
			});
			touchConversation(conversation.id);
			onError?.(err);
		},
	});

	return { error: providerError };
};

/**
 * 将用户首条消息截取为标题（最多 20 字）
 */
const truncateTitle = (text) => {
	const t = String(text || '').replace(/\s+/g, ' ').trim();
	if (!t) return '新会话';
	return t.length > 20 ? `${t.slice(0, 20)}...` : t;
};
