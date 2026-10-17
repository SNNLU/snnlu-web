import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MDate from '~/components/MDate.vue'
import MobileSubNav from '~/components/MobileSubNav.vue'
import SiteHeader from '~/components/SiteHeader.vue'

const link = (label: string, href: string) => ({ label, href, target: '_self' })
/* 组件没挂到文档上，isVisible 看不出 v-show；直接看它写的 display:none */
const hidden = (el: { attributes: (k: string) => string | undefined }) => (el.attributes('style') ?? '').includes('display: none')

describe('MDate', () => {
  it('shows the day big and year.month small', async () => {
    const w = await mountSuspended(MDate, { props: { ymd: '2026-10-05' } })
    expect(w.find('b').text()).toBe('05')
    expect(w.text()).toBe('05/2026.10')
  })
})

describe('SiteHeader mobile menu', () => {
  const nav = [
    { ...link('首页', '/p/0/'), children: [] },
    { ...link('奶龙概况', '/p/9'), children: [link('奶龙大学简介', '/p/9/'), link('机构设置', '/p/10/')] },
  ]
  const quick = [{ ...link('四川奶大', 'https://example.org/'), target: '_blank' }]

  it('opens and closes, locking page scroll while open', async () => {
    const w = await mountSuspended(SiteHeader, { props: { nav, quick, tab: 0 } })
    const burger = w.find('.m-burger')
    expect(burger.attributes('aria-expanded')).toBe('false')
    await burger.trigger('click')
    expect(w.find('.m-nav').classes()).toContain('open')
    expect(document.documentElement.classList.contains('m-lock')).toBe(true)
    await burger.trigger('click')
    expect(document.documentElement.classList.contains('m-lock')).toBe(false)
  })

  it('unfolds one section at a time', async () => {
    const w = await mountSuspended(SiteHeader, { props: { nav, quick, tab: 0 } })
    const toggle = w.find('.m-row button')
    expect(w.findAll('.m-sub li')).toHaveLength(2)
    expect(hidden(w.find('.m-sub'))).toBe(true)
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(hidden(w.find('.m-sub'))).toBe(false)
  })

  it('lists the quick links and submits search to /search/', async () => {
    const w = await mountSuspended(SiteHeader, { props: { nav, quick, tab: 0 } })
    expect(w.find('.m-quick a').text()).toBe('四川奶大')
    expect(w.find('.m-search').attributes('action')).toBe('/search/')
  })
})

describe('MobileSubNav', () => {
  it('marks the current section and toggles the list', async () => {
    const links = [link('师资概况', '/p/15/'), link('教师介绍', '/p/16/')]
    const w = await mountSuspended(MobileSubNav, { props: { title: '奶龙队伍', links, current: '/p/16/' } })
    expect(w.find('.m-subtitle').text()).toBe('奶龙队伍')
    expect(hidden(w.find('.m-sublinks'))).toBe(true)
    await w.find('.m-grid').trigger('click')
    expect(hidden(w.find('.m-sublinks'))).toBe(false)
    expect(w.find('a.on').text()).toBe('教师介绍')
    expect(w.find('a.on').attributes('aria-current')).toBe('page')
  })

  it('has no toggle when there are no sub-sections', async () => {
    const w = await mountSuspended(MobileSubNav, { props: { title: '学校新闻', links: [], current: '' } })
    expect(w.find('.m-grid').exists()).toBe(false)
  })
})
