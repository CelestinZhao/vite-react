/**
 * SSE 流式对话 Hook
 * @description 管理对话消息、SSE 连接、中止请求等逻辑
 * 当前使用 mock 数据，后续接入真实 SSE 接口时只需替换 mockSSEStream 部分
 */
import { useState, useRef, useCallback } from 'react';
import { MessagePlugin } from 'tdesign-react';
import { MESSAGE_ROLE } from '../utils/constants';
import { mockSSEStream, WELCOME_MESSAGE } from '../utils/mock';

/**
 * 真实 SSE 请求的实现（预留，当前未使用）
 * 使用 fetch + ReadableStream 解析 SSE 数据流
 */
// eslint-disable-next-line no-unused-vars
const realSSEStream = async ({ url, payload, onChunk, onDone, onError, signal }) => {
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
			signal,
		});

		if (!response.ok) {
			throw new Error(`请求失败: ${response.status}`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		// 循环读取流数据
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			// SSE 数据以 \n\n 分隔
			const lines = buffer.split('\n\n');
			buffer = lines.pop();

			for (const line of lines) {
				if (!line.startsWith('data: ')) continue;
				const data = line.slice(6);
				if (data === '[DONE]') {
					onDone?.();
					return;
				}
				try {
					const parsed = JSON.parse(data);
					const content = parsed.delta?.content || parsed.choices?.[0]?.delta?.content || '';
					if (content) onChunk?.(content);
				} catch {
					// 忽略无法解析的行
				}
			}
		}

		onDone?.();
	} catch (err) {
		if (err.name !== 'AbortError') {
			onError?.(err);
		}
	}
};

const genId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSSEChat = () => {
	// 消息列表：初始化时带一条欢迎消息
	const [messages, setMessages] = useState([
		{
			id: 'welcome',
			role: MESSAGE_ROLE.ASSISTANT,
			content: WELCOME_MESSAGE,
			createTime: '',
		},
	]);
	const [loading, setLoading] = useState(false);
	const abortControllerRef = useRef(null);

	/**
	 * 发送消息并启动 SSE 流式接收
	 * @param {Object} payload - { content, attachments, modelConfig }
	 */
	const sendMessage = useCallback(async (payload) => {
		const { content, attachments = [], modelConfig = {} } = payload;

		if (!content?.trim() && attachments.length === 0) {
			MessagePlugin.warning('请输入消息或上传附件');
			return;
		}

		// 中止上一次未完成的请求
		abortControllerRef.current?.abort();
		const controller = new AbortController();
		abortControllerRef.current = controller;

		// 1. 添加用户消息
		const userMsg = {
			id: genId(),
			role: MESSAGE_ROLE.USER,
			content,
			attachments,
			createTime: new Date().toLocaleString(),
		};

		// 2. 添加 AI 回复占位消息
		const aiMsgId = genId();
		const aiMsg = {
			id: aiMsgId,
			role: MESSAGE_ROLE.ASSISTANT,
			content: '',
			loading: true,
			model: modelConfig.model,
			createTime: new Date().toLocaleString(),
		};

		setMessages((prev) => [...prev, userMsg, aiMsg]);
		setLoading(true);

		// 3. 开始 SSE 流式接收（mock 实现）
		try {
			await mockSSEStream({
				userContent: content,
				model: modelConfig.model,
				signal: controller.signal,
				onChunk: (chunk) => {
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === aiMsgId
								? { ...msg, content: (msg.content || '') + chunk, loading: false }
								: msg,
						),
					);
				},
				onDone: () => {
					setMessages((prev) =>
						prev.map((msg) => (msg.id === aiMsgId ? { ...msg, loading: false, done: true } : msg)),
					);
				},
				onError: (err) => {
					// 请求被主动取消，不视为错误
					if (err?.message === '请求已取消') return;
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === aiMsgId
								? { ...msg, content: '❌ 请求失败，请稍后重试', error: true, loading: false }
								: msg,
						),
					);
				},
			});
		} catch (err) {
			console.error('SSE 请求异常:', err);
		} finally {
			setLoading(false);
			abortControllerRef.current = null;
		}
	}, []);

	/**
	 * 中止当前请求
	 */
	const abort = useCallback(() => {
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
		setLoading(false);

		// 把最后一条正在加载的 AI 消息标记为已停止
		setMessages((prev) => {
			const last = prev[prev.length - 1];
			if (last && last.role === MESSAGE_ROLE.ASSISTANT && last.loading) {
				return prev.map((msg) =>
					msg.id === last.id
						? {
								...msg,
								loading: false,
								content: `${msg.content || ''}\n\n> ⏹ 已停止生成`,
							}
						: msg,
				);
			}
			return prev;
		});
	}, []);

	/**
	 * 清空对话（保留欢迎消息）
	 */
	const clearMessages = useCallback(() => {
		abortControllerRef.current?.abort();
		setMessages([
			{
				id: 'welcome',
				role: MESSAGE_ROLE.ASSISTANT,
				content: WELCOME_MESSAGE,
				createTime: '',
			},
		]);
		setLoading(false);
	}, []);

	/**
	 * 重新生成最后一条回复
	 */
	const regenerate = useCallback(() => {
		// 找到最后一条用户消息
		const lastUserMsg = [...messages].reverse().find((msg) => msg.role === MESSAGE_ROLE.USER);
		if (!lastUserMsg) {
			MessagePlugin.warning('没有可重新生成的消息');
			return;
		}
		// 移除最后一条 AI 回复
		setMessages((prev) => {
			const lastAiIdx = prev.map((m) => m.role).lastIndexOf(MESSAGE_ROLE.ASSISTANT);
			if (lastAiIdx === -1 || prev[lastAiIdx].id === 'welcome') return prev;
			return prev.slice(0, lastAiIdx);
		});
		// 重新发送
		sendMessage({
			content: lastUserMsg.content,
			attachments: lastUserMsg.attachments || [],
			modelConfig: {},
		});
	}, [messages, sendMessage]);

	return {
		messages,
		loading,
		sendMessage,
		abort,
		clearMessages,
		regenerate,
	};
};
