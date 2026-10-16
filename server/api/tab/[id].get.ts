export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const url = getRequestURL(event)
  const tab = Number.isInteger(id) && id >= 0 ? await tabOf(id, url.searchParams.get('StId') ?? '', url.origin) : null
  if (!tab) throw createError({ statusCode: 404 })
  return tab
})
