import { detailHref, folderHref, pageOf, type Link, type Module, type Node, type St, type Tab, type Widget } from '#shared/cms'
import type { Article, Site } from './content'

const cut = (s: string, n: number) => (n && s.length > n ? `${s.slice(0, n)}...` : s)

export const rowOf = (a: Article, count: number, date: 'full' | 'short' | '') => ({
  title: cut(a.title, count),
  tip: a.title,
  href: detailHref(a.id),
  target: '_blank',
  date: date && ` ${date === 'full' ? a.date.slice(0, 10) : a.date.slice(5, 10)} `,
})

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

async function widgetOf(w: RawWidget, s: Site, tab: number): Promise<Widget> {
  switch (w.kind) {
    case 'list': {
      const all = await inFolder(w.folder)
      const rows = all.map((a) => rowOf(a, w.count, w.dated ? (w.paged ? 'full' : 'short') : ''))
      const { items, paging } = pageOf(rows, 1, w.size)
      return { kind: 'list', uid: w.uid, rows: items, paging: w.paged ? paging : null, all: w.paged ? rows : null, size: w.size }
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
      const section = s.nav[+w.source.slice('nav:'.length)]
      if (!section) throw new Error(`menu 的 source "${w.source}" 在导航里找不到`) // parseLayout 已查过，这里只为类型收窄
      const links: Link[] = section.children.map((c) => ({
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
}

async function gridOf(nodes: RawNode[], s: Site, tab: number): Promise<Node[]> {
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

/* 正文、栏目列表、全站检索都挂在 /p/9/ 的壳子里，同原站 */
const ST_TAB = 9

async function stOf(kind: 'news' | 'list' | 'search', arg: number): Promise<{ st: St; title: string } | null> {
  const s = await site()
  const top = { label: `[${s.name}]`, href: '/search/', target: '' }

  if (kind === 'news') {
    const a = (await articles()).find((x) => x.id === arg)
    if (!a) return null
    const f = s.folders[a.folder]!
    const mobile = `/wx/news/${a.id}/`
    return {
      title: a.title,
      st: {
        trail: [top, { label: `>>${f.name}`, href: folderHref(f.id), target: '' }, { label: `>>${a.title}`, href: detailHref(a.id), target: '' }],
        view: {
          kind: 'detail',
          title: a.title,
          subtitle: a.byline || null,
          info: detailInfo(a),
          body: `<div>${a.body}
<p style='text-align:right'>编辑：管理员</p></div>`,
          tools: [
            { label: '[手机版本]', dialog: { title: '手机版本', w: 450, h: 500, src: mobile } },
            // 二维码页拿到相对路径后自己补上域名
            { label: '[扫码分享]', dialog: { title: '二维码网址（请使用微信扫描）', w: 400, h: 300, src: `/qr/?text=${encodeURIComponent(mobile)}` } },
            { label: '[打印本页]', dialog: null },
          ],
        },
      },
    }
  }

  const f = kind === 'list' ? await folderById(String(arg)) : null
  if (kind === 'list' && !f) return null
  const pool = f ? await inFolder(f[0]) : await articles()
  return {
    title: '站内信息',
    st: {
      trail: f ? [top, { label: `>>${f[1].name}`, href: folderHref(arg), target: '' }] : [top],
      view: { kind: 'list', uid: 'st', rows: pool.map((a) => rowOf(a, 0, 'full')), search: kind === 'search' },
    },
  }
}

const shell = (s: Site, id: number) => ({
  id,
  nav: s.nav.map((n) => ({ ...n, target: n.target ?? '_self', children: n.children.map((c) => ({ ...c, target: c.target ?? '_self', title: c.label })) })),
  hero: [],
  footer: footerHtml(s.footer),
})

export async function stTab(kind: 'news' | 'list' | 'search', arg = 0): Promise<Tab | null> {
  const got = await stOf(kind, arg)
  return got && { ...shell(await site(), ST_TAB), title: got.title, css: '', grid: [], st: got.st }
}

export async function tabOf(id: number): Promise<Tab | { redirect: string } | null> {
  const s = await site()
  if (s.redirects[id]) return { redirect: s.redirects[id] }

  const l = await layout(id)
  if (!l) return null
  const at = locate(s, id)
  return {
    ...shell(s, id),
    title: id === 0 ? s.name : `${at?.child?.label ?? at?.section.label ?? ''} - ${s.name}`,
    css: l.css,
    grid: await gridOf(l.grid, s, id),
    st: null,
    hero: id === 0 ? s.hero.map((h) => ({ ...h, href: 'javascript:void(0);', target: '_self' })) : [],
  }
}
