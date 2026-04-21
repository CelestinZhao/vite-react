/** @type {import('stylelint').Config} */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-less',
    'stylelint-config-css-modules',
  ],
  overrides: [
    {
      files: ['**/*.less', '**/*.module.less'],
      customSyntax: 'postcss-less',
    },
  ],
  rules: {
    // ---------- CSS Modules + Less 友好：关闭易误报规则 ----------
    'selector-class-pattern': null, // 不强制类名命名（配合 CSS Modules 的驼峰）
    'no-descending-specificity': null, // Less 嵌套常触发，关闭减少噪声
    'custom-property-pattern': null, // 不强制 CSS 变量命名
    'keyframes-name-pattern': null, // 不强制 keyframes 命名
    'no-empty-source': null, // 允许空的 less 文件
    'import-notation': null, // 兼容 Less 的 @import 用法

    // ---------- 与现有代码风格兼容的调整 ----------
    'color-function-notation': 'legacy', // 允许 rgba(0,0,0,.5) 这种写法
    'alpha-value-notation': 'number', // 允许 .5 而非强制 50%
    'declaration-block-no-redundant-longhand-properties': null, // 不强制简写
    'shorthand-property-no-redundant-values': null, // 不强制去除冗余短值

    // ---------- 与 Prettier 职责划分 ----------
    // Stylelint v15+ 已移除美学规则，交给 Prettier 负责
    // 此处无需额外关闭，保持默认即可
  },
};
