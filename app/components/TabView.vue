<template>
  <template v-if="tab">
    <!-- 键盘用户的第一个 Tab：跳过页头与导航 -->
    <a class="skip-link visually-hidden-focusable" href="#content">跳到正文</a>
    <!-- 页头 → 横幅（整宽，在文档流里）→ 正文与页脚；页头与正文各在一个 1200 版心里 -->
    <div id="site">
      <div id="center" class="page-center">
        <SiteHeader :nav="tab.nav" :quick="tab.quick" :tab="tab.id" />
      </div>
      <HeroCarousel v-if="tab.hero.length" :slides="tab.hero" />
      <MobileSubNav v-if="sub" v-bind="sub" />
      <div class="page-center page-main">
        <div id="main">
          <div id="content" tabindex="-1">
            <StView v-if="tab.st" :key="route.fullPath" :st="tab.st" />
            <CmsGrid v-else :nodes="tab.grid" :tab="tab.id" />
          </div>
          <SiteFooter :html="tab.footer" :quick="tab.quick" />
        </div>
      </div>
    </div>
    <div v-show="busy" id="loading"><img :src="LOADING" alt="导入数据..."></div>
    <ScrollUp />
  </template>
</template>

<script setup lang="ts">
import type { Module, Node, Tab, Visit } from '#shared/cms'

const LOADING = '/img/loading.svg'

/* src 是本页数据接口：/api/tab/<id>、/api/st/news/<id>、/api/st/list/<id>、/api/st/search，构建时都已生成好 */
const props = defineProps<{ src: string }>()
const route = useRoute()

const { data, error } = await useFetch<Tab | Visit>(() => props.src)
if (error.value) throw createError(error.value)

const visit = computed(() => (data.value && 'redirect' in data.value ? data.value.redirect : ''))
if (visit.value) await navigateTo(visit.value, { external: !visit.value.startsWith('/'), redirectCode: 302 })

const tab = computed(() => (data.value && 'grid' in data.value ? data.value : null))

/* 手机版内页抬头：栏目页取侧栏（带 focus 的菜单）的标题与链接；正文、列表取路径条里的栏目名；首页没有 */
const sub = computed(() => {
  const t = tab.value
  if (!t || t.id === 0) return null
  if (t.st) return { title: t.st.trail[1]?.label.replace(/^>>/, '') ?? t.title, links: [], current: '' }
  const walk = (nodes: Node[]): Module | undefined => {
    for (const n of nodes) {
      const hit = n.t === 'row' ? walk(n.kids) : n.t === 'col' ? n.modules.find((m) => m.widget.kind === 'menu' && m.widget.focus) : undefined
      if (hit) return hit
    }
  }
  const m = walk(t.grid)
  if (!m || m.widget.kind !== 'menu') return null
  const focus = m.widget.focus + t.id
  return { title: m.bar?.title ?? t.title, links: m.widget.links, current: m.widget.links.find((l) => l.id === focus)?.href ?? '' }
})
const busy = computed(() => useLoading().value > 0)

useHead({
  title: () => tab.value?.title,
  htmlAttrs: { class: 'skin' },
  bodyAttrs: { class: 'skin' },
  style: () => (tab.value ? [{ key: 'cms', innerHTML: tab.value.css }] : []),
})
</script>
