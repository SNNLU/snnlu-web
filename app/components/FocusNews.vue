<!-- 春風や 指の向きには 絵が流れ -->
<template>
  <div>
    <div :id="w.uid">
      <div class="d-flex align-items-start w-100">
        <div v-if="activeItem" class="td_img0">
          <div class="div_img0">
            <div :id="w.slider">
              <div class="fn-box" :style="{ width: `${o.w}px`, height: 'auto', border: '0px' }">
                <div
                  class="fn-view"
                  :style="{ position: 'relative', overflow: 'hidden', width: `${o.w}px`, height: `${o.h - o.titleH}px` }"
                  @touchstart.passive="start"
                  @touchmove.passive="move"
                  @touchend="end"
                  @touchcancel="cancel"
                >
                  <div class="fn-track" :style="trackStyle">
                    <a
                      v-for="(s, i) in track"
                      :key="`${i}-${s.src}`"
                      class="fn-img"
                      draggable="false"
                      :style="{ display: 'block', height: `${o.h}px`, backgroundImage: bg(i, s.src), backgroundPosition: 'center center', backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%' }"
                      :target="s.target"
                      :href="s.href"
                      :aria-label="s.alt"
                      :aria-hidden="realIndex(i) === activeIndex ? undefined : 'true'"
                      :tabindex="realIndex(i) === activeIndex ? 0 : -1"
                    >&nbsp;</a>
                  </div>
                  <div class="fn-btns" :style="{ width: `${o.w}px`, height: '18px', position: 'absolute', left: '0px', bottom: '0px', border: '0px', zIndex: 999 }">
                    <div
                      v-for="i in order"
                      :key="i"
                      class="btn-num"
                      :class="{ on: i === activeIndex }"
                      :style="{ backgroundColor: i === activeIndex ? '#ff0000' : '#333333', borderColor: i === hover ? '#ff0000' : '#eeeeee' }"
                      :title="w.slides[i]?.alt"
                      role="button"
                      tabindex="0"
                      :aria-label="`第 ${i + 1} 张：${w.slides[i]?.alt}`"
                      :aria-pressed="i === activeIndex"
                      @mouseover="hover = i"
                      @mouseout="hover = -1"
                      @click="goTo(i)"
                      @keydown.enter.space.prevent="goTo(i)"
                    >{{ i + 1 }}</div>
                  </div>
                </div>
                <div>
                  <a
                    class="caption"
                    :href="activeItem.href"
                    target="_blank"
                    :style="{ height: `${o.titleH}px`, lineHeight: `${o.titleH}px`, backgroundColor: o.titleBg, color: lit ? o.titleHover : o.titleColor }"
                    @mouseover="lit = true"
                    @mouseout="lit = false"
                  >{{ activeItem.alt }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-fill">
          <ul class="div_items">
            <li v-for="r in w.rows" :key="r.href" class="table_item">
              <div class="div_item_link"><MDate v-if="r.ymd" :ymd="r.ymd" /><a :title="r.tip" :target="r.target" :href="r.href">{{ r.title }}</a></div>
              <div class="div_item_date">{{ r.date }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '#shared/cms'

const props = defineProps<{ w: Extract<Widget, { kind: 'focus' }> }>()
const o = props.w.options

const hover = ref(-1)
const lit = ref(false)
const drag = ref(0)
const smooth = ref(true)

const slides = computed(() => props.w.slides)
const n = computed(() => slides.value.length)
const track = computed(() => {
  const list = slides.value
  return list.length > 1 ? [list[list.length - 1]!, ...list, list[0]!] : list
})
const pos = ref(n.value > 1 ? 1 : 0)
const realIndex = (i: number) => (n.value > 1 ? (i - 1 + n.value) % n.value : 0)
const activeIndex = computed(() => (n.value > 1 ? (pos.value - 1 + n.value) % n.value : 0))
const activeItem = computed(() => slides.value[activeIndex.value])
const order = computed(() => slides.value.map((_, i) => i).reverse())

/* 只给当前和预取的图片挂背景；其余 slide 不下载 */
const loaded = ref<number[]>([0])
const ensure = (i: number) => {
  const len = n.value
  if (!len) return
  const k = ((i % len) + len) % len
  if (!loaded.value.includes(k)) loaded.value = [...loaded.value, k]
}
const bg = (i: number, src: string) => (loaded.value.includes(realIndex(i)) ? `url(${src})` : 'none')

/* 手机版首张新闻图就是 LCP：提前预载，桌面版仍由横幅承担首屏 */
useHead({
  link: computed(() => {
    const src = slides.value[0]?.src
    return src ? [{ rel: 'preload' as const, as: 'image' as const, href: src, media: '(max-width: 767px)', fetchpriority: 'high' as const }] : []
  }),
})

const trackStyle = computed(() => ({
  transform: `translate3d(calc(${-pos.value * 100}% + ${drag.value}px), 0, 0)`,
  transition: smooth.value ? 'transform 300ms cubic-bezier(0.37, 0, 0.63, 1)' : 'none',
}))

let sx = 0
let sy = 0
let axis: 'x' | 'y' | '' = ''
let dragging = false
let timer: ReturnType<typeof setTimeout> | undefined
let edge: ReturnType<typeof setTimeout> | undefined
let warmTimer: ReturnType<typeof setTimeout> | undefined

/* 当前图加载完再预取下一张；不要在 LCP 之前抢带宽 */
function scheduleWarm() {
  clearTimeout(warmTimer)
  warmTimer = setTimeout(() => ensure(activeIndex.value + 1), 700)
}

function probeActive() {
  const i = activeIndex.value
  const src = slides.value[i]?.src
  if (!src) return
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => {
    if (activeIndex.value === i) scheduleWarm()
  }
  img.src = src
}

function start(e: TouchEvent) {
  clearTimeout(timer)
  clearTimeout(edge)
  if (pos.value === 0) pos.value = n.value
  else if (pos.value === n.value + 1) pos.value = 1
  ensure(activeIndex.value + 1)
  ensure(activeIndex.value - 1)
  const t = e.touches[0]
  if (!t) return
  dragging = true
  sx = t.clientX
  sy = t.clientY
  axis = ''
  drag.value = 0
  smooth.value = false
}

function move(e: TouchEvent) {
  if (!dragging) return
  const t = e.touches[0]
  if (!t) return
  const dx = t.clientX - sx
  const dy = t.clientY - sy
  if (!axis) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
  }
  if (axis === 'x') drag.value = dx
}

function end() {
  if (!dragging) return
  dragging = false
  if (axis === 'x' && Math.abs(drag.value) > 40) {
    const d = drag.value < 0 ? 1 : -1
    ensure(activeIndex.value + d)
    pos.value += d
    snapEdge()
  }
  drag.value = 0
  smooth.value = true
  restart()
}

function cancel() {
  dragging = false
  drag.value = 0
  smooth.value = true
  restart()
}

function goTo(i: number) {
  if (n.value < 2) return restart()
  ensure(i)
  let delta = i + 1 - pos.value
  if (delta > n.value / 2) delta -= n.value
  else if (delta < -n.value / 2) delta += n.value
  if (!delta) return restart()
  clearTimeout(edge)
  drag.value = 0
  smooth.value = true
  pos.value += delta
  snapEdge()
  restart()
}

function snapEdge() {
  clearTimeout(edge)
  edge = setTimeout(() => {
    if (pos.value === 0) pos.value = n.value
    else if (pos.value === n.value + 1) pos.value = 1
    smooth.value = false
    requestAnimationFrame(() => requestAnimationFrame(() => (smooth.value = true)))
  }, 320)
}

function next() {
  ensure(activeIndex.value + 1)
  pos.value += 1
  snapEdge()
  restart()
}

function restart() {
  clearTimeout(timer)
  if (n.value > 1 && !reducedMotion()) timer = setTimeout(next, o.time)
}

watch(activeIndex, (i) => {
  clearTimeout(warmTimer)
  ensure(i)
  if (import.meta.client) probeActive()
})

onMounted(() => {
  ensure(0)
  probeActive()
  restart()
})
onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(edge)
  clearTimeout(warmTimer)
})
</script>

<style scoped>
.fn-view {
  touch-action: pan-y;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.fn-track {
  position: absolute;
  inset: 0;
  display: flex;
  will-change: transform;
}

.fn-img {
  flex: 0 0 100%;
  width: 100%;
  -webkit-user-drag: none;
}

.btn-num {
  float: right;
  margin: 1px;
  padding: 0;
  width: 20px;
  height: 14px;
  line-height: 14px;
  font-size: 11px;
  color: #fff;
  border-width: 1px;
  border-style: solid;
  text-align: center;
  cursor: pointer;
  opacity: 0.5;
  transition: width 0.3s, background-color 0.3s;
}

.caption {
  display: block;
  text-decoration: none;
  font-family: 微软雅黑;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  text-align: center;
  border: 0;
  width: 100%;
}

.caption:hover {
  font-weight: bold;
}
</style>
