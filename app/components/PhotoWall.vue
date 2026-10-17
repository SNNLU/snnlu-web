<!-- 校园掠影：jCarousel 0.3 的步进规则（每 3 秒 +1，到尾回到头），点图放大 -->
<template>
  <div>
    <div :id="w.uid" class="photo-wall">
      <div ref="clip" class="jcarousel">
        <ul :style="{ left: `${left}px`, transition: moving ? `left 400ms ${SWING}` : 'none' }" @transitionend="moving = false">
          <li v-for="(p, i) in w.photos" :key="i">
            <a :href="p" class="highslide" :title="`放大第 ${i + 1} 张`" @click.prevent="zoom"><img :src="p" :alt="`校园掠影 ${i + 1}`" loading="lazy" decoding="async"></a>
          </li>
        </ul>
      </div>
      <a href="#" class="jcarousel-control-prev" role="button" aria-label="上一张" @click.prevent="prev">&lsaquo;</a>
      <a href="#" class="jcarousel-control-next" role="button" aria-label="下一张" @click.prevent="next">&rsaquo;</a>
    </div>
    <HsImage v-if="lens" :src="lens.src" :from="lens.from" @close="lens = null" />
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '#shared/cms'

const props = defineProps<{ w: Extract<Widget, { kind: 'gallery' }> }>()

const ITEM = 302 // li 292 + margin-right 10
const MARGIN = 10
const n = props.w.photos.length
const clip = ref<HTMLElement>()
const left = ref(0)
const moving = ref(false)
const lens = ref<{ src: string; from: HTMLElement } | null>(null)

const zoom = (e: MouseEvent) => {
  const img = (e.currentTarget as HTMLElement).querySelector('img')!
  lens.value = { src: img.getAttribute('src')!, from: img }
}

/* jCarousel 的状态：target / first / last / tail */
let target = 0
let first = 0
let last = 0
let tail = 0
let inTail = false

function prepare(i: number) {
  const room = clip.value?.clientWidth ?? 1198
  let h = ITEM
  first = last = i
  for (let a = i + 1; h < room && a < n; a++, h += ITEM) last = a
  for (let a = i - 1; h < room && a >= 0; a--, h += ITEM) first = a
  tail = last === n - 1 && h - MARGIN > room ? h - MARGIN - room : 0
}

function scrollTo(i: number) {
  if (moving.value) return
  inTail = false
  prepare(i)
  target = i
  let s = first * ITEM
  if (tail && i > first) {
    s += tail
    inTail = true
  }
  if (-s === left.value) return
  moving.value = true
  left.value = -s
}

function next() {
  if (moving.value) return
  if (last >= n - 1 && tail) {
    if (inTail) return scrollTo(0)
    moving.value = true
    left.value -= tail
    inTail = true
  } else if (last === n - 1) scrollTo(0)
  else scrollTo(Math.min(target + 1, n - 1))
}

function prev() {
  if (inTail) return scrollTo(Math.max(first, 0))
  scrollTo(first <= 0 ? n - 1 : first - 1)
}

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  prepare(0)
  if (!reducedMotion()) timer = setInterval(next, 3000)
})
onUnmounted(() => clearInterval(timer))
</script>
