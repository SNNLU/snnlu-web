import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FocusNews from '~/components/FocusNews.vue'
import type { Widget } from '#shared/cms'

const widget = (slides: number): Extract<Widget, { kind: 'focus' }> => ({
  kind: 'focus',
  uid: 'f',
  slider: 's',
  rows: [{ title: '一条新闻', tip: '一条新闻', href: '/news/1/', target: '_blank', date: ' 10-12 ' }],
  slides: Array.from({ length: slides }, (_, i) => ({ src: `/img/${i}.jpg`, alt: `图${i + 1}`, href: `/news/${i}/`, target: '_blank' })),
  options: { w: 390, h: 260, time: 5000, titleH: 20, titleColor: '#000', titleHover: '#25674c', titleBg: '#cedfd7' },
})

describe('FocusNews', () => {
  it('renders the list without a carousel when no article has a cover', async () => {
    const w = await mountSuspended(FocusNews, { props: { w: widget(0) } })
    expect(w.find('.td_img0').exists()).toBe(false)
    expect(w.text()).toContain('一条新闻')
  })

  it('renders one numbered button per slide', async () => {
    const w = await mountSuspended(FocusNews, { props: { w: widget(3) } })
    expect(w.findAll('.btn-num')).toHaveLength(3)
    expect(w.find('.caption').text()).toBe('图1')
  })
})
