/* /p/<id>：补斜杠、跳转与「页面不存在！」直接回，不进 Vue */
export default defineEventHandler(async (event) => {
  const m = event.path.match(/^\/p\/([^/?]+)(\/?)(\?.*)?$/)
  if (!m) return
  if (!m[2]) return sendRedirect(event, `/p/${m[1]}/${m[3] ?? ''}`, 302)

  const s = await site()
  if (s.redirects[m[1]]) return sendRedirect(event, s.redirects[m[1]], 302)
  if (!m[3] && !(await layout(Number(m[1])))) {
    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return '页面不存在！'
  }
})
