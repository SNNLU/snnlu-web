import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseLayout, type LayoutRefs } from '../../server/utils/layout'

const CONTENT = join(__dirname, '../../content')
const site = JSON.parse(readFileSync(join(CONTENT, 'site.json'), 'utf8'))
const refs: LayoutRefs = {
  folders: Object.keys(site.folders),
  navCount: site.nav.length,
  pages: readdirSync(join(CONTENT, 'pages')).map((f) => f.replace(/\.md$/, '')),
}

/* 一个最小的版式：一列、一个模块，组件由参数给 */
const one = (widget: object, extra: object = {}) => ({
  css: '',
  grid: [{ t: 'row', kids: [{ t: 'col', width: 300, modules: [{ key: 'k', boxClass: 'cms-box', bar: null, cellClass: '', widget, ...extra }] }] }],
})
const W = 'grid.0.kids.0.modules.0'

describe('parseLayout', () => {
  it.each(readdirSync(join(CONTENT, 'layout')))('accepts the real %s', (f) => {
    expect(() => parseLayout(f, JSON.parse(readFileSync(join(CONTENT, 'layout', f), 'utf8')), refs)).not.toThrow()
  })

  it('reports misspelled or missing fields with their path', () => {
    expect(() => parseLayout('x.json', one({ kind: 'list', uid: 'u', folder: 'news', size: 5, count: 20, dated: true, paged: false, pagd: true }), refs))
      .toThrow(`${W}.widget`)
    expect(() => parseLayout('x.json', one({ kind: 'list', uid: 'u', folder: 'news' }), refs)).toThrow(`${W}.widget.size`)
  })

  it('rejects unknown widget kinds and node types', () => {
    expect(() => parseLayout('x.json', one({ kind: 'carousel', uid: 'u' }), refs)).toThrow(`${W}.widget.kind`)
    expect(() => parseLayout('x.json', { css: '', grid: [{ t: 'cell' }] }, refs)).toThrow('grid.0.t')
  })

  it('rejects references to things that do not exist', () => {
    expect(() => parseLayout('x.json', one({ kind: 'list', uid: 'u', folder: 'nope', size: 5, count: 20, dated: true, paged: false }), refs))
      .toThrow(`${W}.widget.folder: 栏目 "nope" 不存在`)
    expect(() => parseLayout('x.json', one({ kind: 'menu', uid: 'u', focus: '', source: `nav:${refs.navCount}` }), refs))
      .toThrow(`${W}.widget.source`)
    expect(() => parseLayout('x.json', one({ kind: 'menu', uid: 'u', focus: '', source: 'nav' }), refs)).toThrow('quick 或 nav:<序号>')
    expect(() => parseLayout('x.json', one({ kind: 'page', slug: 'nope' }), refs)).toThrow('content/pages/nope.md 不存在')
  })
})
