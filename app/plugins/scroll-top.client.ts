/* Nuxt 的 router 插件启动时会把 scrollRestoration 改回 auto，
   浏览器随后恢复上次滚动位置，于是刷新会出现“先回顶、再下滑、又弹回”的抖动。
   这里在 Nuxt 之后重新设为 manual，并只在首次加载（无 hash）时瞬移回顶。 */
export default defineNuxtPlugin({
  name: 'scroll-top-on-load',
  enforce: 'post',
  setup() {
    if (!('scrollRestoration' in history)) return
    history.scrollRestoration = 'manual'
    if (!location.hash) window.scrollTo(0, 0)
  },
})
