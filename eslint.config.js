import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default [
  // 全局忽略
  {
    ignores: ['dist', 'node_modules', 'eslint.config.js'],
  },

  // JS 官方推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则（仅作用于 ts/tsx 文件，插件内部已限定 files）
  ...tseslint.configs.recommended,

  // React 推荐规则
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // 关闭与 Prettier 冲突的规则
  prettierConfig,

  // 全局 settings（需放在 react plugin 之后以确保生效）
  {
    settings: {
      react: { version: '18.3' },
    },
  },

  // JS / JSX 项目配置
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18.3' },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // react-hooks 推荐规则
      ...reactHooks.configs.recommended.rules,

      // 保留原 .eslintrc.cjs 中的自定义规则
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // TS / TSX 项目配置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18.3' },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // react-hooks 推荐规则
      ...reactHooks.configs.recommended.rules,

      // React 相关（与 JS 块保持一致）
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TS 相关：关闭与 React 项目不契合的默认规则
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // 构建/工具配置文件 & Node 服务端脚本：运行于 Node.js 环境，需要 Node 全局变量（process、__dirname 等）
  {
    files: [
      'vite.config.{js,ts,mjs,cjs}',
      '*.config.{js,ts,mjs,cjs}',
      'scripts/**/*.{js,ts,mjs,cjs}',
      'mock-server/**/*.{js,ts,mjs,cjs}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
