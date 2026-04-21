/**
 * AiChat 页面 Mock 数据
 * 模拟 SSE 流式响应和静态数据
 */

// Mock 历史会话列表
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

// Mock 欢迎消息
export const WELCOME_MESSAGE = `## 👋 你好，我是 AI 助手

我可以帮你：
- 📝 **文本创作**：撰写文章、改写润色、翻译
- 💻 **代码辅助**：代码生成、调试、解释、重构
- 📊 **数据分析**：数据处理、图表解读、统计分析
- 🖼️ **图片理解**：图片内容识别、OCR、描述
- 📄 **文档处理**：Markdown 文档解析、总结

> 💡 你可以在右上角选择不同的模型和调整参数，获得更合适的回答。

请输入你的问题开始对话吧！`;

/**
 * Mock 流式响应数据生成
 * 模拟 SSE 数据分段返回
 * @param {string} userContent - 用户输入内容
 * @param {string} model - 模型名称
 * @returns {Array<string>} 分段响应内容
 */
export const getMockStreamChunks = (userContent = '', model = 'gpt-4o') => {
	const lowerContent = userContent.toLowerCase();

	// 代码类问题
	if (
		lowerContent.includes('代码') ||
		lowerContent.includes('code') ||
		lowerContent.includes('函数')
	) {
		return [
			'好的，我来为你展示一个示例代码：\n\n',
			'```javascript\n',
			'// 使用 React Hooks 实现计数器\n',
			"import { useState, useCallback } from 'react';\n\n",
			'const Counter = () => {\n',
			'  const [count, setCount] = useState(0);\n\n',
			'  const handleIncrement = useCallback(() => {\n',
			'    setCount((prev) => prev + 1);\n',
			'  }, []);\n\n',
			'  return (\n',
			'    <div>\n',
			'      <p>当前计数: {count}</p>\n',
			'      <button onClick={handleIncrement}>增加</button>\n',
			'    </div>\n',
			'  );\n',
			'};\n',
			'\nexport default Counter;\n',
			'```\n\n',
			'**关键点说明：**\n',
			'1. 使用 `useState` 管理状态\n',
			'2. 使用 `useCallback` 缓存函数引用，避免不必要的渲染\n',
			'3. 使用函数式 setState 获取最新的 state 值\n',
		];
	}

	// 列表类问题
	if (
		lowerContent.includes('列表') ||
		lowerContent.includes('有哪些') ||
		lowerContent.includes('步骤')
	) {
		return [
			'下面是我的回答，按步骤列出：\n\n',
			'### 主要步骤\n\n',
			'1. **需求分析**：明确目标和范围\n',
			'2. **方案设计**：制定技术方案\n',
			'3. **编码实现**：按规范编写代码\n',
			'4. **测试验证**：单元测试 + 集成测试\n',
			'5. **部署上线**：灰度发布 + 监控\n\n',
			'### 注意事项\n\n',
			'- 保持代码**可读性**和**可维护性**\n',
			'- 充分考虑**边界情况**\n',
			'- 做好**异常处理**\n\n',
			'希望对你有帮助！😊',
		];
	}

	// 图片类问题
	if (lowerContent.includes('图片') || lowerContent.includes('image')) {
		return [
			'我已经分析了你提供的图片。\n\n',
			'**图片内容：**\n',
			'从图片中可以识别出以下元素：\n',
			'- 主体对象\n',
			'- 背景信息\n',
			'- 色彩构成\n\n',
			'**分析结论：**\n',
			'这是一张内容丰富的图片，可以用于多种场景...\n\n',
			'如果你需要更详细的分析，请告诉我具体关注哪个方面。',
		];
	}

	// 默认回答
	return [
		`你好！我是 **${model}** 模型。\n\n`,
		'关于你的问题"',
		userContent.substring(0, 30),
		userContent.length > 30 ? '...' : '',
		'"，我的回答如下：\n\n',
		'这是一个非常好的问题。我来为你详细解答：\n\n',
		'### 核心观点\n\n',
		'首先，我们需要理解问题的**本质**。',
		'在实际应用中，通常需要考虑以下几个方面：\n\n',
		'1. 第一个方面：需要从整体架构入手\n',
		'2. 第二个方面：关注具体实现细节\n',
		'3. 第三个方面：考虑边界和异常情况\n\n',
		'### 建议方案\n\n',
		'> 💡 **提示**：具体方案需要结合实际场景。\n\n',
		'如果你有更具体的需求，欢迎继续提问！',
	];
};

/**
 * 模拟 SSE 流式返回
 * @param {Function} onChunk - 每次收到数据块的回调
 * @param {Function} onDone - 完成的回调
 * @param {Object} options - { userContent, model, signal }
 * @returns {Promise}
 */
export const mockSSEStream = ({ onChunk, onDone, onError, userContent, model, signal }) => {
	const chunks = getMockStreamChunks(userContent, model);
	let index = 0;
	let aborted = false;

	// 监听中止信号
	if (signal) {
		signal.addEventListener('abort', () => {
			aborted = true;
		});
	}

	return new Promise((resolve) => {
		const pushChunk = () => {
			if (aborted) {
				onError?.(new Error('请求已取消'));
				resolve();
				return;
			}

			if (index >= chunks.length) {
				onDone?.();
				resolve();
				return;
			}

			onChunk?.(chunks[index]);
			index += 1;

			// 模拟网络延迟，每段 50-150ms
			const delay = 50 + Math.random() * 100;
			setTimeout(pushChunk, delay);
		};

		// 首次请求延迟 300ms，模拟首字节时间
		setTimeout(pushChunk, 300);
	});
};
