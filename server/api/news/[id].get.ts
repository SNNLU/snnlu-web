export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const a = (await articles()).find((x) => x.id === id)
  if (!a) throw createError({ statusCode: 404 })
  return { title: a.title, date: a.date, source: a.source, byline: a.byline, body: a.body, site: (await site()).name }
})
