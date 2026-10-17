/* /p/<id>/：跳转与「页面不存在！」直接回，不进 Vue（只在开发与构建时生效，线上是静态文件） */
export default defineEventHandler(async (event) => {
  const m = event.path.match(/^\/p\/([^/?]+)\/?(\?.*)?$/)
  if (!m) return
  const [, id = '', query] = m

  const s = await site()
  const to = s.redirects[id]
  if (to) return sendRedirect(event, to, 302)
  if (!query && !(await layout(Number(id)))) {
    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return '页面不存在！'
  }
})
