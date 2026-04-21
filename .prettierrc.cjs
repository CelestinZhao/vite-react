/** @type {import("prettier").Config} */
module.exports = {
	// 一行最大字符数
	printWidth: 100,
	// 使用 Tab 缩进（与项目现有风格一致）
	useTabs: true,
	tabWidth: 2,
	// 使用单引号
	singleQuote: true,
	// JSX 中也使用单引号
	jsxSingleQuote: false,
	// 语句末尾添加分号
	semi: true,
	// 对象、数组等末尾添加逗号
	trailingComma: 'all',
	// 对象大括号内两侧加空格 { foo: bar }
	bracketSpacing: true,
	// JSX 的右尖括号不换行
	bracketSameLine: false,
	// 箭头函数单个参数也带括号
	arrowParens: 'always',
	// 换行符统一使用 lf
	endOfLine: 'lf',
};
