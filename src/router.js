import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './Layout';

// 路由配置：新增页面只需在此数组中追加一项
const routeConfig = [
	{ path: '/', loader: () => import('./container/mainPage') },
	{ path: '/demo', loader: () => import('./container/demo') },
	{ path: '/dragDemo', loader: () => import('./container/dragDemo') },
	{ path: '/dndKit', loader: () => import('./container/dndKit') },
	{ path: '/aiChat', loader: () => import('./container/aiChat') },
	{ path: '/waterfall', loader: () => import('./container/waterfall') },
];

// 工厂函数：将 loader 转换为 v6.4 路由级 lazy 属性
// v6.4 lazy 要求返回 { Component, loader?, action?, errorElement? } 形式
const children = routeConfig.map(({ path, loader }) => ({
	path,
	lazy: async () => {
		const mod = await loader();
		return { Component: mod.default };
	},
}));

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children,
	},
]);

export default router;
