import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { visualizer } from 'rollup-plugin-visualizer';
// import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	// 仅在生产构建时走 CDN + externalize；
	// dev 模式保留本地 node_modules 版本，保证 react-refresh 链路完整，Fast Refresh 可用。
	const isBuild = command === 'build';

	return {
		base: '/',
		esbuild: {
			loader: 'tsx',
			include: /src\/.*\.([jt])sx?$/,
			exclude: [],
		},
		assetsInclude: /\**\/*\.(xlsx?|csv)/,
		plugins: [
			react(),
			// 放在 react() 之后并使用 post，避免抢在 react 插件的 transformIndexHtml 之前修改 HTML。
			// dev 模式：剥离 index.html 中的 CDN 标签，让 react/react-dom 走本地 node_modules，恢复 Fast Refresh；
			// build 模式：仅移除占位注释，保留 CDN 标签。
			{
				name: 'strip-prod-cdn-in-dev',
				transformIndexHtml: {
					order: 'post',
					handler(html) {
						if (isBuild) {
							return html.replace(/<!--PROD_CDN_(?:START|END)-->/g, '');
						}
						return html.replace(/<!--PROD_CDN_START-->[\s\S]*?<!--PROD_CDN_END-->/g, '');
					},
				},
			},
			isBuild &&
				viteExternalsPlugin({
					xlsx: 'XLSX',
					'tesseract.js': 'Tesseract',
					lodash: '_',
					react: 'React',
					'react-dom': 'ReactDOM',
					'react-dom/client': 'ReactDOM',
					'tdesign-react': 'TDesign',
				}),
			// // Gzip 预压缩：大于 10KB 的产物额外生成 .gz，Nginx 配 gzip_static on 直接读取
			// viteCompression({
			// 	algorithm: 'gzip',
			// 	ext: '.gz',
			// 	threshold: 10240,
			// 	deleteOriginFile: false,
			// }),
			// // Brotli 预压缩：压缩率比 gzip 高 15%~25%，现代浏览器全面支持
			// viteCompression({
			// 	algorithm: 'brotliCompress',
			// 	ext: '.br',
			// 	threshold: 10240,
			// 	deleteOriginFile: false,
			// }),
			// 仅在 ANALYZE=true 时启用可视化包体分析（npm run build:analyze）
			process.env.ANALYZE === 'true' &&
				visualizer({
					filename: 'dist/stats.html',
					open: true,
					gzipSize: true,
					brotliSize: true,
				}),
		].filter(Boolean),
		optimizeDeps: {
			// 显式声明需预构建的依赖，避免二次触发预构建导致的页面 reload
			include: [
				'react-router-dom',
				'tdesign-icons-react',
				'@dnd-kit/core',
				'@dnd-kit/sortable',
				'@dnd-kit/utilities',
				'@hello-pangea/dnd',
				'react-markdown',
				'remark-gfm',
			],
			// 排除走 CDN 的外部依赖，避免浪费预构建开销
			// 注意：react / react-dom / tdesign-react 不要放这里，
			// viteExternalsPlugin 已把其 import 重写成 window 全局，放 exclude 反而会触发
			// "The entry point xxx cannot be marked as external" 报错
			exclude: ['xlsx', 'tesseract.js', 'lodash'],
			esbuildOptions: {
				loader: {
					'.js': 'jsx',
					'.ts': 'tsx',
				},
			},
		},
		css: {
			//* css模块化
			modules: {
				// css模块化 文件以.module.[css|less|scss]结尾
				generateScopedName: '[name]__[local]___[hash:base64:5]',
				hashPrefix: 'prefix',
			},
			//* 预编译支持less
			preprocessorOptions: {
				less: {
					// 支持内联 JavaScript
					javascriptEnabled: true,
				},
			},
		},
		build: {
			target: 'es2020', // 现代浏览器目标，编译更快、产物更小
			minify: 'esbuild', // 显式声明使用 esbuild 压缩（比 Terser 快 20~40x）
			reportCompressedSize: false, // 跳过 gzip 体积统计，节省 1~3s 构建时间
			chunkSizeWarningLimit: 1000, // 调整 chunk 大小警告阈值（分包后更合理）
			rollupOptions: {
				output: {
					// 智能分包：按生态 + 使用场景切分，提升浏览器缓存命中率
					// 原则：不同路由独占的库不要合并；多路由共享的库才显式 vendor 化
					manualChunks: {
						// 路由工具类，所有页面都会用
						'react-vendor': ['react-router-dom'],
						// 图标库，全站公用
						tdesign: ['tdesign-icons-react'],
						// 拖拽库拆成两个独立 chunk：不同页面按需加载，避免加载不用的那套
						'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
						'dnd-pangea': ['@hello-pangea/dnd'],
						markdown: ['react-markdown'],
					},
					chunkFileNames: 'assets/js/[name]-[hash].js',
					entryFileNames: 'assets/js/[name]-[hash].js',
					assetFileNames: (assetInfo) => {
						if (/\.(jpe?g|png|svg)$/.test(assetInfo.name)) {
							// 匹配资源文件后缀
							return `assets/image/[name]-[hash].[ext]`; // 创建media文件夹存放匹配的资源文件,name为该文件的原名，hash为哈希值，ext为文件后缀名
						}
						if (/\.(xlsx?|csv)$/.test(assetInfo.name)) {
							return `assets/file/[name]-[hash].[ext]`;
						}
						if (/\.css$/.test(assetInfo.name)) {
							// CSS 文件（含 .css / .less / CSS Modules 编译产物）统一输出到 assets/css
							return `assets/css/[name]-[hash].[ext]`;
						}
						return `assets/[name]-[hash].[ext]`; // 不匹配的资源文件存放至assets，以[name]-[hash].[ext]命名规则
					},
				},
			},
		},
		server: {
			host: '127.0.0.1', // 指定服务器应该监听哪个 IP 地址
			port: 5173, // 指定开发服务器端口（避开 macOS AirPlay 占用的 5000 端口）
			strictPort: true, // 端口被占用时直接退出，不自动切换
			// 预热高频模块，加快首次访问响应
			warmup: {
				clientFiles: ['./src/index.js', './src/App.js', './src/router.js'],
			},
			// 代理到 Koa Mock 服务（mock-server/server.js，默认 3001 端口）
			// 注意：SSE 接口依赖流式转发，Vite 基于 http-proxy 默认即支持，无需额外配置
			proxy: {
				'/api': {
					target: 'http://127.0.0.1:3001',
					changeOrigin: true,
				},
			},
		},
		preview: {
			host: '127.0.0.1',
			port: 5174,
		},
	};
});
