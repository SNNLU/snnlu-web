export const SRC = 'https://sn.sicnu.edu.cn'

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
  | { kind: 'list'; uid: string; rows: Row[]; paging: Paging | null; query: Record<string, string> | null }
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

export interface StList {
  kind: 'list'
  uid: string
  rows: (Row & { rule: boolean })[]
  paging: Paging
  query: Record<string, string>
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

/* 照原站 ToSearchUrl：含 "'()<> 的词整个作废；.NET 式小写百分号编码后 base64，再编码一次 */
const urlEncode = (s: string) =>
  encodeURIComponent(s).replace(/~/g, '%7E').replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase()).replace(/%20/g, '+')

export function searchHref(kw: string, tab = '0') {
  const token = /["'()<>]/.test(kw) ? '' : urlEncode(btoa(urlEncode(kw)))
  return `/p/${tab}/?StId=st_app_news_search_x_x_${token}_x__x_0_x_0`
}
