/**
 * AiChat 页面常量
 */

// 消息角色
export const MESSAGE_ROLE = {
	USER: 'user',
	ASSISTANT: 'assistant',
	SYSTEM: 'system',
};

// 附件类型
export const ATTACHMENT_TYPE = {
	IMAGE: 'image',
	MARKDOWN: 'markdown',
	FILE: 'file',
};

// 可选模型列表
export const MODEL_OPTIONS = [
	{ label: 'GPT-4o', value: 'gpt-4o', desc: 'OpenAI 多模态旗舰模型' },
	{ label: 'GPT-4o-mini', value: 'gpt-4o-mini', desc: '轻量快速版本' },
	{ label: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet', desc: 'Anthropic 平衡型模型' },
	{ label: 'Claude 3 Opus', value: 'claude-3-opus', desc: 'Anthropic 最强模型' },
	{ label: '混元大模型 Pro', value: 'hunyuan-pro', desc: '腾讯混元专业版' },
	{ label: '混元大模型 Lite', value: 'hunyuan-lite', desc: '腾讯混元轻量版' },
	{ label: 'DeepSeek-V3', value: 'deepseek-v3', desc: '深度求索通用大模型' },
];

// 默认模型配置
export const DEFAULT_MODEL_CONFIG = {
	model: 'gpt-4o',
	temperature: 0.7,
	maxTokens: 4096,
	topP: 1,
	stream: true,
	systemPrompt: '你是一个专业、友好的 AI 助手，回答要准确、简洁、有条理。',
};

// 支持的文件类型
export const ACCEPT_FILE_TYPES = 'image/*,.md,.txt';

// 单个文件最大大小 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 最大附件数
export const MAX_ATTACHMENT_COUNT = 5;
