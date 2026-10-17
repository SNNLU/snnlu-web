export interface Link {
  label: string
  href: string
  target: string
  title?: string
  id?: string
}

export interface NavItem extends Link {
  children: Link[]
}

export interface Row {
  title: string
  tip: string
  href: string
  target: string
  date: string
}

export interface Paging {
  page: number
  pages: number
  total: number
}

export interface Bar {
  cell: string
  box: string
  title: string
  more: Link | null
}

export type Widget =
  /* all 是整栏条目（只有带翻页的列表才给），翻页在浏览器里切 */
  | { kind: 'list'; uid: string; rows: Row[]; paging: Paging | null; all: Row[] | null; size: number }
  | { kind: 'focus'; uid: string; slider: string; rows: Row[]; slides: Slide[]; options: FocusOptions }
  | { kind: 'menu'; uid: string; links: Link[]; focus: string }
  | { kind: 'tabpath'; uid: string; trail: Link[] }
  | { kind: 'gallery'; uid: string; photos: string[] }
  | { kind: 'iframe'; uid: string; src: string; style: string }
  | { kind: 'html'; html: string }

export interface Module {
  key: string
  style: string
  bar: Bar | null
  cell: string
  wrap: string
  widget: Widget
}

export type Node =
  | { t: 'row'; kids: Node[] }
  | { t: 'col'; width: number; modules: Module[] }
  | { t: 'clear'; nbsp: boolean }

export interface Slide {
  src: string
  alt: string
  href: string
  target: string
}

export interface FocusOptions {
  w: number
  h: number
  time: number
  titleH: number
  titleColor: string
  titleHover: string
  titleBg: string
}

/* 栏目列表与检索共用：rows 是整栏条目，检索词、分页、标红都在浏览器里做 */
export interface StList {
  kind: 'list'
  uid: string
  rows: Row[]
  search: boolean
}

export interface Tool {
  label: string
  dialog: { title: string; w: number; h: number; src: string } | null
}

export interface StDetail {
  kind: 'detail'
  title: string
  subtitle: string | null
  info: string
  body: string
  tools: Tool[]
}

export interface St {
  trail: Link[]
  view: StList | StDetail
}

export interface Tab {
  id: number
  title: string
  css: string
  grid: Node[]
  st: St | null
  hero: Slide[]
  nav: NavItem[]
  footer: string
}

export interface Visit {
  redirect: string
}

export const detailHref = (id: number) => `/news/${id}/`
export const folderHref = (fid: number | string) => `/list/${fid}/`
export const searchHref = (kw: string) => `/search/?kw=${encodeURIComponent(kw)}`

export function pageOf<T>(items: T[], page: number, size: number) {
  const pages = Math.ceil(items.length / size)
  return { items: items.slice((page - 1) * size, page * size), paging: { page, pages, total: items.length } }
}

/* 标题里命中的词标红，同原站 */
export const mark = (title: string, kw: string) => {
  const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return kw ? title.split(kw).map(esc).join(`<span style='color:red;font:inherit'>${esc(kw)}</span>`) : esc(title)
}

/* 旧站的 ?StId= 地址换成静态路径：正文 → /news/，栏目 → /list/，检索 → /search/ */
const decodeKw = (token: string) => {
  try {
    return decodeURIComponent(atob(decodeURIComponent(token)).replace(/\+/g, ' '))
  } catch {
    return ''
  }
}

export function legacyHref(stid: string) {
  const item = stid.match(/^st_app_news_i_x(\d+)$/)?.[1]
  if (item) return detailHref(+item)
  const search = stid.match(/^st_app_news_search_x(\d*)_x_([^_]*)_x_/)
  if (!search) return null
  const kw = decodeKw(search[2] ?? '')
  if (kw) return searchHref(kw)
  return search[1] ? folderHref(search[1]) : '/search/'
}
