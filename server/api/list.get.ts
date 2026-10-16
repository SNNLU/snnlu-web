import { parse } from 'node-html-parser'

const ENDPOINT: Record<string, string> = {
  GetItemsHtml: '/_admin/_ms/_def_imgs/mc_news_list/mc_news_list_ajax.ashx',
  GetItems: '/_rest/st/ajax_st_app_news.ashx',
}

/* 翻页：把栏目脚本里的参数原样转给原站 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, string>
  const path = ENDPOINT[query.action]
  if (!path) throw createError({ statusCode: 400 })

  const root = parse(await postForm(path, { ...query, said: '', callback: 'x' }))
  return query.action === 'GetItems' ? stListOf(root) : { rows: rowsOf(root), paging: pagingOf(root) }
})
