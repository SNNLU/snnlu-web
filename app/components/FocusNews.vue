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
                      :style="{ display: 'block', height: `${o.h}px`, backgroundImage: `url(${s.src})`, backgroundPosition: 'center center', backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%' }"
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

function start(e: TouchEvent) {
  clearTimeout(timer)
  clearTimeout(edge)
  if (pos.value === 0) pos.value = n.value
  else if (pos.value === n.value + 1) pos.value = 1
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
    pos.value += drag.value < 0 ? 1 : -1
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
  pos.value += 1
  snapEdge()
  restart()
}

function restart() {
  clearTimeout(timer)
  if (n.value > 1 && !reducedMotion()) timer = setTimeout(next, o.time)
}

onMounted(restart)
onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(edge)
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
