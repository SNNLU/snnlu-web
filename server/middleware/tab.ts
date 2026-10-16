/* /p/<id>：跳转与「页面不存在！」照原站直接回，不进 Vue */
export default defineEventHandler(async (event) => {
  const m = event.path.match(/^\/p\/([^/?]+)(\/?)(\?.*)?$/)
  if (!m) return
  if (!m[2]) return sendRedirect(event, `/p/${m[1]}/${m[3] ?? ''}`, 302)

  const got = await getPage(`/p/${m[1]}/${m[3] ?? ''}`)
  if (got.location) return sendRedirect(event, got.location, 302)
  if (!got.html.includes('myp2c_id_main_content')) {
    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return got.html
  }
})
