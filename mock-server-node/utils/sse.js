/**
 * SSE 工具函数
 * @description 统一封装 SSE 响应头、chunk 推送、心跳、结束/错误信号
 */

/**
 * 初始化 SSE 响应头
 * - ctx.req 是 Node 原生 req / ctx.res 是 Node 原生 res
 * - 关键：Cache-Control 禁用缓存；X-Accel-Buffering 禁用代理层（Nginx）的缓冲
 * - flushHeaders 立即把头发出去，避免 Koa 默认到 end 才 flush 造成首字节延迟
 */
export const initSSE = (ctx) => {
	ctx.set({
		'Content-Type': 'text/event-stream; charset=utf-8',
		'Cache-Control': 'no-cache, no-transform',
		Connection: 'keep-alive',
		'X-Accel-Buffering': 'no',
	});
	ctx.status = 200;
	// Koa 默认 ctx.respond=true 会接管 res.end，对流式接口必须关掉
	ctx.respond = false;
	ctx.res.flushHeaders?.();
};

/**
 * 推送一个 data 事件
 * @param {import('koa').Context} ctx
 * @param {object|string} payload
 */
export const sendChunk = (ctx, payload) => {
	// 连接已断开则跳过写入，避免 EPIPE 崩溃
	if (ctx.res.writableEnded || ctx.res.destroyed) return false;
	const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
	try {
		ctx.res.write(`data: ${data}\n\n`);
		return true;
	} catch {
		return false;
	}
};

/**
 * 发送 [DONE] 结束标记并关闭连接
 */
export const sendDone = (ctx) => {
	ctx.res.write('data: [DONE]\n\n');
	ctx.res.end();
};

/**
 * 发送错误帧（符合前端 realSSEStream 的 onError 触发逻辑）
 */
export const sendError = (ctx, error) => {
	const payload = {
		error: {
			code: error?.code || 'INTERNAL_ERROR',
			message: error?.message || String(error),
		},
	};
	ctx.res.write(`data: ${JSON.stringify(payload)}\n\n`);
	ctx.res.write('data: [DONE]\n\n');
	ctx.res.end();
};

/**
 * 启动心跳：每 interval 毫秒发送注释行，防止代理层超时断连
 * 返回 clear 函数
 */
export const startHeartbeat = (ctx, interval = 15000) => {
	const timer = setInterval(() => {
		try {
			ctx.res.write(': heartbeat\n\n');
		} catch {
			clearInterval(timer);
		}
	}, interval);
	return () => clearInterval(timer);
};
