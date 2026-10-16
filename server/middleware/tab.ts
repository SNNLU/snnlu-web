/* /p/<id>/：跳转与「页面不存在！」直接回，不进 Vue（只在开发与构建时生效，线上是静态文件） */
export default defineEventHandler(async (event) => {
  const m = event.path.match(/^\/p\/([^/?]+)\/?(\?.*)?$/)
  if (!m) return

  const s = await site()
  if (s.redirects[m[1]]) return sendRedirect(event, s.redirects[m[1]], 302)
  if (!m[2] && !(await layout(Number(m[1])))) {
    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return '页面不存在！'
  }
})
