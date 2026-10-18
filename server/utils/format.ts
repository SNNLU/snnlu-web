/* 拼进 v-html 的展示文本；纯函数，便于单测 */
import { esc } from './markdown'
import type { Article } from './content'

/* 头部 date 的两种写法，与 .github/scripts/validate-content.mjs 保持一致 */
export const DATE = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/

/* 原站时间带秒：写了时分就补 :00，只写日期就只显示日期 */
export const fullTime = (date: string) => (date.length > 10 ? `${date}:00` : date)

/* 详情页标题下那一行：时间、来源。头部字段来自投稿，必须转义 */
export const detailInfo = (a: Pick<Article, 'date' | 'source'>) =>
  `时间：${esc(fullTime(a.date))}&nbsp;&nbsp;&nbsp;来源：${esc(a.source)}`
