/**
 * SSE 流式对话 Hook
 * @description 管理对话消息、SSE 连接、中止请求、会话持久化联动
 *   - 默认走真实 SSE 接口（通过 vite 代理到 mock-server/3001）
 *   - 支持 conversationId：首轮由后端返回，后续请求自动带上，实现多轮上下文
 *   - 可通过 VITE_USE_MOCK=true 切回前端纯 mock，适合断网/离线场景
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { MessagePlugin } from 'tdesign-react';
import { MESSAGE_ROLE } from '../utils/constants';
import { mockSSEStream, WELCOME_MESSAGE } from '../utils/mock';

// 是否使用前端内置 mock（默认 false，走真实 SSE 接口）
const USE_FRONTEND_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
// SSE 接口地址（通过 vite 代理转发到 mock-server）
const CHAT_SSE_URL = '/api/chat/completions';
// 会话列表接口
const CONVERSATIONS_URL = '/api/conversations';

/**
 * 真实 SSE 请求实现
 * 使用 fetch + ReadableStream 解析 SSE 数据流
 *
 * @param {object} options
 * @param {(meta:object)=>void} [options.onMeta]  - 收到首帧 meta 时回调（含 conversationId）
 */
const realSSEStream = async ({ url, payload, onMeta, onChunk, onDone, onError, signal }) => {
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
				// 按 W3C EventSource 规范解析：
				//   - 以 "data:" 开头（冒号后空格可选，Node 版带空格、Java Spring 不带）
				//   - 以 ":" 开头的是注释行（心跳 ": heartbeat"），忽略即可
				//   - 其他行忽略
				if (!line.startsWith('data:')) continue;
				// 去掉前缀 "data:"，再裁掉紧邻的 1 个可选空格
				let data = line.slice(5);
				if (data.startsWith(' ')) data = data.slice(1);
				if (data === '[DONE]') {
					onDone?.();
					return;
				}
				try {
					const parsed = JSON.parse(data);
					// 兼容错误帧
					if (parsed.error) {
						onError?.(new Error(parsed.error.message || '服务端返回错误'));
						return;
					}
					// 元数据帧（由 mock-server 推送，含 conversationId / messageId / provider）
					if (parsed.type === 'meta') {
						onMeta?.(parsed);
						continue;
					}
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
	// 当前会话 id（由后端首次响应返回；切换历史会话时由外部 setActiveConversation 注入）
	const [conversationId, setConversationId] = useState(null);

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

	// 历史会话列表相关
	const [conversations, setConversations] = useState([]);
	const [conversationsLoading, setConversationsLoading] = useState(false);

	const abortControllerRef = useRef(null);

	/**
	 * 拉取历史会话列表
	 * - 页面首次挂载自动调用
	 * - 每轮对话完成后自动刷新，保证新会话能实时出现
	 */
	const fetchConversationList = useCallback(async () => {
		setConversationsLoading(true);
		try {
			const res = await fetch(CONVERSATIONS_URL);
			const json = await res.json();
			if (json.code !== 0) {
				MessagePlugin.error(json.message || '加载会话列表失败');
				return;
			}
			setConversations(Array.isArray(json.data) ? json.data : []);
		} catch (err) {
			console.error('获取会话列表失败:', err);
		} finally {
			setConversationsLoading(false);
		}
	}, []);

	// 首次挂载自动拉取一次
	useEffect(() => {
		fetchConversationList();
	}, [fetchConversationList]);

	/**
	 * 发送消息并启动 SSE 流式接收
	 * @param {Object} payload - { content, attachments, modelConfig }
	 */
	const sendMessage = useCallback(
		async (payload) => {
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

			// 3. 开始 SSE 流式接收
			try {
				const streamFn = USE_FRONTEND_MOCK ? mockSSEStream : realSSEStream;
				await streamFn({
					// realSSEStream 参数
					url: CHAT_SSE_URL,
					payload: {
						conversationId, // 关键：带上会话 id 实现多轮上下文
						content,
						attachments,
						model: modelConfig.model,
						temperature: modelConfig.temperature,
						maxTokens: modelConfig.maxTokens,
						topP: modelConfig.topP,
						systemPrompt: modelConfig.systemPrompt,
						stream: true,
					},
					// mockSSEStream 参数（两个函数的参数做了合并，互不冲突）
					userContent: content,
					model: modelConfig.model,
					signal: controller.signal,
					onMeta: (meta) => {
						// 首帧：后端返回真正的 conversationId
						if (meta?.conversationId) {
							setConversationId(meta.conversationId);
						}
						// 降级提示：无可用密钥时后端自动 fallback 到 mock
						if (meta?.fallback) {
							MessagePlugin.info(
								`未检测到 ${meta.requestedProvider} 的密钥，已降级到 Mock 模式`,
								2000,
							);
						}
					},
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
							prev.map((msg) =>
								msg.id === aiMsgId ? { ...msg, loading: false, done: true } : msg,
							),
						);
						// 对话完成：刷新一次会话列表（新建或 updateTime 更新）
						fetchConversationList();
					},
					onError: (err) => {
						// 请求被主动取消，不视为错误
						if (err?.message === '请求已取消') return;
						setMessages((prev) =>
							prev.map((msg) =>
								msg.id === aiMsgId
									? {
											...msg,
											content: `❌ 请求失败：${err?.message || '请稍后重试'}`,
											error: true,
											loading: false,
										}
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
		},
		[conversationId, fetchConversationList],
	);

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
	 * 注意：只清空当前 UI 状态，不删除服务端会话
	 * 重置 conversationId，下次发送会创建新会话
	 */
	const clearMessages = useCallback(() => {
		abortControllerRef.current?.abort();
		setConversationId(null);
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
	 * 加载某个历史会话
	 * @param {string} id - conversationId
	 */
	const loadConversation = useCallback(async (id) => {
		if (!id) return;
		abortControllerRef.current?.abort();
		try {
			const res = await fetch(`/api/conversations/${id}/messages`);
			const json = await res.json();
			if (json.code !== 0) {
				MessagePlugin.error(json.message || '加载会话失败');
				return;
			}
			const list = (json.data?.messages || []).map((m) => ({
				id: m.id,
				role: m.role,
				content: m.content,
				model: m.model,
				attachments: m.attachments || [],
				createTime: m.createTime,
				error: m.finishReason === 'error',
				done: true,
			}));
			setConversationId(id);
			setMessages(
				list.length
					? list
					: [
							{
								id: 'welcome',
								role: MESSAGE_ROLE.ASSISTANT,
								content: WELCOME_MESSAGE,
								createTime: '',
							},
						],
			);
		} catch (err) {
			MessagePlugin.error(`加载会话失败：${err?.message}`);
		}
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

	/**
	 * 删除某个历史会话（带确认建议在调用方做）
	 * @param {string} id - conversationId
	 */
	const deleteConversation = useCallback(
		async (id) => {
			if (!id) return;
			try {
				const res = await fetch(`${CONVERSATIONS_URL}/${id}`, { method: 'DELETE' });
				const json = await res.json();
				if (json.code !== 0) {
					MessagePlugin.error(json.message || '删除会话失败');
					return;
				}
				MessagePlugin.success('已删除');
				// 如果删的是当前会话，UI 需要回到"新会话"状态
				setConversationId((prev) => {
					if (prev === id) {
						setMessages([
							{
								id: 'welcome',
								role: MESSAGE_ROLE.ASSISTANT,
								content: WELCOME_MESSAGE,
								createTime: '',
							},
						]);
						return null;
					}
					return prev;
				});
				// 乐观更新 + 异步兜底刷新
				setConversations((prev) => prev.filter((c) => c.id !== id));
				fetchConversationList();
			} catch (err) {
				MessagePlugin.error(`删除会话失败：${err?.message}`);
			}
		},
		[fetchConversationList],
	);

	return {
		conversationId,
		messages,
		loading,
		sendMessage,
		abort,
		clearMessages,
		regenerate,
		loadConversation,
		// 历史会话
		conversations,
		conversationsLoading,
		fetchConversationList,
		deleteConversation,
	};
};
