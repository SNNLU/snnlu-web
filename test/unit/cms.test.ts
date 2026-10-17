import { describe, expect, it } from 'vitest'
import { legacyHref, mark, pageOf, searchHref } from '#shared/cms'

/* 旧站检索词的编码：百分号编码（小写、空格为 +）→ base64 → 再 URL 编码 */
const legacyToken = (kw: string) =>
  encodeURIComponent(btoa(encodeURIComponent(kw).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase()).replace(/%20/g, '+')))

describe('mark', () => {
  it('highlights every hit and escapes the rest', () => {
    expect(mark('消防<演练>消防', '消防')).toBe(
      "<span style='color:red;font:inherit'>消防</span>&lt;演练&gt;<span style='color:red;font:inherit'>消防</span>",
    )
  })

  it('escapes a keyword that contains markup', () => {
    expect(mark('a<b>c', '<b>')).toBe("a<span style='color:red;font:inherit'>&lt;b&gt;</span>c")
  })

  it('returns the escaped title when there is no keyword', () => {
    expect(mark('<x>', '')).toBe('&lt;x&gt;')
  })
})

describe('legacyHref', () => {
  it('maps old article links', () => {
    expect(legacyHref('st_app_news_i_x1001')).toBe('/news/1001/')
  })

  it('maps old search links, decoding the base64 keyword', () => {
    expect(legacyHref(`st_app_news_search_x_x_${legacyToken('消防 演练')}_x__x_0`)).toBe(searchHref('消防 演练'))
  })

  it('maps old folder listings and bare search', () => {
    expect(legacyHref('st_app_news_search_x12_x__x__x_0')).toBe('/list/12/')
    expect(legacyHref('st_app_news_search_x_x__x__x_0')).toBe('/search/')
  })

  it('ignores garbage', () => {
    expect(legacyHref('whatever')).toBeNull()
    expect(legacyHref('st_app_news_search_x3_x_%%%_x__x_0')).toBe('/list/3/')
  })
})

describe('pageOf', () => {
  it('slices one page and reports totals', () => {
    const items = Array.from({ length: 65 }, (_, i) => i)
    expect(pageOf(items, 3, 30)).toEqual({ items: [60, 61, 62, 63, 64], paging: { page: 3, pages: 3, total: 65 } })
  })
})
