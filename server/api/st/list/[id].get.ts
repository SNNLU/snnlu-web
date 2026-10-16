/* 栏目列表 /list/<栏目号>/ */
export default defineEventHandler(async (event) => {
  const tab = await stTab('list', Number(getRouterParam(event, 'id')))
  if (!tab) throw createError({ statusCode: 404 })
  return tab
})
