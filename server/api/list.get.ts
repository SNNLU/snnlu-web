/* 翻页：栏目列表或检索结果 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, string>
  const page = Math.max(1, Number(q.PageNum) || 1)
  if (q.st) {
    const { rows, paging } = await searchOf(q.folder ?? '', q.kw ?? '', page)
    return { rows, paging }
  }
  const count = Number(q.count) || 0
  const { items, paging } = pageOf(await inFolder(q.folder ?? ''), page, Number(q.size) || 15)
  return { rows: items.map((a) => rowOf(a, count, q.dated ? 'full' : '')), paging }
})
