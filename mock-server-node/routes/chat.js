/**
 * /api/chat/completions  SSE 长链接接口
 * @description
 *  - 首帧推送 meta（含 conversationId、messageId）
 *  - 随后推送 OpenAI 兼容 chunk
 *  - 结束帧 [DONE]
 *  - 支持通过 URL query 开关：?mockError=1 强制错误 / ?latency=slow 慢网络
 */
import Router from '@koa/router';
import { initSSE, sendChunk, sendDone, sendError, startHeartbeat } from '../utils/sse.js';
import { handleChat } from '../services/chatService.js';

const router = new Router();

const randomChunkId = () => `chatcmpl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * POST /api/chat/completions
 */
router.post('/chat/completions', async (ctx) => {
	const body = ctx.request.body || {};
	const { content = '', model = 'gpt-4o', conversationId } = body;
	const { mockError } = ctx.query;

	console.log(
		`[chat] conv=${conversationId || 'NEW'} model=${model} content="${String(content).slice(0, 40)}"`,
	);

	// 初始化 SSE
	initSSE(ctx);

	// 调试用：强制错误流
	if (mockError === '1') {
		await new Promise((r) => setTimeout(r, 200));
		sendError(ctx, { code: 'MOCK_ERROR', message: '这是一条模拟的错误响应' });
		return;
	}

	// 客户端断开 → 构造 AbortController 传入 Provider
	// 注意：监听 ctx.res 的 close 事件比 ctx.req 更可靠
	// （Koa 的 req.on('close') 在某些平台下不会及时触发）
	const abortController = new AbortController();
	const handleClose = () => {
		console.log('[chat] client disconnected, aborting stream');
		abortController.abort();
	};
	ctx.req.on('close', handleClose);
	ctx.res.on('close', handleClose);

	const stopHeartbeat = startHeartbeat(ctx, 15000);
	const chunkId = randomChunkId();
	const created = Math.floor(Date.now() / 1000);

	try {
		await handleChat(
			{ ...body },
			{
				signal: abortController.signal,
				onMeta: (meta) => {
					// 首帧：自定义 meta 帧（前端可识别 type=meta）
					sendChunk(ctx, { type: 'meta', ...meta });
				},
				onChunk: (text) => {
					// OpenAI 兼容 chunk，前端 realSSEStream 会解析
					sendChunk(ctx, {
						id: chunkId,
						object: 'chat.completion.chunk',
						created,
						model,
						delta: { content: text },
						choices: [
							{
								index: 0,
								delta: { content: text },
								finish_reason: null,
							},
						],
					});
				},
				onDone: (result) => {
					sendChunk(ctx, {
						id: chunkId,
						object: 'chat.completion.chunk',
						created,
						model,
						delta: {},
						choices: [{ index: 0, delta: {}, finish_reason: result.finishReason || 'stop' }],
					});
					sendDone(ctx);
				},
				onError: (err) => {
					console.error('[chat] provider error:', err?.message);
					sendError(ctx, err);
				},
			},
		);
	} catch (err) {
		if (!abortController.signal.aborted) {
			sendError(ctx, err);
		}
	} finally {
		stopHeartbeat();
	}
});

export default router;
