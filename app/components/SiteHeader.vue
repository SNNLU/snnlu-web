<!-- 页头：绿底、实景、校训铺满整条视口宽，在 body 背景里（见 base.css）；版心内的校名、分隔线、校区字样、搜索与导航在这里 -->
<template>
  <div id="header">
    <!-- 手机版（<1024）：仿 sicnu.edu.cn 手机版，顶栏校名 + 菜单键，展开整屏菜单（快速链接、搜索、可折叠的栏目） -->
    <div class="m-bar">
      <a class="m-logo" href="/" title="遂宁奶龙大学"><img src="/img/brand.svg" alt="遂宁奶龙大学 Suining Nailong University" width="381" height="87"></a>
      <button ref="burger" type="button" class="m-burger" :class="{ on: menu }" :aria-expanded="menu" aria-controls="m-nav" :aria-label="menu ? '关闭菜单' : '打开菜单'" @click="menu = !menu"><i /><i /><i /></button>
    </div>
    <nav id="m-nav" class="m-nav" :class="{ open: menu }" aria-label="栏目">
      <div class="m-quick">
        <template v-for="(q, i) in quick" :key="q.href"><span v-if="i" aria-hidden="true">|</span><a :href="q.href" :target="q.target">{{ q.label }}</a></template>
      </div>
      <form class="m-search" role="search" action="/search/" method="get">
        <label class="visually-hidden" for="m-kw">站内搜索</label>
        <input id="m-kw" v-model="kw" type="search" name="kw" placeholder="请输入搜索关键词" autocomplete="off">
        <button type="submit" aria-label="搜索"><svg viewBox="7.5 4.5 21 21" aria-hidden="true"><circle cx="20.2" cy="12.8" r="6.9" /><path d="M15.95 11.66A4.4 4.4 0 0 1 19.06 8.55" /><path d="M16.33 18.51L10.65 24.18A1.3 1.3 0 0 1 8.82 22.35L14.49 16.67" /></svg></button>
      </form>
      <ul class="m-menu">
        <li v-for="n in nav" :key="n.label" :class="{ on: unfold === n.label }">
          <div class="m-row">
            <a :href="n.href" :target="n.target">{{ n.label }}</a>
            <button v-if="n.children.length" type="button" :aria-expanded="unfold === n.label" :aria-label="`展开${n.label}`" @click="unfold = unfold === n.label ? '' : n.label">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" /></svg>
            </button>
          </div>
          <ul v-if="n.children.length" v-show="unfold === n.label" class="m-sub">
            <li v-for="c in n.children" :key="c.label"><a :href="c.href" :target="c.target">{{ c.label }}</a></li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="head-top">
      <img class="head-brand" src="/img/brand.svg" alt="遂宁奶龙大学 Suining Nailong University" width="381" height="87">
      <span class="head-sep" aria-hidden="true" />
      <img class="head-campus" src="/img/campus.svg" alt="遂宁校区 Suining Campus" width="136" height="54">
      <!-- 普通的 GET 表单：不靠脚本也能搜，结果页从 ?kw= 读词；同原站，在新窗口打开 -->
      <form class="search" role="search" action="/search/" method="get" target="_blank">
        <label class="visually-hidden" for="site-kw">站内搜索</label>
        <input id="site-kw" v-model="kw" type="search" name="kw" placeholder="请输入搜索关键字..." autocomplete="off">
        <button type="submit" aria-label="搜索">
          <!-- 原图里的放大镜描成矢量：镜片、左上的高光、带圆头的空心手柄 -->
          <svg viewBox="7.5 4.5 21 21" aria-hidden="true"><circle cx="20.2" cy="12.8" r="6.9" /><path d="M15.95 11.66A4.4 4.4 0 0 1 19.06 8.55" /><path d="M16.33 18.51L10.65 24.18A1.3 1.3 0 0 1 8.82 22.35L14.49 16.67" /></svg>
        </button>
      </form>
    </div>
    <CmsBox cls="head-nav" box-style="height:48px;margin-right:4px;z-index:12">
      <div>
        <ul class="sf-menu sf-js-enabled sf-arrows">
          <!-- 下拉菜单：鼠标悬停或键盘聚焦都展开，Esc 收起 -->
          <li v-for="n in nav" :key="n.label" :class="{ sfHover: open === n.label }" @mouseenter="enter(n.label)" @mouseleave="leave" @focusin="enter(n.label)" @focusout="leave">
            <a
              :target="n.target"
              :href="n.href"
              :class="{ 'sf-with-ul': n.children.length }"
              :aria-haspopup="n.children.length ? 'true' : undefined"
              :aria-expanded="n.children.length ? open === n.label : undefined"
            >{{ n.label }}</a>
            <Transition name="sf">
              <ul v-if="n.children.length" v-show="open === n.label">
                <li v-for="c in n.children" :key="c.label">
                  <a :target="c.target" :href="c.href" :title="c.title">{{ c.label }}</a>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
      </div>
    </CmsBox>
  </div>
</template>

<script setup lang="ts">
import type { Link, NavItem } from '#shared/cms'

defineProps<{ nav: NavItem[]; quick: Link[]; tab: number }>()

/* 手机版菜单：展开时锁住页面滚动，Esc 收起（桌面下拉菜单也一并收起）；unfold 是当前展开的栏目 */
const menu = ref(false)
const unfold = ref('')
const esc = (e: KeyboardEvent) => {
  if (e.key !== 'Escape') return
  menu.value = false
  open.value = ''
}
watch(menu, (v) => document.documentElement.classList.toggle('m-lock', v))
/* 菜单键对齐整像素：视口宽带小数时按钮落在半像素上，三条杠会被抗锯齿成长短不一 */
const burger = ref<HTMLElement>()
function snap() {
  const el = burger.value
  if (!el) return
  el.style.translate = ''
  const frac = el.getBoundingClientRect().left % 1
  if (frac) el.style.translate = `${-frac}px 0`
}
onMounted(() => {
  addEventListener('keydown', esc)
  addEventListener('resize', snap)
  snap()
})
onUnmounted(() => {
  removeEventListener('resize', snap)
  removeEventListener('keydown', esc)
  document.documentElement.classList.remove('m-lock')
})

/* 在检索页时把当前的词回填进框里；词只在地址栏里，静态页面里没有，等到浏览器里再读 */
const route = useRoute()
const kw = ref('')
onMounted(() => {
  watch(() => route.query.kw, (q) => (kw.value = route.path.startsWith('/search') && typeof q === 'string' ? q : ''), { immediate: true })
})

const open = ref('')
let timer: ReturnType<typeof setTimeout>

const enter = (label: string) => {
  clearTimeout(timer)
  open.value = label
}
const leave = () => {
  timer = setTimeout(() => (open.value = ''), 500)
}
</script>

<style>
.sf-menu,
.sf-menu * {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sf-menu {
  float: left;
  margin-bottom: 1em;
}

.sf-menu li {
  position: relative;
  min-width: 130px;
  text-align: center;
  white-space: nowrap;
  background-color: transparent;
  transition: background 0.2s;
}

.sf-menu > li {
  float: left;
}

.sf-menu a {
  display: block;
  position: relative;
  padding: 0 10px;
  border-left: 1px solid transparent;
  border-top: 1px solid transparent;
  line-height: 35px;
  font-family: 宋体;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.sf-menu a:hover {
  color: #d1ad69;
}

.sf-menu ul {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 99;
  min-width: 130px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
}

.sf-menu ul li {
  background-color: #24694c;
}

.sf-menu ul li:hover {
  background-color: #d1ad69;
  transition: none;
}

.sf-menu ul a,
.sf-menu ul a:hover {
  font-size: 18px;
  color: #fff;
}

.sf-enter-active,
.sf-leave-active {
  transition: opacity 200ms cubic-bezier(0.37, 0, 0.63, 1);
}

.sf-enter-from,
.sf-leave-to {
  opacity: 0;
}

.head-top {
  display: flex;
  align-items: flex-start;
  height: 135px;
}

.head-brand {
  display: block;
  flex: none;
  width: 381px;
  height: 87px;
  margin: 23px 0 0 8px;
}

/* 分隔线：1px 实线，各种缩放下都清楚（旧图里是 2.5px 宽的糊边） */
.head-sep {
  flex: none;
  width: 1px;
  height: 60px;
  margin: 40px 0 0 35px;
  background: rgba(255, 255, 255, 0.55);
}

.head-campus {
  display: block;
  flex: none;
  width: 136px;
  height: 54px;
  margin: 54px 0 0 25px;
}

/* 搜索框：原先印在 head.png 上的一枚胶囊，这里用样式画出同样的胶囊（205×36，白 12.8%），位置与旧图重合 */
.search {
  flex: none;
  display: flex;
  align-items: center;
  width: 205px;
  height: 36px;
  margin: 61px 20px 0 auto;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.128);
  transition: background-color 0.2s;
}

.search:hover,
.search:focus-within {
  background-color: rgba(255, 255, 255, 0.2);
}

.search:has(:focus-visible) {
  outline: 2px solid #d1ad69;
  outline-offset: 2px;
}

.search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 0 0 22px;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: 微软雅黑;
  font-size: 14px;
  color: #fff;
}

.search input::placeholder {
  color: #ccc;
}

.search input::-webkit-search-cancel-button {
  display: none;
}

.search button {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  padding: 0 6px 0 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
}

.search button:hover {
  color: #d1ad69;
}

/* 1024–1199：版心随窗收，搜索框贴右，导航九项平分整行 */
@media (max-width: 1231.98px) {
  .search {
    left: auto;
    right: 16px;
  }

  .sf-menu {
    display: flex;
    float: none;
    width: 100%;
  }

  .sf-menu > li {
    flex: 1 1 0;
    min-width: 0;
  }

  .sf-menu > li > a {
    padding: 0 4px;
  }
}

.search svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.1;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
