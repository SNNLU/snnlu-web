<!-- 窓の幅 絵は動かずに 秋の空 -->
<template>
  <div class="hero" role="region" aria-roledescription="轮播" aria-label="横幅">
    <div class="baidufocus" @touchstart.passive="swipe.start" @touchend="swipe.end">
      <ul class="baidufocus_list">
        <Transition v-for="(s, i) in slides" :key="s.src" name="hf">
          <li v-show="i === at" @mouseenter="hold" @mouseleave="run">
            <a :target="s.href ? s.target : undefined" :href="s.href || undefined"><img :src="s.src" :srcset="srcset(s.src)" :sizes="SIZES" width="2000" height="484" :alt="s.alt" decoding="async" :fetchpriority="i ? 'low' : 'high'"></a>
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
        >
          <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="6" /></svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Slide } from '#shared/cms'

const props = defineProps<{ slides: Slide[] }>()

/* 横幅有三档：banner-N.webp 是 2000 宽原档，-1280、-750 是缩小档（scripts/assets/banners.py 生成） */
const SIZES = '(min-width: 1920px) 1920px, 100vw'
const srcset = (src: string) =>
  /\/banner-\d+\.webp$/.test(src)
    ? [750, 1280].map((w) => `${src.replace(/\.webp$/, `-${w}.webp`)} ${w}w`).concat(`${src} 2000w`).join(', ')
    : undefined

const at = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const hold = () => clearInterval(timer)
const run = () => {
  hold()
  if (reducedMotion()) return
  timer = setInterval(() => (at.value = (at.value + 1) % props.slides.length), 5000)
}
const show = (i: number) => {
  hold()
  at.value = i
}

const step = (dir: number) => {
  hold()
  at.value = (at.value + dir + props.slides.length) % props.slides.length
  run()
}
const swipe = useSwipe(() => step(1), () => step(-1))

onMounted(run)
onUnmounted(hold)
</script>

<style>
.hero {
  position: relative;
  z-index: 9;
  max-width: 1920px;
  margin: 0 auto;
  --hero-height: 360px;
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
  margin-left: 5px;
  cursor: pointer;
}

.baidufocus-focus span svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: rgba(255, 255, 255, 0.6);
}

.baidufocus-focus span.hover svg {
  fill: #d1ad69;
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
