import type { RouterConfig } from 'nuxt/schema'
import { START_LOCATION } from 'vue-router'

/* Nuxt 把「水合后的第一次导航」当成初次加载，交给这里时 from 是 START_LOCATION，默认实现会 scrollTo(0, 0)。
   静态页水合时 Nuxt 会补一次原地导航（同一个地址），于是读者在页面已出现、JS 还没跑完时滚下去的位置，
   被这一下拽回顶部。这里：落地页自己的那次导航不滚动；其余照默认——换页回顶、同页不动、有 hash 就定位。 */
const trim = (path: string) => path.replace(/\/$/, '')
const landing = import.meta.client ? trim(location.pathname) : ''

export default {
  scrollBehavior(to, from, saved) {
    if (trim(to.path) === trim(from.path)) return to.hash ? { el: to.hash } : false
    if (from === START_LOCATION && trim(to.path) === landing) return false
    if (saved) return saved
    if (to.hash) return { el: to.hash }
    return { left: 0, top: 0 }
  },
} satisfies RouterConfig
