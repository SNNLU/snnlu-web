import { readdirSync, readFileSync } from 'node:fs'

/* 纯静态站：构建时把每一页都生成出来。页面清单直接从 content/ 读 */
function pages() {
  const site = JSON.parse(readFileSync('content/site.json', 'utf8'))
  const tabs = [
    ...readdirSync('content/layout').map((f) => f.replace(/\.json$/, '')),
    ...Object.keys(site.redirects),
  ]
  const news = readdirSync('content/news').filter((f) => f.endsWith('.md')).map((f) => String(+f.replace(/\D/g, ''))) // 与文章链接同一算法：001.md → /news/1/
  const folders = Object.values<{ id: number }>(site.folders).map((f) => f.id)
  return [
    '/',
    '/search/',
    '/qr/',
    ...tabs.map((t) => `/p/${t}/`),
    ...news.flatMap((id) => [`/news/${id}/`, `/wx/news/${id}/`]),
    ...folders.map((id) => `/list/${id}/`),
  ]
}

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
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/img/badge.svg' }],
    },
  },
  // 站内图文都在 content/，构建时由服务端代码读出、生成静态页
  nitro: {
    serverAssets: [{ baseName: 'content', dir: '../content' }],
    prerender: {
      crawlLinks: false,
      failOnError: true,
      routes: pages(),
    },
  },
})
