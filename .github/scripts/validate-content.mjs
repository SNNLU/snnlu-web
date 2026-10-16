#!/usr/bin/env node
// 校验 content/ 下 markdown 的结构。
// 生成静态站时缺 date 会直接失败，但报错只是一串堆栈；这里提前给出看得懂的提示。
// 另外几类错误生成时根本不报：头部块首尾 --- 不完整会整篇退化成正文，
// folder 写错文章会从所有栏目里消失，文件名数字重复会让两篇文章抢同一个地址。
import { readFileSync, readdirSync, existsSync } from 'node:fs'

const listFile = process.argv[2] ?? '.changed.txt'
const files = existsSync(listFile)
  ? readFileSync(listFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  : []

const targets = files.filter((f) => /^content\/.+\.mdx?$/.test(f) && existsSync(f))
if (!targets.length) {
  console.log(files.length ? '本次改动未涉及 content/ 下的 markdown' : '没有拿到改动文件清单')
  process.exit(0)
}

/* 可填的栏目代号：site.json 里的 folders，去掉只做合并用的（带 include 的，如 league） */
const folders = Object.entries(JSON.parse(readFileSync('content/site.json', 'utf8')).folders)
  .filter(([, f]) => !f.include)
  .map(([k, f]) => ({ key: k, label: `${k}（${f.name}）` }))

/* 文章 id = 文件名里的数字；统计全部文章，查重 */
const idOf = (name) => name.replace(/\D/g, '')
const owners = {}
for (const name of readdirSync('content/news').filter((n) => n.endsWith('.md'))) {
  (owners[idOf(name)] ??= []).push(name)
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
        ? `头部缺少 ${k}：新闻列表按 date 排序，缺 date 会让整站生成失败`
        : `头部缺少 ${k}：页面标题用于菜单与标题栏`)
    }
  }
  if (meta.date && !DATE.test(meta.date)) {
    err(f, `date 格式应为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm，当前是 "${meta.date}"`)
  }

  if (isNews) {
    const name = f.split('/').pop() ?? ''
    if (!/\d/.test(name)) {
      err(f, '文章 id 由文件名中的数字推导，文件名需含数字（如 1005.md）')
    } else if (owners[idOf(name)]?.length > 1) {
      err(f, `文件名数字 ${idOf(name)} 与 ${owners[idOf(name)].filter((n) => n !== name).join('、')} 重复，两篇文章会抢同一个地址 /news/${idOf(name)}/`)
    }
    if (meta.folder && !folders.some((x) => x.key === meta.folder)) {
      err(f, `folder "${meta.folder}" 不存在，文章不会出现在任何栏目。可填：${folders.map((x) => x.label).join('、')}`)
    }
    if (!m[2].trim()) warn(f, '正文为空')
  }
}

console.log(`校验 ${targets.length} 个内容文件，发现 ${errors} 处问题`)
process.exit(errors ? 1 : 0)
