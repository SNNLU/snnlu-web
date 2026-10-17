/* 拼进 v-html 的展示文本；纯函数，便于单测 */
import { esc } from './markdown'
import type { Article } from './content'

/* 详情页标题下那一行：时间、来源、查看次数。头部字段来自投稿，必须转义 */
export const detailInfo = (a: Pick<Article, 'date' | 'source' | 'views'>) =>
  `时间：${esc(a.date)}:00&nbsp;&nbsp;&nbsp;来源：${esc(a.source)}&nbsp;&nbsp;&nbsp;查看：<span>${a.views}</span>`
