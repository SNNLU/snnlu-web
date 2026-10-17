/* 只认四种块：段落、图片、二级标题、列表；排版照原站正文（宋体 18px，首行缩进两字） */
/* 凡是拼进 HTML（最后走 v-html）的内容字段都要先过这里；单双引号都转，属性用哪种引号都安全 */
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const TEXT = 'font-family:simsun,serif;font-size:18px'

function block(b: string) {
  const img = b.match(/^!\[(.*)\]\((\S+)\)$/)
  if (img) {
    const [, alt = '', src = ''] = img
    return `<p style="text-align:center"><img src="${esc(src)}" alt="${esc(alt)}" width="670"></p>`
  }
  if (b.startsWith('## ')) return `<p class="p" style="line-height:1.5"><strong><span style="${TEXT}">${esc(b.slice(3))}</span></strong></p>`
  if (b.startsWith('- ')) {
    const items = b.split('\n').map((l) => `<li><span style="${TEXT}">${esc(l.replace(/^- /, ''))}</span></li>`)
    return `<ul>${items.join('')}</ul>`
  }
  return `<p class="p" style="line-height:1.5;text-indent:2em"><span style="${TEXT}">${esc(b).replace(/\n/g, '<br>')}</span></p>`
}

export const markdown = (src: string) => src.trim().split(/\n{2,}/).map(block).join('\n')

/* 头部 --- 之间是 key: value */
export function frontMatter(src: string) {
  const m = src.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {} as Record<string, string>, body: src }
  const [, head = '', body = ''] = m
  const meta = Object.fromEntries(head.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]))
  return { meta, body }
}
