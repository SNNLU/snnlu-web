import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const SCRIPT = join(__dirname, '../../.github/scripts/validate-content.mjs')
let dir = ''

/* 在临时目录里摆一份最小的 content/，把要校验的文件写进改动清单再跑脚本 */
function run(files: Record<string, string>) {
  dir = mkdtempSync(join(tmpdir(), 'snnlu-validate-'))
  mkdirSync(join(dir, 'content/news'), { recursive: true })
  writeFileSync(join(dir, 'content/site.json'), JSON.stringify({ folders: { news: { id: 1, name: '校区新闻' }, all: { id: 2, name: '合并', include: ['news'] } } }))
  for (const [name, src] of Object.entries(files)) writeFileSync(join(dir, name), src)
  writeFileSync(join(dir, 'changed.txt'), Object.keys(files).join('\n'))
  const r = spawnSync(process.execPath, [SCRIPT, 'changed.txt'], { cwd: dir, encoding: 'utf8' })
  return { code: r.status, out: r.stdout }
}

const news = (head: string) => `---\n${head}\n---\n\n正文\n`
const OK = 'title: 甲\ndate: 2026-10-12 09:04\nfolder: news'

afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('validate-content', () => {
  it('passes a well-formed article', () => {
    expect(run({ 'content/news/1001.md': news(OK) })).toMatchObject({ code: 0 })
  })

  it.each([
    ['missing date', news('title: 甲\nfolder: news'), '头部缺少 date'],
    ['bad date', news('title: 甲\ndate: 2026/10/12\nfolder: news'), 'date 格式'],
    ['unknown folder', news('title: 甲\ndate: 2026-10-12\nfolder: nope'), 'folder "nope" 不存在'],
    ['merge-only folder', news('title: 甲\ndate: 2026-10-12\nfolder: all'), 'folder "all" 不存在'],
    ['HTML in front matter', news(`${OK}\nsource: <img src=x onerror=alert(1)>`), '头部 source 含有 < 或 >'],
    ['no front matter', '正文\n', '缺少头部块'],
  ])('rejects %s', (_, src, msg) => {
    const r = run({ 'content/news/1001.md': src })
    expect(r.code).toBe(1)
    expect(r.out).toContain(msg)
  })

  it('rejects two files with the same id', () => {
    const r = run({ 'content/news/1001.md': news(OK), 'content/news/01001.md': news(OK) })
    expect(r.code).toBe(1)
    expect(r.out).toContain('重复')
  })
})
