import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'

export default [
  // 全局忽略
  {
    ignores: ['dist', 'node_modules', 'eslint.config.js'],
  },

  // JS 官方推荐规则
  js.configs.recommended,

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

  // 项目配置
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
]
