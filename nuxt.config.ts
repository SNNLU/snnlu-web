export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: { port: 4321 },
  // 与原站同序：系统基样式 → Bootstrap 5.3.2 → 皮肤
  css: ['~/assets/css/cms.css', 'bootstrap/dist/css/bootstrap.min.css', '~/assets/css/base.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '遂宁奶龙大学',
      meta: [
        { name: 'renderer', content: 'webkit' },
        { name: 'viewport', content: 'width=1920' },
        { name: 'keywords', content: '遂宁奶龙大学' },
        { name: 'description', content: '遂宁奶龙大学' },
      ],
    },
  },
  // 站内图文都在 content/，随服务端一起打包
  nitro: {
    serverAssets: [{ baseName: 'content', dir: '../content' }],
  },
})
