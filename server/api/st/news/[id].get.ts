/* 正文页 /news/<id>/ */
export default defineEventHandler(async (event) => {
  const tab = await stTab('news', Number(getRouterParam(event, 'id')))
  if (!tab) throw createError({ statusCode: 404 })
  return tab
})
