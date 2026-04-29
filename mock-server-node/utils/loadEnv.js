/**
 * 环境变量加载器
 * @description
 *   显式从 mock-server 目录加载 .env.local（优先）与 .env（兜底），
 *   避免 dotenv 默认行为受启动目录(cwd)影响导致密钥读不到。
 *
 * 加载顺序（先到先得，已存在的 key 不会被覆盖，符合 dotenv 官方语义）：
 *   1. .env.local  ← 真实密钥，.gitignore 已屏蔽
 *   2. .env        ← 公共默认值（可选）
 *
 * 本模块必须最先被 import（在任何读取 process.env 的模块之前）。
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// mock-server 根目录
const ROOT = resolve(__dirname, '..');

const candidates = ['.env.local', '.env'];
const loaded = [];

for (const f of candidates) {
	const p = resolve(ROOT, f);
	if (existsSync(p)) {
		config({ path: p, override: false }); // 已存在的 env 不覆盖
		loaded.push(f);
	}
}

if (loaded.length) {
	console.log(`[env] loaded: ${loaded.join(', ')} (from ${ROOT})`);
} else {
	console.log(`[env] no .env file found in ${ROOT}, using process env only`);
}
