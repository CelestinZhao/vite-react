/**
 * Provider 注册表与路由
 * @description
 *   - 启动时读取环境变量，初始化可用 Provider
 *   - 根据模型 id 自动路由到对应 Provider
 *   - 无任何密钥时自动降级到 Mock
 */
import { OpenAICompatibleProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { MockProvider } from './mock.js';

// 模型 → provider 映射
const MODEL_TO_PROVIDER = {
	'gpt-4o': 'openai',
	'gpt-4o-mini': 'openai',
	'claude-3.5-sonnet': 'anthropic',
	'claude-3-opus': 'anthropic',
	'hunyuan-pro': 'hunyuan',
	'hunyuan-lite': 'hunyuan',
	'deepseek-v3': 'deepseek',
	mock: 'mock',
};

// 不同 provider 真实模型 id 映射（前端用的别名 → 服务端真实 id）
const MODEL_ID_MAPPING = {
	'claude-3.5-sonnet': 'claude-3-5-sonnet-latest',
	'claude-3-opus': 'claude-3-opus-latest',
	'deepseek-v3': 'deepseek-chat',
	'hunyuan-pro': 'hunyuan-pro',
	'hunyuan-lite': 'hunyuan-lite',
};

let providers = null;
let mockProvider = null;

/**
 * 初始化所有 Provider（仅首次调用时执行）
 */
export const initProviders = () => {
	if (providers) return providers;

	mockProvider = new MockProvider();

	providers = {
		openai: new OpenAICompatibleProvider({
			name: 'openai',
			apiKey: process.env.OPENAI_API_KEY,
			baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
		}),
		hunyuan: new OpenAICompatibleProvider({
			name: 'hunyuan',
			apiKey: process.env.HUNYUAN_API_KEY,
			baseURL: process.env.HUNYUAN_BASE_URL || 'https://api.hunyuan.cloud.tencent.com/v1',
		}),
		deepseek: new OpenAICompatibleProvider({
			name: 'deepseek',
			apiKey: process.env.DEEPSEEK_API_KEY,
			baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
		}),
		anthropic: new AnthropicProvider({
			apiKey: process.env.ANTHROPIC_API_KEY,
		}),
		mock: mockProvider,
	};

	const availables = Object.entries(providers)
		.filter(([, p]) => p.isAvailable())
		.map(([name]) => name);
	console.log(`[providers] available: ${availables.join(', ')}`);

	return providers;
};

/**
 * 根据模型 id 获取 provider 和真实模型 id
 * 无可用 provider 时降级到 mock
 */
export const resolveProvider = (modelId) => {
	if (!providers) initProviders();

	const providerName = MODEL_TO_PROVIDER[modelId] || 'mock';
	const provider = providers[providerName];

	// 未配置密钥 → 降级 mock
	if (!provider?.isAvailable()) {
		return {
			provider: mockProvider,
			realModel: modelId,
			fallback: providerName !== 'mock',
			requestedProvider: providerName,
		};
	}

	return {
		provider,
		realModel: MODEL_ID_MAPPING[modelId] || modelId,
		fallback: false,
		requestedProvider: providerName,
	};
};

/**
 * 列出可用 provider（含状态），供 /api/providers 使用
 */
export const listProviderStatus = () => {
	if (!providers) initProviders();
	return Object.entries(providers).map(([name, p]) => ({
		name,
		available: p.isAvailable(),
	}));
};
