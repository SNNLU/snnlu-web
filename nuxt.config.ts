import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'

/* 页脚的提交号：Actions 里取 GITHUB_SHA，本地取当前 HEAD；拿不到就显示 main */
function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    return ''
  }
}

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
  modules: ['@nuxt/eslint'],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '遂宁奶龙大学',
      meta: [
        { name: 'renderer', content: 'webkit' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'keywords', content: '遂宁奶龙大学' },
        { name: 'description', content: '遂宁奶龙大学' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/img/badge.svg' }],
    },
  },
  // 与原站同序：系统基样式 → Bootstrap 5.3.2（只取用到的部分）→ 皮肤；最后是窄屏的改写
  css: ['~/assets/css/cms.css', '~/assets/scss/bootstrap.scss', '~/assets/css/base.css', '~/assets/css/responsive.css', '~/assets/css/mobile.css'],
  // 只在构建时由服务端读取，不下发到浏览器
  runtimeConfig: { commit: commit() },
  devServer: { port: 4321 },
  compatibilityDate: '2025-07-15',
  // Bootstrap 5.3 的 SCSS 还在用 @import 与旧函数，新版 sass 会刷一屏弃用提示；依赖里的不报，本仓库只压 import 这一条
  vite: { css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ['import'] } } } },
  // 站内图文都在 content/，构建时由服务端代码读出、生成静态页
  nitro: {
    serverAssets: [{ baseName: 'content', dir: '../content' }],
    prerender: {
      crawlLinks: false,
      failOnError: true,
      routes: pages(),
    },
  },
  // 代码风格按仓库现状：无分号、单引号、两空格、多行末尾逗号
  eslint: { config: { stylistic: { semi: false, quotes: 'single', indent: 2, commaDangle: 'always-multiline', braceStyle: '1tbs', arrowParens: true } } },
})
