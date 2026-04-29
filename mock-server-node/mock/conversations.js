/**
 * Mock 历史会话数据
 */

export const MOCK_CONVERSATIONS = [
	{
		id: 'conv_001',
		title: '关于 React Hooks 使用规范',
		updateTime: '2026-04-20 15:30',
	},
	{
		id: 'conv_002',
		title: 'Python 数据分析入门指南',
		updateTime: '2026-04-19 10:20',
	},
	{
		id: 'conv_003',
		title: '如何优化前端性能',
		updateTime: '2026-04-18 14:05',
	},
];

export const MOCK_CONVERSATION_MESSAGES = {
	conv_001: [
		{
			id: 'm1',
			role: 'user',
			content: 'React Hooks 有哪些使用规范？',
			createTime: '2026-04-20 15:20',
		},
		{
			id: 'm2',
			role: 'assistant',
			content:
				'React Hooks 有两条核心规则：\n\n1. **只在最顶层调用 Hook**\n2. **只在 React 函数中调用 Hook**',
			createTime: '2026-04-20 15:21',
		},
	],
	conv_002: [
		{
			id: 'm1',
			role: 'user',
			content: 'Python 数据分析从哪里开始学？',
			createTime: '2026-04-19 10:10',
		},
		{
			id: 'm2',
			role: 'assistant',
			content: '建议先掌握 NumPy 和 Pandas，然后学习 Matplotlib 进行可视化。',
			createTime: '2026-04-19 10:11',
		},
	],
	conv_003: [
		{
			id: 'm1',
			role: 'user',
			content: '前端如何做性能优化？',
			createTime: '2026-04-18 13:55',
		},
		{
			id: 'm2',
			role: 'assistant',
			content: '性能优化可以从加载、渲染、网络三个维度入手。',
			createTime: '2026-04-18 13:56',
		},
	],
};

export const MOCK_MODELS = [
	{ label: 'GPT-4o', value: 'gpt-4o', desc: 'OpenAI 多模态旗舰模型' },
	{ label: 'GPT-4o-mini', value: 'gpt-4o-mini', desc: '轻量快速版本' },
	{ label: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet', desc: 'Anthropic 平衡型模型' },
	{ label: 'Claude 3 Opus', value: 'claude-3-opus', desc: 'Anthropic 最强模型' },
	{ label: '混元大模型 Pro', value: 'hunyuan-pro', desc: '腾讯混元专业版' },
	{ label: '混元大模型 Lite', value: 'hunyuan-lite', desc: '腾讯混元轻量版' },
	{ label: 'DeepSeek-V3', value: 'deepseek-v3', desc: '深度求索通用大模型' },
];
