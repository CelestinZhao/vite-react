import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.less';
// tdesign-react 样式已在 index.html 通过 CDN 引入（UMD 包不含 CSS）
// 从 TS 文件导入 —— 验证 JS ↔ TS 无缝互通
import { greet } from './utils/greet';

console.log(greet('Vite + React + TS', { lang: 'en' }));

createRoot(document.getElementById('root')).render(<App />);
