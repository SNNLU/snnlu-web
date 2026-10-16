export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const tab = Number.isInteger(id) && id >= 0 ? await tabOf(id) : null
  if (!tab) throw createError({ statusCode: 404 })
  return tab
})
