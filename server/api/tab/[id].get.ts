export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 0) throw createError({ statusCode: 404 })

  const got = await getPage(`/p/${id}/${getRequestURL(event).search}`)
  if (got.location) return { redirect: got.location }
  if (!got.html.includes('myp2c_id_main_content')) throw createError({ statusCode: 404, statusMessage: 'missing', data: got.html })
  return tabOf(id, got.html)
})
