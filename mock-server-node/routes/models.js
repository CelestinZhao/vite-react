/**
 * /api/models 可选模型列表
 */
import Router from '@koa/router';
import { MOCK_MODELS } from '../mock/conversations.js';

const router = new Router();

router.get('/models', (ctx) => {
	ctx.body = { code: 0, message: 'ok', data: MOCK_MODELS };
});

export default router;
