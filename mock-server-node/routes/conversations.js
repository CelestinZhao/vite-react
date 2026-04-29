/**
 * /api/conversations 会话管理（DB 持久化）
 */
import Router from '@koa/router';
import {
	listConversations,
	getConversation,
	createConversation,
	updateConversation,
	deleteConversation,
} from '../db/dao/conversations.js';
import { listMessagesByConversation } from '../db/dao/messages.js';

const router = new Router();

/**
 * 将 DB 记录格式化为前端友好的结构
 */
const formatConv = (c) => ({
	id: c.id,
	title: c.title,
	model: c.model,
	systemPrompt: c.systemPrompt,
	updateTime: new Date(c.updateTime).toLocaleString('zh-CN', { hour12: false }),
	createTime: new Date(c.createTime).toLocaleString('zh-CN', { hour12: false }),
});

/**
 * GET /api/conversations
 */
router.get('/conversations', (ctx) => {
	const list = listConversations().map(formatConv);
	ctx.body = { code: 0, message: 'ok', data: list };
});

/**
 * POST /api/conversations
 * body: { title?, model?, systemPrompt? }
 */
router.post('/conversations', (ctx) => {
	const { title, model, systemPrompt } = ctx.request.body || {};
	const conv = createConversation({ title, model, systemPrompt });
	ctx.body = { code: 0, message: 'ok', data: formatConv(conv) };
});

/**
 * GET /api/conversations/:id/messages
 */
router.get('/conversations/:id/messages', (ctx) => {
	const { id } = ctx.params;
	const conv = getConversation(id);
	if (!conv) {
		ctx.status = 404;
		ctx.body = { code: 404, message: '会话不存在', data: null };
		return;
	}
	const messages = listMessagesByConversation(id).map((m) => ({
		id: m.id,
		role: m.role,
		content: m.content,
		model: m.model,
		attachments: m.attachments,
		finishReason: m.finishReason,
		error: m.error,
		createTime: new Date(m.createTime).toLocaleString('zh-CN', { hour12: false }),
	}));
	ctx.body = {
		code: 0,
		message: 'ok',
		data: { id, title: conv.title, messages },
	};
});

/**
 * PATCH /api/conversations/:id
 * body: { title? }
 */
router.patch('/conversations/:id', (ctx) => {
	const { id } = ctx.params;
	const { title } = ctx.request.body || {};
	if (!getConversation(id)) {
		ctx.status = 404;
		ctx.body = { code: 404, message: '会话不存在' };
		return;
	}
	const updated = updateConversation(id, { title });
	ctx.body = { code: 0, message: 'ok', data: formatConv(updated) };
});

/**
 * DELETE /api/conversations/:id
 */
router.delete('/conversations/:id', (ctx) => {
	const { id } = ctx.params;
	const ok = deleteConversation(id);
	if (!ok) {
		ctx.status = 404;
		ctx.body = { code: 404, message: '会话不存在' };
		return;
	}
	ctx.body = { code: 0, message: 'ok' };
});

export default router;
