/**
 * /api/providers Provider 可用性探测
 */
import Router from '@koa/router';
import { listProviderStatus } from '../providers/index.js';

const router = new Router();

router.get('/providers', (ctx) => {
	ctx.body = { code: 0, message: 'ok', data: listProviderStatus() };
});

export default router;
