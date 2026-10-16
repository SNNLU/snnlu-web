export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: { port: 4321 },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '四川师范大学遂宁校区',
      meta: [
        { name: 'renderer', content: 'webkit' },
        { name: 'viewport', content: 'width=1920' },
        { name: 'keywords', content: '四川师范大学遂宁校区' },
        { name: 'description', content: '四川师范大学遂宁校区' },
      ],
    },
  },
})
