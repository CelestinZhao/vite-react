/**
 * Koa 后端服务入口
 * @description
 *  - Koa + SQLite + 多模型 Provider 架构
 *  - 未配置密钥时自动降级到 Mock，保证开箱即用
 *  - 所有接口统一前缀 /api
 */
import './utils/loadEnv.js'; // 必须最先加载：显式读取 mock-server/.env.local 与 .env
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';

import { getDB, closeDB } from './db/index.js';
import { initProviders } from './providers/index.js';

import chatRouter from './routes/chat.js';
import conversationsRouter from './routes/conversations.js';
import modelsRouter from './routes/models.js';
import providersRouter from './routes/providers.js';

const PORT = Number(process.env.MOCK_PORT) || 3001;

// 启动前先初始化 DB + Provider（快速失败）
getDB();
initProviders();

const app = new Koa();

// 全局错误兜底
app.on('error', (err, ctx) => {
	console.error('[server error]', err?.message, 'url=', ctx?.url);
});

// 请求日志
app.use(async (ctx, next) => {
	const start = Date.now();
	try {
		await next();
	} finally {
		const ms = Date.now() - start;
		if (!ctx.path.startsWith('/api/chat/completions')) {
			console.log(`[${ctx.method}] ${ctx.url} ${ctx.status} - ${ms}ms`);
		} else {
			console.log(`[${ctx.method}] ${ctx.url} [SSE] connected`);
		}
	}
});

// CORS
app.use(
	cors({
		origin: (ctx) => ctx.get('Origin') || '*',
		credentials: true,
	}),
);

// body 解析
app.use(
	bodyParser({
		enableTypes: ['json', 'form'],
		jsonLimit: '5mb',
	}),
);

// 路由聚合 /api
const apiRouter = new Router({ prefix: '/api' });
apiRouter.use(chatRouter.routes(), chatRouter.allowedMethods());
apiRouter.use(conversationsRouter.routes(), conversationsRouter.allowedMethods());
apiRouter.use(modelsRouter.routes(), modelsRouter.allowedMethods());
apiRouter.use(providersRouter.routes(), providersRouter.allowedMethods());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// 健康检查
app.use(async (ctx, next) => {
	if (ctx.path === '/health') {
		ctx.body = { status: 'ok', ts: Date.now() };
		return;
	}
	await next();
});

const server = app.listen(PORT, () => {
	console.log(`\n🚀 AiChat server running at http://127.0.0.1:${PORT}`);
	console.log(`   - POST   /api/chat/completions          (SSE)`);
	console.log(`   - GET    /api/conversations`);
	console.log(`   - POST   /api/conversations`);
	console.log(`   - GET    /api/conversations/:id/messages`);
	console.log(`   - PATCH  /api/conversations/:id`);
	console.log(`   - DELETE /api/conversations/:id`);
	console.log(`   - GET    /api/models`);
	console.log(`   - GET    /api/providers`);
	console.log(`   - GET    /health\n`);
});

// 优雅退出
const shutdown = (sig) => {
	console.log(`\n[${sig}] shutting down...`);
	server.close(() => {
		closeDB();
		process.exit(0);
	});
	// 5s 强退
	setTimeout(() => process.exit(1), 5000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
