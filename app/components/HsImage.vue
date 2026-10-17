<!-- Highslide 式放大：自缩略图展开，四周留 15px，背景 20% 遮暗；点图或 Esc 收回 -->
<template>
  <Teleport to="body">
    <div class="hs-dim" :style="{ opacity: open ? 0.2 : 0 }" @click="close" />
    <img class="hs-image" :src="src" :style="box" @click="close">
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string; from: HTMLElement }>()
const emit = defineEmits<{ close: [] }>()

const MARGIN = 15
const open = ref(false)
const rect = ref(place(props.from))

function place(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }
}

const box = computed(() => ({
  left: `${rect.value.x}px`,
  top: `${rect.value.y}px`,
  width: `${rect.value.w}px`,
  height: `${rect.value.h}px`,
}))

function close() {
  open.value = false
  rect.value = place(props.from)
  setTimeout(() => emit('close'), 250)
}

const esc = (e: KeyboardEvent) => e.key === 'Escape' && close()

onMounted(() => {
  const img = new Image()
  img.onload = () => {
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight
    const k = Math.min(1, (vw - 2 * MARGIN) / img.naturalWidth, (vh - 2 * MARGIN) / img.naturalHeight)
    const w = Math.round(img.naturalWidth * k)
    const h = Math.round(img.naturalHeight * k)
    const t = rect.value
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi))
    rect.value = {
      x: clamp(t.x + t.w / 2 - w / 2, scrollX + MARGIN, scrollX + vw - MARGIN - w),
      y: clamp(t.y + t.h / 2 - h / 2, scrollY + MARGIN, scrollY + vh - MARGIN - h),
      w,
      h,
    }
    open.value = true
  }
  img.src = props.src
  props.from.style.visibility = 'hidden' // eslint-disable-line vue/no-mutating-props -- from 是页面上的缩略图元素，放大时藏起它是 Highslide 的本来效果
  addEventListener('keydown', esc)
})

onUnmounted(() => {
  props.from.style.visibility = '' // eslint-disable-line vue/no-mutating-props -- from 是页面上的缩略图元素，放大时藏起它是 Highslide 的本来效果
  removeEventListener('keydown', esc)
})
</script>

<style>
.hs-dim {
  position: fixed;
  inset: 0;
  z-index: 1000001;
  background: #000;
  transition: opacity 50ms;
}

.hs-image {
  position: absolute;
  z-index: 1000003;
  max-width: none;
  border: 2px solid #fff;
  box-shadow: 2px 3px 9px rgba(0, 0, 0, 0.35);
  cursor: zoom-out;
  transition: left 250ms, top 250ms, width 250ms, height 250ms;
}
</style>
