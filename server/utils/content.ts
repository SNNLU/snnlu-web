import type { Node } from '#shared/cms'

/* content/ 下的全部内容：site.json、layout/*.json、pages/*.md、news/*.md */
const store = () => useStorage('assets:content')

export interface Site {
  name: string
  footer: string
  nav: { label: string; href: string; target?: string; parent?: string; children: { label: string; href: string; target?: string }[] }[]
  redirects: Record<string, string>
  hero: { src: string; alt: string }[]
  gallery: string[]
  quick: { label: string; href: string }[]
  folders: Record<string, { id: number; name: string; include?: string[] }>
}

export interface Article {
  id: number
  title: string
  date: string
  folder: string
  source: string
  byline: string
  cover: string
  views: number
  body: string
}

export interface Layout {
  css: string
  grid: Node[]
}

export const site = async () => (await store().getItem<Site>('site.json'))!

export const layout = (tab: number) => store().getItem<Layout>(`layout:${tab}.json`)

export async function pageHtml(slug: string) {
  const src = await store().getItem<string>(`pages:${slug}.md`)
  return src ? markdown(frontMatter(src).body) : ''
}

export async function articles(): Promise<Article[]> {
  const keys = await store().getKeys('news')
  const all = await Promise.all(keys.map(async (key) => {
    const { meta, body } = frontMatter(String(await store().getItem(key)))
    const { title, date, folder } = meta
    // 缺这三项文章没法排序、归栏：直接让生成失败，并点名是哪一篇
    if (!title || !date || !folder) throw new Error(`${key}：头部缺少 title / date / folder`)
    // 排序按字符串比较，格式不统一会排乱；CI 只校验改动的文件，这里兜住本地生成
    if (!DATE.test(date)) throw new Error(`${key}：date 应为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm，当前是 "${date}"`)
    return {
      id: +key.replace(/\D/g, ''),
      title,
      date,
      folder,
      source: meta.source ?? '',
      byline: meta.byline ?? '',
      cover: meta.cover ?? '',
      views: +(meta.views ?? 0),
      body: markdown(body),
    }
  }))
  return all.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

/* 栏目可以合并别的栏目（如「奶龙风采」） */
export async function inFolder(key: string) {
  const s = await site()
  const keys = s.folders[key]?.include ?? [key]
  return (await articles()).filter((a) => keys.includes(a.folder))
}

export async function folderById(id: string) {
  const s = await site()
  return Object.entries(s.folders).find(([, f]) => String(f.id) === id)
}
