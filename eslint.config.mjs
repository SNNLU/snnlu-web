// 基础规则由 nuxt.config.ts 的 eslint 模块生成（含自动导入、Vue、代码风格）；这里只放本仓库的取舍
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // 模板是逐字还原原站的：在行内元素里插换行会多出空白、挪动像素，所以不让格式规则改模板排版
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      // 原站文字里有意用的不换行空格、全角空格
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true }],
      // 单行类型字面量沿用分号分隔：{ a: string; b: number }
      '@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'none' }, singleline: { delimiter: 'semi', requireLast: false } }],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      // 赋值号留在行尾，联合类型的 | 放在行首（仓库现有写法）
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'no-irregular-whitespace': 'off',
      'vue/no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipHTMLTextContents: true, skipComments: true }],
      // 每处 v-html 都要在旁边写明内容从哪来、为什么安全（见各组件里的 eslint-disable 注释）
      'vue/no-v-html': 'error',
    },
  },
  {
    files: ['app/components/**/*.vue'],
    // 分页组件沿用原站的名字
    rules: { 'vue/multi-word-component-names': ['error', { ignores: ['Pager'] }] },
  },
)
