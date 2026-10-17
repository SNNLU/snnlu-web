<!-- 窓の幅 絵は動かずに 秋の空 -->
<template>
  <div class="hero" role="region" aria-roledescription="轮播" aria-label="横幅">
    <div class="baidufocus" @touchstart.passive="swipe.start" @touchend="swipe.end">
      <ul class="baidufocus_list">
        <Transition v-for="(s, i) in slides" :key="s.src" name="hf">
          <li v-show="i === at" @mouseenter="hold" @mouseleave="run">
            <img
              v-if="loaded.includes(i)"
              :src="s.src"
              :srcset="srcset(s.src)"
              :sizes="SIZES"
              width="2000"
              height="484"
              :alt="s.alt"
              decoding="async"
              :fetchpriority="i ? 'low' : 'high'"
              @load="onLoad(i)"
            >
          </li>
        </Transition>
      </ul>
      <div class="baidufocus-btn" style="visibility:hidden"><span class="left_btn" /><span class="right_btn" /></div>
      <div class="baidufocus-focus">
        <!-- 圆点：鼠标悬停或键盘聚焦即切到这一张 -->
        <span
          v-for="(s, i) in slides"
          :key="s.src"
          :class="{ hover: i === at }"
          role="button"
          tabindex="0"
          :aria-label="`第 ${i + 1} 张：${s.alt}`"
          :aria-pressed="i === at"
          @mouseenter="show(i)"
          @mouseleave="run"
          @focus="show(i)"
          @blur="run"
          @keydown.enter.space.prevent="show(i)"
        >{{ i + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Slide } from '#shared/cms'

const props = defineProps<{ slides: Slide[] }>()

/* 横幅五档：banner-N.webp 是 2000 主档，3840 / 2560 / 1280 / 750 为 srcset 候选（scripts/assets/banners.py 生成） */
const SIZES = '(min-width: 1920px) 1920px, 100vw'
const srcset = (src: string) =>
  /\/banner-\d+\.webp$/.test(src)
    ? [750, 1280, 2560, 3840].map((w) => `${src.replace(/\.webp$/, `-${w}.webp`)} ${w}w`).join(', ')
    : undefined

const at = ref(0)
/* 只给当前和即将切换的横幅挂 src；隐藏的 slide 不下载 */
const loaded = ref<number[]>([0])
let timer: ReturnType<typeof setInterval> | undefined
let warmTimer: ReturnType<typeof setTimeout> | undefined

const ensure = (i: number) => {
  const len = props.slides.length
  if (!len) return
  const k = ((i % len) + len) % len
  if (!loaded.value.includes(k)) loaded.value = [...loaded.value, k]
}

const hold = () => clearInterval(timer)
const onLoad = (i: number) => {
  if (i !== at.value || reducedMotion()) return
  clearTimeout(warmTimer)
  const delay = document.documentElement.dataset.ua === 'mobile' ? 3000 : 600
  warmTimer = setTimeout(() => ensure(at.value + 1), delay)
}
const run = () => {
  hold()
  if (reducedMotion()) return
  timer = setInterval(() => {
    ensure(at.value + 1)
    at.value = (at.value + 1) % props.slides.length
  }, 5000)
}
const show = (i: number) => {
  hold()
  ensure(i)
  at.value = i
}

const step = (dir: number) => {
  hold()
  const next = (at.value + dir + props.slides.length) % props.slides.length
  ensure(next)
  at.value = next
  run()
}
const swipe = useSwipe(() => step(1), () => step(-1))

onMounted(() => {
  run()
  /* 图片若已在缓存里，load 事件可能早于 hydration；补一次预取下一张 */
  const img = document.querySelector<HTMLImageElement>('.baidufocus_list li img')
  if (img?.complete) onLoad(at.value)
})
onUnmounted(() => {
  hold()
  clearTimeout(warmTimer)
})
</script>

<style>
.hero {
  position: relative;
  z-index: 9;
  max-width: 1920px;
  margin: 0 auto;
  --hero-height: 465px;
  aspect-ratio: 1920 / 465;
  overflow: hidden;
}

html[data-ua="desktop"] .hero {
  height: var(--hero-height);
  aspect-ratio: auto;
}

.baidufocus {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  font: 12px/180% Arial, Helvetica, sans-serif, 宋体;
  touch-action: pan-y;
}

.baidufocus * {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.baidufocus a {
  text-decoration: none;
}

.baidufocus_list {
  width: 0;
  height: 0;
  overflow: hidden;
}

.baidufocus_list li {
  position: absolute;
  inset: 0;
}

.baidufocus_list img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.baidufocus-btn,
.baidufocus-focus {
  position: absolute;
}

.baidufocus-btn {
  width: 100%;
  height: 41px;
  top: 50%;
  margin-top: -20px;
}

.baidufocus-focus {
  height: 40px;
  line-height: 40px;
  left: 50%;
  bottom: 0;
  margin-left: -25px;
  z-index: 2;
}

.baidufocus-focus span {
  position: relative;
  top: 14px;
  float: left;
  display: block;
  width: 12px;
  height: 12px;
  line-height: 12px;
  margin-left: 5px;
  text-indent: -9999px;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
}

.baidufocus-focus span.hover {
  background: #d1ad69;
}

.hf-enter-active,
.hf-leave-active {
  transition: opacity 300ms cubic-bezier(0.37, 0, 0.63, 1);
}

.hf-enter-from,
.hf-leave-to {
  opacity: 0;
}
</style>
