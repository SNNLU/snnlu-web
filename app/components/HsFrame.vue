<!-- Highslide 式内嵌窗：居中，宽 w+20、高 h+60，标题在左上，右上角关闭 -->
<template>
  <Teleport to="body">
    <div class="hs-dim" style="opacity:0.2" @click="emit('close')" />
    <div class="hs-frame" :style="box">
      <div class="hs-content">
        <div class="hs-header">
          <a href="#" class="hs-close" title="关闭窗体[Esc]" @click.prevent="emit('close')" />
        </div>
        <div>
          <iframe allowfullscreen="true" allowtransparency="true" frameborder="0" scrolling="auto" :src="src" :width="w" :height="h" />
        </div>
      </div>
      <div class="hs-heading">{{ title }}</div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; src: string; w: number; h: number }>()
const emit = defineEmits<{ close: [] }>()

const box = ref({})
const esc = (e: KeyboardEvent) => e.key === 'Escape' && emit('close')

onMounted(() => {
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  box.value = {
    left: `${Math.round(scrollX + (vw - props.w - 20) / 2)}px`,
    top: `${Math.round(scrollY + (vh - props.h - 60) / 2)}px`,
    width: `${props.w + 20}px`,
    height: `${props.h + 60}px`,
  }
  addEventListener('keydown', esc)
})
onUnmounted(() => removeEventListener('keydown', esc))
</script>

<style>
/* rounded-white 外框：四周多出 5px 白边带圆角与阴影 */
.hs-frame {
  position: absolute;
  z-index: 1000003;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 5px #fff, 1px 2px 10px 5px rgba(0, 0, 0, 0.3);
  font-family: Verdana, Helvetica;
  font-size: 10pt;
}

.hs-content {
  padding: 0 5px 5px;
  overflow: hidden;
}

.hs-header {
  height: 28px;
  line-height: 28px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ddd;
}

.hs-close {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background-image: url(/_tools/highslide/graphics/closeX.png);
}

.hs-close:hover {
  background-position: 0 16px;
}

.hs-heading {
  position: absolute;
  left: 0;
  top: 0;
  margin: 2px 0.4em;
  font-weight: bold;
  cursor: move;
}
</style>
