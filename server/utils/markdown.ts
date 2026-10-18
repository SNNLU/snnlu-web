/* 只认几种块：段落（可夹带 https 链接小图标）、图片、二级标题、列表；排版照原站正文（宋体 18px，首行缩进两字） */
/* 凡是拼进 HTML（最后走 v-html）的内容字段都要先过这里；单双引号都转，属性用哪种引号都安全 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const TEXT = 'font-family:simsun,serif;font-size:18px'

/* 文章图是本地 /img/*：读一次尺寸并缓存，给 <img> 补 height，加载前就占好版面 */
type Size = { w: number; h: number }
const sizes = new Map<string, Size | null>()

function jpegSize(b: Buffer): Size | null {
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++
      continue
    }
    const marker = b[i + 1]!
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2
      continue
    }
    const len = b.readUInt16BE(i + 2)
    if (len < 2) return null
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) }
    }
    i += 2 + len
  }
  return null
}

function pngSize(b: Buffer): Size | null {
  if (b.length < 24 || b[0] !== 0x89 || b[1] !== 0x50 || b[2] !== 0x4e || b[3] !== 0x47) return null
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}

function webpSize(b: Buffer): Size | null {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null
  let i = 12
  while (i + 8 <= b.length) {
    const id = b.toString('ascii', i, i + 4)
    const len = b.readUInt32LE(i + 4)
    const p = i + 8
    if (id === 'VP8X' && p + 10 <= b.length) {
      return { w: 1 + (b[p + 4]! | (b[p + 5]! << 8) | (b[p + 6]! << 16)), h: 1 + (b[p + 7]! | (b[p + 8]! << 8) | (b[p + 9]! << 16)) }
    }
    if (id === 'VP8 ' && p + 10 <= b.length && b[p + 3] === 0x9d && b[p + 4] === 0x01 && b[p + 5] === 0x2a) {
      return { w: (b[p + 6]! | (b[p + 7]! << 8)) & 0x3fff, h: (b[p + 8]! | (b[p + 9]! << 8)) & 0x3fff }
    }
    if (id === 'VP8L' && p + 5 <= b.length && b[p] === 0x2f) {
      const bits = b[p + 1]! | (b[p + 2]! << 8) | (b[p + 3]! << 16) | (b[p + 4]! << 24)
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
    }
    i += 8 + len + (len & 1)
  }
  return null
}

function imageSize(src: string): Size | null {
  if (!src.startsWith('/img/')) return null
  const path = src.split(/[?#]/)[0]!
  if (sizes.has(path)) return sizes.get(path)!
  let size: Size | null = null
  try {
    const b = readFileSync(join(process.cwd(), 'public', path.slice(1)))
    size = jpegSize(b) ?? pngSize(b) ?? webpSize(b)
  } catch {
    /* 图片不存在或格式不认识：不加 height */
  }
  sizes.set(path, size)
  return size
}

function imgTag(alt: string, src: string) {
  const size = imageSize(src)
  const height = size && size.w > 0 ? Math.round(670 * size.h / size.w) : 0
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="670"${height ? ` height="${height}"` : ''} loading="lazy" decoding="async">`
}

/* 段落里的 [![图注](/img/x.svg)](https://…)：与字等高的小图标，只认 https，新窗口打开 */
const BADGE = /\[!\[([^\]]*)\]\((\/img\/\S+?)\)\]\((https:\/\/[^\s)]+)\)/g
function inline(text: string) {
  let out = ''
  let last = 0
  for (const m of text.matchAll(BADGE)) {
    out += esc(text.slice(last, m.index)).replace(/\n/g, '<br>')
    out += `<a href="${esc(m[3]!)}" target="_blank" rel="noopener"><img src="${esc(m[2]!)}" alt="${esc(m[1]!)}" style="height:1.4em;vertical-align:middle" decoding="async"></a>`
    last = m.index + m[0].length
  }
  return out + esc(text.slice(last)).replace(/\n/g, '<br>')
}

function block(b: string) {
  const img = b.match(/^!\[(.*)\]\((\S+)\)$/)
  if (img) return `<p style="text-align:center">${imgTag(img[1] ?? '', img[2] ?? '')}</p>`
  if (b.startsWith('## ')) return `<p class="p" style="line-height:1.5"><strong><span style="${TEXT}">${esc(b.slice(3))}</span></strong></p>`
  if (b.startsWith('- ')) {
    const items = b.split('\n').map((l) => `<li><span style="${TEXT}">${esc(l.replace(/^- /, ''))}</span></li>`)
    return `<ul>${items.join('')}</ul>`
  }
  return `<p class="p" style="line-height:1.5;text-indent:2em"><span style="${TEXT}">${inline(b)}</span></p>`
}

export function markdown(src: string) {
  const html = src.trim().split(/\n{2,}/).map(block).join('\n')
  // 第一张图多半在首屏，不延迟；其余的滚到附近再载
  return html.replace(' loading="lazy"', '')
}

/* 头部 --- 之间是 key: value */
export function frontMatter(src: string) {
  const m = src.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {} as Record<string, string>, body: src }
  const [, head = '', body = ''] = m
  const meta = Object.fromEntries(head.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]))
  return { meta, body }
}
