/// <reference types="vite/client" />

// CSS Modules（.module.less / .module.css）类型声明
declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.module.less' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

// 普通样式文件（副作用导入）
declare module '*.css';
declare module '*.less';

// xlsx / csv 资源类型（配合 vite.config.js 中的 assetsInclude）
declare module '*.xlsx' {
	const src: string;
	export default src;
}
declare module '*.xls' {
	const src: string;
	export default src;
}
declare module '*.csv' {
	const src: string;
	export default src;
}

// 外部 CDN 全局变量（配合 vite-plugin-externals）
declare const XLSX: typeof import('xlsx');
declare const Tesseract: {
	recognize: (
		image: string | File | Blob | HTMLImageElement | HTMLCanvasElement,
		langs?: string,
		options?: Record<string, unknown>,
	) => Promise<{ data: { text: string; [key: string]: unknown } }>;
	[key: string]: unknown;
};
