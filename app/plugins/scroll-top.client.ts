/* Nuxt 的 router 插件启动时会把 scrollRestoration 改回 auto，
   浏览器随后恢复上次滚动位置。这里只把它重新设为 manual；
   回顶已经在 <head> 里、内容出现之前完成，不能再滚动一次，
   否则加载慢时会把已经下滑的读者拽回顶部。 */
export default defineNuxtPlugin({
  name: 'scroll-restoration-manual',
  enforce: 'post',
  setup() {
    if (!('scrollRestoration' in history)) return
    history.scrollRestoration = 'manual'
  },
})
