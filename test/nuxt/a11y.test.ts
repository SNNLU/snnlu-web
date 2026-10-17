import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Pager from '~/components/Pager.vue'
import FocusNews from '~/components/FocusNews.vue'
import HeroCarousel from '~/components/HeroCarousel.vue'
import SiteHeader from '~/components/SiteHeader.vue'
import type { Widget } from '#shared/cms'

describe('Pager', () => {
  it('has no javascript: links; pages are keyboard buttons; marks the current page', async () => {
    const w = await mountSuspended(Pager, { props: { page: 2, pages: 3, total: 70 } })
    expect(w.html()).not.toContain('href="javascript:')
    expect(w.find('[aria-current="page"]').text()).toBe('2')
    const third = w.find('[aria-label="第 3 页"]')
    expect(third.attributes('role')).toBe('button')
    expect(third.attributes('tabindex')).toBe('0')
    await third.trigger('click')
    await third.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('turn')).toEqual([[3], [3]])
  })
})

describe('FocusNews controls', () => {
  const w0: Extract<Widget, { kind: 'focus' }> = {
    kind: 'focus',
    uid: 'f',
    slider: 's',
    rows: [],
    slides: [1, 2, 3].map((i) => ({ src: `/img/${i}.jpg`, alt: `图${i}`, href: `/news/${i}/`, target: '_blank' })),
    options: { w: 390, h: 260, time: 5000, titleH: 20, titleColor: '#000', titleHover: '#25674c', titleBg: '#cedfd7' },
  }

  it('number buttons work from the keyboard', async () => {
    const w = await mountSuspended(FocusNews, { props: { w: w0 } })
    const third = w.find('[aria-label="第 3 张：图3"]')
    expect(third.attributes('role')).toBe('button')
    expect(third.attributes('tabindex')).toBe('0')
    await third.trigger('keydown', { key: 'Enter' })
    expect(third.attributes('aria-pressed')).toBe('true')
  })

  it('the caption is a real link to the article', async () => {
    const w = await mountSuspended(FocusNews, { props: { w: w0 } })
    const caption = w.find('a.caption')
    expect(caption.attributes('href')).toBe('/news/1/')
    expect(w.find('a.fn-img[tabindex="0"]').attributes('aria-label')).toBe('图1')
  })
})

describe('HeroCarousel', () => {
  it('banners are not links; dots switch slides on focus', async () => {
    const slides = [1, 2].map((i) => ({ src: `/img/banner-${i}.webp`, alt: `横幅${i}`, href: '', target: '_self' }))
    const w = await mountSuspended(HeroCarousel, { props: { slides } })
    expect(w.find('.baidufocus_list a').exists()).toBe(false)
    const dot = w.find('[aria-label="第 2 张：横幅2"]')
    await dot.trigger('focus')
    expect(dot.attributes('aria-pressed')).toBe('true')
  })
})

describe('desktop nav', () => {
  const nav = [{ label: '奶龙概况', href: '/p/9', target: '_self', children: [{ label: '机构设置', href: '/p/10/', target: '_self' }] }]

  it('opens on keyboard focus and closes with Escape', async () => {
    const w = await mountSuspended(SiteHeader, { props: { nav, quick: [], tab: 0 }, attachTo: document.body })
    const li = w.find('.sf-menu > li')
    await li.trigger('focusin')
    expect(li.classes()).toContain('sfHover')
    expect(li.find('a').attributes('aria-expanded')).toBe('true')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await w.vm.$nextTick()
    expect(li.classes()).not.toContain('sfHover')
    w.unmount()
  })
})
