/**
 * 示例 TS 文件 —— 用于验证 TypeScript 已成功接入。
 * 后续你新写的业务代码可以直接用 .ts / .tsx，也可以继续用 .js / .jsx。
 */

export interface GreetOptions {
	/** 是否使用大写 */
	uppercase?: boolean;
	/** 语言：中文 or 英文 */
	lang?: 'zh' | 'en';
}

/**
 * 根据名字生成一句问候语
 * @param name 姓名
 * @param options 可选配置
 */
export function greet(name: string, options: GreetOptions = {}): string {
	const { uppercase = false, lang = 'zh' } = options;
	const text = lang === 'zh' ? `你好，${name}！` : `Hello, ${name}!`;
	return uppercase ? text.toUpperCase() : text;
}

export default greet;
