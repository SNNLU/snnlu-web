#!/usr/bin/env node
// 校验 content/ 下 markdown 的结构。
// 为什么必须独立于构建：server/utils/content.ts 用 meta.date 排序（b.date.localeCompare），
// 头部块缺 date 会让新闻列表接口在请求时抛 TypeError（500），而 nuxt build 完全不报错。
// 头部块本身也由 frontMatter() 用正则解析，首尾 --- 不完整就整篇退化成正文。
import { readFileSync, existsSync } from 'node:fs'

const listFile = process.argv[2] ?? '.changed.txt'
const files = existsSync(listFile)
  ? readFileSync(listFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  : []

const targets = files.filter((f) => /^content\/.+\.mdx?$/.test(f) && existsSync(f))
if (!targets.length) {
  console.log(files.length ? '本次改动未涉及 content/ 下的 markdown' : '没有拿到改动文件清单')
  process.exit(0)
}

const FM = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/
const DATE = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/
let errors = 0
const err = (f, msg) => { console.log(`::error file=${f}::${msg}`); errors++ }
const warn = (f, msg) => console.log(`::warning file=${f}::${msg}`)

for (const f of targets) {
  const src = readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
  const m = src.match(FM)
  if (!m) {
    err(f, '缺少头部块：文件需以 --- 开头，并用单独一行的 --- 结束')
    continue
  }

  const meta = Object.fromEntries(
    m[1].split('\n')
      .filter((l) => l.includes(':'))
      .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
  )
  const isNews = f.startsWith('content/news/')

  for (const k of isNews ? ['title', 'date', 'folder'] : ['title']) {
    if (!meta[k]) {
      err(f, isNews
        ? `头部缺少 ${k}：新闻列表按 date 排序，缺 date 会让列表接口在运行时崩掉`
        : `头部缺少 ${k}：页面标题用于菜单与标题栏`)
    }
  }
  if (meta.date && !DATE.test(meta.date)) {
    err(f, `date 格式应为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm，当前是 "${meta.date}"`)
  }

  if (isNews) {
    if (!/\d/.test(f.split('/').pop() ?? '')) {
      err(f, '文章 id 由文件名中的数字推导，文件名需含数字（如 1005.md）')
    }
    if (meta.folder && meta.folder !== 'news') {
      warn(f, `folder 是 "${meta.folder}"，与所在目录 news 不一致，文章会归到别的栏目`)
    }
    if (!m[2].trim()) warn(f, '正文为空')
  }
}

console.log(`校验 ${targets.length} 个内容文件，发现 ${errors} 处问题`)
process.exit(errors ? 1 : 0)
