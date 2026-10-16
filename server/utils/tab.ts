import type { Link, Module, Node, St, Tab, Widget } from '#shared/cms'
import type { Article, Site } from './content'

const SIZE = 30 // 检索结果每页条数，五条一道线

export const detailHref = (id: number, tab = 9) => `/p/${tab}/?StId=st_app_news_i_x${id}`
export const folderHref = (fid: number | string, tab = 9) => `/p/${tab}/?StId=st_app_news_search_x${fid}_x__x__x_0_x_0`

const cut = (s: string, n: number) => (n && s.length > n ? `${s.slice(0, n)}...` : s)

export const rowOf = (a: Article, count: number, date: 'full' | 'short' | '') => ({
  title: cut(a.title, count),
  tip: a.title,
  href: detailHref(a.id),
  target: '_blank',
  date: date && ` ${date === 'full' ? a.date.slice(0, 10) : a.date.slice(5, 10)} `,
})

export function pageOf<T>(items: T[], page: number, size: number) {
  const pages = Math.ceil(items.length / size)
  return { items: items.slice((page - 1) * size, page * size), paging: { page, pages, total: items.length } }
}

/* 当前栏目在导航里的位置 */
function locate(s: Site, tab: number) {
  const href = `/p/${tab}/`
  for (const [i, n] of s.nav.entries()) {
    const child = n.children.find((c) => c.href === href)
    if (child) return { section: n, index: i, child }
    if (n.href.replace(/\/?$/, '/') === href) return { section: n, index: i, child: null }
  }
  return null
}

async function widgetOf(w: any, s: Site, tab: number): Promise<Widget> {
  switch (w.kind) {
    case 'list': {
      const all = await inFolder(w.folder)
      const { items, paging } = pageOf(all, 1, w.size)
      const query = { folder: w.folder, size: String(w.size), count: String(w.count), dated: w.dated ? '1' : '' }
      return { kind: 'list', uid: w.uid, rows: items.map((a) => rowOf(a, w.count, w.dated ? (w.paged ? 'full' : 'short') : '')), paging: w.paged ? paging : null, query: w.paged ? query : null }
    }
    case 'focus': {
      const all = await inFolder(w.folder)
      const slides = all.filter((a) => a.cover).slice(0, w.slides).map((a) => ({ src: a.cover, alt: cut(a.title, w.count), href: detailHref(a.id), target: '_blank' }))
      return { kind: 'focus', uid: w.uid, slider: w.slider, rows: all.slice(0, w.size).map((a) => rowOf(a, w.count, 'short')), slides, options: w.options }
    }
    case 'menu': {
      if (w.source === 'quick') {
        return { kind: 'menu', uid: w.uid, focus: '', links: s.quick.map((q) => ({ ...q, target: '_blank', title: q.label })) }
      }
      const links: Link[] = s.nav[+w.source.split(':')[1]].children.map((c) => ({
        label: c.label,
        href: c.href,
        target: c.target ?? '_self',
        id: c.href.startsWith('/') ? `${w.focus}${c.href.replace(/\D/g, '')}` : undefined,
      }))
      return { kind: 'menu', uid: w.uid, focus: w.focus, links }
    }
    case 'tabpath': {
      const at = locate(s, tab)
      const trail = at ? [{ label: `>>${at.section.label}`, href: at.section.parent ?? at.section.href, target: '_self' }] : []
      if (at?.child) trail.push({ label: `>>${at.child.label}`, href: at.child.href, target: '_self' })
      return { kind: 'tabpath', uid: w.uid, trail }
    }
    case 'gallery':
      return { kind: 'gallery', uid: w.uid, photos: s.gallery }
    case 'iframe':
      return { kind: 'iframe', uid: w.uid, style: w.style, src: w.src }
    case 'page':
      return { kind: 'html', html: `<div><div style="clear:both;margin:0;padding:0"><div>${await pageHtml(w.slug)}</div></div></div>` }
  }
  throw new Error(`unknown widget ${w.kind}`)
}

async function gridOf(nodes: Node[], s: Site, tab: number): Promise<Node[]> {
  return Promise.all(nodes.map(async (n): Promise<Node> => {
    if (n.t === 'row') return { t: 'row', kids: await gridOf(n.kids, s, tab) }
    if (n.t !== 'col') return n
    const modules = await Promise.all(n.modules.map(async (m): Promise<Module> => ({
      ...m,
      bar: m.bar && { ...m.bar, title: m.bar.title ?? locate(s, tab)?.section.label ?? '' },
      widget: await widgetOf(m.widget, s, tab),
    })))
    return { ...n, modules }
  }))
}

const decodeKw = (token: string) => {
  try {
    return decodeURIComponent(atob(decodeURIComponent(token)).replace(/\+/g, ' '))
  } catch {
    return ''
  }
}

/* 标题里命中的词标红，同原站 */
const mark = (title: string, kw: string) => {
  const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return kw ? title.split(kw).map(esc).join(`<span style='color:red;font:inherit'>${esc(kw)}</span>`) : esc(title)
}

export async function searchOf(folder: string, kw: string, page: number) {
  const s = await site()
  const pool = folder ? await inFolder((await folderById(folder))?.[0] ?? '') : await articles()
  const hits = kw ? pool.filter((a) => a.title.includes(kw)) : pool
  const { items, paging } = pageOf(hits, page, SIZE)
  const rows = items.map((a, i) => ({ ...rowOf(a, 0, 'full'), title: mark(a.title, kw), date: a.date.slice(0, 10), rule: i % 5 === 4 }))
  return { rows, paging, site: s }
}

async function stOf(stid: string, tab: number, origin: string): Promise<{ st: St; title: string } | null> {
  const s = await site()
  const top = { label: `[${s.name}]`, href: `/p/${tab}/?StId=st_app_news_search_x_x__x__x_0_x_0`, target: '' }

  const item = stid.match(/^st_app_news_i_x(\d+)$/)
  if (item) {
    const a = (await articles()).find((x) => x.id === +item[1])
    if (!a) return null
    const views = await bump(`views:${a.id}`, a.views)
    const f = s.folders[a.folder]
    const mobile = `/wx/news/${a.id}`
    return {
      title: a.title,
      st: {
        trail: [top, { label: `>>${f.name}`, href: folderHref(f.id, tab), target: '' }, { label: `>>${a.title}`, href: detailHref(a.id, tab), target: '' }],
        view: {
          kind: 'detail',
          title: a.title,
          subtitle: a.byline || null,
          info: `时间：${a.date}:00&nbsp;&nbsp;&nbsp;来源：${a.source}&nbsp;&nbsp;&nbsp;查看：<span>${views}</span>`,
          body: `<div>${a.body}\n<p style='text-align:right'>编辑：管理员</p></div>`,
          tools: [
            { label: '[手机版本]', dialog: { title: '手机版本', w: 450, h: 500, src: mobile } },
            { label: '[扫码分享]', dialog: { title: '二维码网址（请使用微信扫描）', w: 400, h: 300, src: `/qr?text=${encodeURIComponent(origin + mobile)}` } },
            { label: '[打印本页]', dialog: null },
          ],
        },
      },
    }
  }

  const search = stid.match(/^st_app_news_search_x(\d*)_x_([^_]*)_x_[^_]*_x_(\d+)/)
  if (!search) return null
  const [, folder, token, page] = search
  const kw = decodeKw(token)
  const { rows, paging } = await searchOf(folder, kw, +page + 1)
  const f = folder ? await folderById(folder) : null
  const trail = f ? [top, { label: `>>${f[1].name}`, href: folderHref(folder, tab), target: '' }] : [top]
  return {
    title: '站内信息',
    st: { trail, view: { kind: 'list', uid: 'st', rows, paging, query: { st: '1', folder, kw } } },
  }
}

export async function tabOf(id: number, stid: string, origin: string): Promise<Tab | { redirect: string } | null> {
  const s = await site()
  if (s.redirects[id]) return { redirect: s.redirects[id] }
  const shell = {
    id,
    nav: s.nav.map((n) => ({ ...n, target: n.target ?? '_self', children: n.children.map((c) => ({ ...c, target: c.target ?? '_self', title: c.label })) })),
    hero: [],
    footer: s.footer,
  }

  if (stid) {
    const got = await stOf(stid, id, origin)
    return got && { ...shell, title: got.title, css: '', grid: [], st: got.st }
  }

  const l = await layout(id)
  if (!l) return null
  const at = locate(s, id)
  return {
    ...shell,
    title: id === 0 ? s.name : `${at?.child?.label ?? at?.section.label ?? ''} - ${s.name}`,
    css: l.css,
    grid: await gridOf(l.grid, s, id),
    st: null,
    hero: id === 0 ? s.hero.map((h) => ({ ...h, href: 'javascript:void(0);', target: '_self' })) : [],
  }
}

