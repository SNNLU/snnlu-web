<!-- 返回顶部：滚过 100px 淡入，点按 300ms 匀速回顶 -->
<template>
  <Transition name="up">
    <a v-show="shown" id="scrollUp" href="#top" title="返回顶部" @click.prevent="top" />
  </Transition>
</template>

<script setup lang="ts">
const shown = ref(false)
const check = () => (shown.value = scrollY > 100)

function top() {
  const from = scrollY
  const t0 = performance.now()
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 300)
    scrollTo(0, from * (1 - k))
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  check()
  addEventListener('scroll', check)
})
onUnmounted(() => removeEventListener('scroll', check))
</script>

<style>
#scrollUp {
  position: fixed;
  z-index: 2147483647;
  bottom: 20px;
  right: 20px;
  width: 38px;
  height: 38px;
  background: url(/_tools/jquery/scrollup/img/top.png) no-repeat;
}

.up-enter-active,
.up-leave-active {
  transition: opacity 200ms cubic-bezier(0.37, 0, 0.63, 1);
}

.up-enter-from,
.up-leave-to {
  opacity: 0;
}
</style>
