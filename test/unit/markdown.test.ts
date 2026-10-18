import { describe, expect, it } from 'vitest'
import { esc, frontMatter, markdown } from '../../server/utils/markdown'
import { DATE, detailInfo, fullTime } from '../../server/utils/format'

describe('esc', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(esc('<a href="x" title=\'y\'>&</a>')).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
  })
})

describe('markdown', () => {
  it('renders paragraphs, headings, lists and images', () => {
    const html = markdown('第一段\n第二行\n\n## 小标题\n\n- 甲\n- 乙\n\n![图注](/img/a.jpg)')
    expect(html).toContain('第一段<br>第二行')
    expect(html).toContain('<strong><span style="font-family:simsun,serif;font-size:18px">小标题</span></strong>')
    expect(html).toContain('<ul><li>')
    expect(html).toContain('<img src="/img/a.jpg" alt="图注" width="670" decoding="async">')
  })

  it('lazy-loads every image except the first', () => {
    const html = markdown('![](/1.jpg)\n\n正文\n\n![](/2.jpg)\n\n![](/3.jpg)')
    expect(html.match(/loading="lazy"/g)).toHaveLength(2)
    expect(html).toContain('<img src="/1.jpg" alt="" width="670" decoding="async">')
  })

  it('reserves the aspect ratio of local images', () => {
    const html = markdown('![](/img/scene-01.jpg)')
    expect(html).toContain('width="670" height="447"')
  })

  it('renders https-linked icons inline in a paragraph', () => {
    const html = markdown('欢迎 [![徽章](/img/a.svg)](https://github.com/SNNLU/snnlu-web) 投稿')
    expect(html).toContain('欢迎 <a href="https://github.com/SNNLU/snnlu-web" target="_blank" rel="noopener"><img src="/img/a.svg" alt="徽章"')
    expect(html).toContain('</a> 投稿')
    expect(markdown('[![x](/img/a.svg)](javascript:alert(1))')).not.toContain('<a ')
  })

  it('links mailto addresses in paragraphs and list items, punycoding the domain', () => {
    expect(markdown('- [yes@遂宁奶龙大学.lol](mailto:yes@遂宁奶龙大学.lol)')).toContain('<a href="mailto:yes@xn--psszg58c9c2281ajit.lol" style="font:inherit">yes@遂宁奶龙大学.lol</a>')
    expect(markdown('[t](mailto:t@tchirek.top)')).toContain('<a href="mailto:t@tchirek.top" style="font:inherit">t</a>')
  })

  it('never lets raw HTML through', () => {
    const html = markdown('<script>alert(1)</script>\n\n## <b>x</b>\n\n- <i>y</i>\n\n![" onerror="alert(1)](/x.jpg)')
    expect(html).not.toMatch(/<script|<b>|<i>|" onerror="/)
  })
})

describe('frontMatter', () => {
  it('splits head and body, tolerating CRLF and colons in values', () => {
    const { meta, body } = frontMatter('---\r\ntitle: 甲\r\ndate: 2026-10-12 09:04\r\n---\r\n\r\n正文')
    expect(meta).toEqual({ title: '甲', date: '2026-10-12 09:04' })
    expect(body.trim()).toBe('正文')
  })

  it('treats a file without front matter as body only', () => {
    expect(frontMatter('只有正文')).toEqual({ meta: {}, body: '只有正文' })
  })
})

describe('detailInfo', () => {
  it('escapes submitted fields (stored XSS regression)', () => {
    const info = detailInfo({ date: '2026-10-17 10:00', source: '<img src=x onerror=alert(1)>', views: 3 })
    expect(info).not.toContain('<img')
    expect(info).toContain('来源：&lt;img src=x onerror=alert(1)&gt;')
  })
})

describe('fullTime', () => {
  it('adds seconds only when the time is given', () => {
    expect(fullTime('2026-10-16 08:30')).toBe('2026-10-16 08:30:00')
    expect(fullTime('2026-10-16')).toBe('2026-10-16')
  })

  it('keeps date-only articles readable on the detail page', () => {
    expect(detailInfo({ date: '2026-10-16', source: '', views: 0 })).toMatch(/^时间：2026-10-16&nbsp;/)
  })

  it('shares the accepted formats with the validator', () => {
    expect(['2026-10-16', '2026-10-16 08:30'].every((d) => DATE.test(d))).toBe(true)
    expect(['2026/10/16', '2026-10-16 8:30', '2026-10-16T08:30'].some((d) => DATE.test(d))).toBe(false)
  })
})
