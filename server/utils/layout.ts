/* content/layout/*.json 的形状与引用校验：写错字段、栏目、导航序号或页面名，生成时直接报出位置 */
import { z } from 'zod'

const uid = z.string().min(1)
const count = z.number().int().nonnegative()
const link = z.strictObject({ label: z.string(), target: z.string(), href: z.string() }) // 键序同 JSON 原文，产物逐字节不变

const widget = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('list'), uid, folder: z.string(), size: count, count, dated: z.boolean(), paged: z.boolean() }),
  z.strictObject({
    kind: z.literal('focus'), uid, slider: z.string(), folder: z.string(), size: count, slides: count, count,
    options: z.strictObject({ w: count, h: count, time: count, titleH: count, titleColor: z.string(), titleHover: z.string(), titleBg: z.string() }),
  }),
  z.strictObject({ kind: z.literal('menu'), uid, focus: z.string(), source: z.string().regex(/^(quick|nav:\d+)$/, '应为 quick 或 nav:<序号>') }),
  z.strictObject({ kind: z.literal('tabpath'), uid }),
  z.strictObject({ kind: z.literal('gallery'), uid }),
  z.strictObject({ kind: z.literal('iframe'), uid, style: z.string(), src: z.string() }),
  z.strictObject({ kind: z.literal('page'), slug: z.string().min(1) }),
])

const module = z.strictObject({
  key: z.string(),
  style: z.string(),
  bar: z.strictObject({ cell: z.string(), box: z.string(), title: z.string().nullable(), more: link.nullable() }).nullable(),
  cell: z.string(),
  wrap: z.string(),
  widget,
})

export type RawWidget = z.infer<typeof widget>
export type RawModule = z.infer<typeof module>
export type RawNode =
  | { t: 'row'; kids: RawNode[] }
  | { t: 'col'; width: number; modules: RawModule[] }
  | { t: 'clear'; nbsp: boolean }

const node: z.ZodType<RawNode> = z.lazy(() => z.discriminatedUnion('t', [
  z.strictObject({ t: z.literal('row'), kids: z.array(node) }),
  z.strictObject({ t: z.literal('col'), width: count, modules: z.array(module) }),
  z.strictObject({ t: z.literal('clear'), nbsp: z.boolean() }),
]))

const layoutSchema = z.strictObject({ css: z.string(), grid: z.array(node) })
export type RawLayout = z.infer<typeof layoutSchema>

/* 组件引用的东西得真的存在：栏目、导航第 N 项、pages/ 下的页面 */
export interface LayoutRefs {
  folders: string[]
  navCount: number
  pages: string[]
}

export function parseLayout(name: string, raw: unknown, refs: LayoutRefs): RawLayout {
  const parsed = layoutSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(`${name} 格式不对：\n${parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`)
  }

  const errors: string[] = []
  const walk = (nodes: RawNode[], path: string) => nodes.forEach((n, i) => {
    const at = `${path}.${i}`
    if (n.t === 'row') walk(n.kids, `${at}.kids`)
    if (n.t !== 'col') return
    n.modules.forEach((m, j) => {
      const w = m.widget
      const wat = `${at}.modules.${j}.widget`
      if ((w.kind === 'list' || w.kind === 'focus') && !refs.folders.includes(w.folder)) errors.push(`${wat}.folder: 栏目 "${w.folder}" 不存在`)
      if (w.kind === 'menu' && w.source !== 'quick' && +w.source.slice(4) >= refs.navCount) errors.push(`${wat}.source: 导航里没有第 ${w.source.slice(4)} 项`)
      if (w.kind === 'page' && !refs.pages.includes(w.slug)) errors.push(`${wat}.slug: content/pages/${w.slug}.md 不存在`)
    })
  })
  walk(parsed.data.grid, 'grid')
  if (errors.length) throw new Error(`${name} 引用不存在的内容：\n${errors.map((e) => `  ${e}`).join('\n')}`)
  return parsed.data
}
