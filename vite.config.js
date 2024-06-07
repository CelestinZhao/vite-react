import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteExternalsPlugin } from 'vite-plugin-externals';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.([jt])sx?$/,
    exclude: [],
  },
  assetsInclude: /\**\/*\.(xlsx?|csv)/,
  plugins: [
    react(),
    viteExternalsPlugin({
      xlsx: 'XLSX',
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    }
  },
  css: {
    //* css模块化
    modules: { // css模块化 文件以.module.[css|less|scss]结尾
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
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(jpe?g|png|svg)$/.test(assetInfo.name)) { // 匹配资源文件后缀
            return `assets/image/[name]-[hash].[ext]`;  // 创建media文件夹存放匹配的资源文件,name为该文件的原名，hash为哈希值，ext为文件后缀名
          }
          if (/\.(xlsx?|csv)$/.test(assetInfo.name)) {
            return `assets/file/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`; // 不匹配的资源文件存放至assets，以[name]-[hash].[ext]命名规则
        },
      },
    },
  },
  server: {
    host: '127.0.0.1', // 指定服务器应该监听哪个 IP 地址
    port: 5000, // 指定开发服务器端口
  },
  preview: {
    host: '127.0.0.1',
    port: 5001,
  }
})
