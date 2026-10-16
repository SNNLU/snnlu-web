import { parse, type HTMLElement } from 'node-html-parser'
import type { Bar, FocusOptions, Link, Module, NavItem, Node, Paging, Row, Slide, St, Tab, Widget } from '#shared/cms'

const dom = (html: string) => parse(html, { blockTextElements: { script: true, style: true } })

const px = (style: string, prop: string) => +(style.match(new RegExp(`(?:^|;)${prop}:(\\d+)px`))?.[1] ?? 0)

const scripts = (el: HTMLElement) => el.querySelectorAll('script').map((s) => s.rawText).join('\n')

const strip = (el: HTMLElement) => {
  el.querySelectorAll('script, style').forEach((s) => s.remove())
  return local(el.innerHTML)
}

const link = (a: HTMLElement): Link => ({
  label: a.text,
  href: local(a.getAttribute('href') ?? ''),
  target: a.getAttribute('target') ?? '',
  title: a.getAttribute('title'),
  id: a.getAttribute('id'),
})

/* 脚本里 data:{k:'v',…} 的字面量参数 */
const literals = (js: string) =>
  Object.fromEntries([...js.matchAll(/(\w+):'((?:[^'\\]|\\.)*)'/g)].map((m) => [m[1], m[2].replace(/\\(.)/g, '$1')]))

// 原站标题里偶有空结束标签「</>」，浏览器会吞掉它
const row = (a: HTMLElement, date = ''): Row => ({
  title: a.text.replaceAll('</>', ''),
  tip: a.getAttribute('title') ?? '',
  href: local(a.getAttribute('href') ?? ''),
  target: a.getAttribute('target') ?? '',
  date,
})

export const rowsOf = (el: HTMLElement) =>
  el.querySelectorAll('.div_item').map((it) => row(it.querySelector('.div_title a')!, it.querySelector('.date')?.text))

export function pagingOf(el: HTMLElement): Paging | null {
  const m = el.querySelector('.pagination .bg-light')?.text.match(/(\d+)\/(\d+)页\s*共(\d+)条/)
  return m ? { page: +m[1], pages: +m[2], total: +m[3] } : null
}

function listOf(dm: HTMLElement): Widget {
  const box = dm.querySelector('.div_list')!
  const js = scripts(dm)
  const data = js.match(/data:\{([^}]*)\}/)?.[1]
  const query = data ? literals(data) : null
  if (query) delete query.callback
  return { kind: 'list', uid: box.id.replace('div_items_', ''), rows: rowsOf(box), paging: pagingOf(box), query }
}

function focusOf(dm: HTMLElement): Widget {
  const js = scripts(dm)
  const call = js.match(/myp2cFocus\(\{items:\[([\s\S]*?)\],([^)]*)\}\)/)!
  const slides: Slide[] = [...call[1].matchAll(/\{t:'((?:[^'\\]|\\.)*)',l:'([^']*)',escapehtml:'([^']*)'\}/g)].map((m) => {
    const a = decodeURIComponent(m[3])
    return {
      alt: m[1].replace(/\\(.)/g, '$1'),
      href: local(m[2]),
      src: local(a.match(/background-image:url\(([^)]*)\)/)?.[1] ?? ''),
      target: a.match(/target='([^']*)'/)?.[1] ?? '_blank',
    }
  })
  const o = literals(call[2])
  const num = (k: string) => +(call[2].match(new RegExp(`${k}:(\\d+)`))?.[1] ?? 0)
  const options: FocusOptions = {
    w: num('w'),
    h: num('h'),
    time: num('time'),
    titleH: num('title_h'),
    titleColor: o.title_color || '#333333',
    titleHover: o.title_color_hover || '#ff0000',
    titleBg: o.title_bg_color || '#eeeeee',
  }
  const rows = dm.querySelectorAll('.table_item').map((t) => row(t.querySelector('a')!, t.querySelector('.div_item_date')?.text))
  const root = dm.querySelector('[id^=id_]')!
  return { kind: 'focus', uid: root.id, slider: dm.querySelector('.div_img0 [id^=id_]')!.id, rows, slides, options }
}

async function tabpathOf(dm: HTMLElement, tab: number): Promise<Widget> {
  const html = await postForm('/_admin/_ms/_def_imgs/mc_tabpath/mc_tabpath_ajax.ashx', {
    action: 'GetHtml', said: '', TabId: String(tab), b_noapp: '1',
  })
  return { kind: 'tabpath', uid: dm.querySelector('[id$=_html]')!.id.replace(/_html$/, ''), trail: dom(html).querySelectorAll('a').map(link) }
}

function menuOf(dm: HTMLElement, box: HTMLElement): Widget {
  const focus = scripts(dm).match(/\$\('#(id_\w+?_)'\+_json_base\.TabId\)/)?.[1] ?? ''
  return { kind: 'menu', uid: box.id, links: box.children.filter((c) => c.tagName === 'A').map(link), focus }
}

async function widgetOf(dm: HTMLElement, tab: number): Promise<Widget> {
  const js = scripts(dm)
  if (dm.querySelector('.div_list')) return listOf(dm)
  if (js.includes('myp2cFocus')) return focusOf(dm)
  if (js.includes('mc_tabpath')) return tabpathOf(dm, tab)
  const carousel = dm.querySelector('.jcarousel')
  if (carousel) {
    return {
      kind: 'gallery',
      uid: carousel.parentNode.id,
      photos: carousel.querySelectorAll('li a').map((a) => local(a.getAttribute('href') ?? '')),
    }
  }
  const frame = dm.querySelector('iframe')
  if (frame) {
    return { kind: 'iframe', uid: frame.id, style: frame.getAttribute('style') ?? '', src: local(js.match(/attr\('src','([^']*)'\)/)?.[1] ?? '') }
  }
  const box = dm.querySelector('div > div[id^=id_]')
  if (box && box.children.some((c) => c.tagName === 'A') && box.children.every((c) => ['A', 'SCRIPT', 'DIV'].includes(c.tagName))) {
    return menuOf(dm, box)
  }
  return { kind: 'html', html: strip(dm) }
}

async function moduleOf(el: HTMLElement, tab: number): Promise<Module> {
  const trs = el.querySelector('table')!.children.filter((c) => c.tagName === 'TR')
  let bar: Bar | null = null
  if (trs.length > 1) {
    const td = trs[0].children[0]
    const more = td.querySelector('.sk_more a')
    bar = {
      cell: td.getAttribute('style') ?? '',
      box: td.children[0].getAttribute('style') ?? '',
      title: td.querySelector('.sk_title')?.text ?? '',
      more: more ? link(more) : null,
    }
  }
  const td = trs[trs.length - 1].children[0]
  const dm = td.querySelector('.div_module')!
  return {
    key: el.id.replace('myp2c_sm_div_', ''),
    style: el.getAttribute('style') ?? '',
    bar,
    cell: td.getAttribute('style') ?? '',
    wrap: bar ? td.children[0].getAttribute('style') ?? '' : '',
    widget: await widgetOf(dm, tab),
  }
}

async function gridOf(el: HTMLElement, tab: number): Promise<Node[]> {
  const out: Node[] = []
  for (const c of el.children) {
    const style = c.getAttribute('style') ?? ''
    if (style.startsWith('float:none')) out.push({ t: 'row', kids: await gridOf(c, tab) })
    else if (style.startsWith('clear:both')) out.push({ t: 'clear', nbsp: c.innerHTML.includes('&nbsp;') })
    else if (style.startsWith('float:left')) {
      const cell = c.querySelector('.myp2c_jsontable_td1')!
      const modules = await Promise.all(cell.children.filter((m) => m.id.startsWith('myp2c_sm_div_')).map((m) => moduleOf(m, tab)))
      out.push({ t: 'col', width: px(style, 'width'), modules })
    }
  }
  return out
}

function navOf(root: HTMLElement): NavItem[] {
  const menu = root.querySelector('.sf-menu')
  if (!menu) return []
  return menu.children.map((li) => ({
    ...link(li.querySelector('a')!),
    children: li.querySelectorAll('ul a').map(link),
  }))
}

function heroOf(root: HTMLElement): Slide[] {
  return root.querySelectorAll('.baidufocus_list li').map((li) => {
    const a = li.querySelector('a')!
    const img = li.querySelector('img')!
    return { src: local(img.getAttribute('src') ?? ''), alt: img.getAttribute('alt') ?? '', href: a.getAttribute('href') ?? '', target: a.getAttribute('target') ?? '' }
  })
}

function stOf(st: HTMLElement): St {
  const trail = st.querySelectorAll('.mt_text a').map(link)
  const title = st.querySelector('.div_title')
  if (title) {
    const tools = (st.querySelector('.div_bottom')?.querySelectorAll('a') ?? []).map((a) => {
      const m = (a.getAttribute('onclick') ?? '').match(/myp2c_OpenDlg\(this, '([^']*)', (\d+), (\d+), '([^']*)'\)/)
      return { label: a.text, dialog: m ? { title: m[1], w: +m[2], h: +m[3], src: local(m[4]) } : null }
    })
    return {
      trail,
      view: {
        kind: 'detail',
        title: title.childNodes[0]?.text.trim() ?? '',
        subtitle: title.querySelector('.div_subtitle')?.text ?? null,
        info: title.querySelector('.box div')?.innerHTML ?? '',
        body: strip(st.querySelector('.div_content')!),
        tools,
      },
    }
  }
  const box = st.querySelector('[id^=div_items_]')!
  const data = scripts(st).match(/data:\{([^}]*)\}/)?.[1] ?? ''
  const query = literals(data)
  delete query.callback
  return { trail, view: { kind: 'list', uid: box.id.replace('div_items_', ''), ...stListOf(box), query } }
}

/* 检索结果：标题含高亮 span，每隔几条一道 <hr/> */
export function stListOf(box: HTMLElement) {
  const items = box.querySelectorAll('.div_item')
  const rows = items.map((it) => {
    const a = it.querySelector('a')!
    return { ...row(a, it.querySelector('.other')?.text), title: a.innerHTML, rule: it.nextElementSibling?.tagName === 'HR' }
  })
  return { rows, paging: pagingOf(box) ?? { page: 1, pages: 0, total: 0 } }
}

export async function tabOf(id: number, html: string): Promise<Tab> {
  const root = dom(html)
  const content = root.getElementById('myp2c_id_main_content')!
  const st = content.querySelector('.st_div')
  // 先收样式：模块解析时会剥掉 <style>
  const css = [
    await getText(`/_home/css/skin_module_content_css.ashx?TabId=${id}&v=`),
    ...content.querySelectorAll('style').map((s) => s.rawText),
  ].join('\n')
  return {
    id,
    title: root.querySelector('title')?.text ?? '',
    css: local(css),
    grid: st ? [] : await gridOf(content.children[0], id),
    st: st ? stOf(st) : null,
    hero: heroOf(root),
    nav: navOf(root),
    footer: local(root.getElementById('myp2c_id_main_footer')?.querySelector('.div_module div')?.innerHTML ?? ''),
  }
}
