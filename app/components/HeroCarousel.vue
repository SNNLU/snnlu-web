<!-- 横幅：baidufocus，5 秒一换，淡入淡出 300ms；悬停暂停，悬停圆点即切换 -->
<template>
  <CmsBox fixed box-style="z-index:9;height:465px;width:100%;left:0;min-width:1920px;top:185px">
    <div>
      <div class="baidufocus" style="width:1920px;height:465px">
        <ul class="baidufocus_list">
          <Transition v-for="(s, i) in slides" :key="s.src" name="hf">
            <li v-show="i === at" @mouseenter="hold" @mouseleave="run">
              <a :target="s.target" :href="s.href"><img style="width:1920px;height:465px" :src="s.src" :alt="s.alt"></a>
            </li>
          </Transition>
        </ul>
        <div class="baidufocus-btn" style="visibility:hidden"><span class="left_btn" /><span class="right_btn" /></div>
        <div class="baidufocus-focus">
          <span v-for="(s, i) in slides" :key="s.src" :class="{ hover: i === at }" @mouseenter="show(i)" @mouseleave="run">{{ i + 1 }}</span>
        </div>
      </div>
    </div>
  </CmsBox>
</template>

<script setup lang="ts">
import type { Slide } from '#shared/cms'

const props = defineProps<{ slides: Slide[] }>()
const at = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const hold = () => clearInterval(timer)
const run = () => {
  hold()
  timer = setInterval(() => (at.value = (at.value + 1) % props.slides.length), 5000)
}
const show = (i: number) => {
  hold()
  at.value = i
}

onMounted(run)
onUnmounted(hold)
</script>

<style>
.baidufocus {
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  padding: 0;
  font: 12px/180% Arial, Helvetica, sans-serif, 宋体;
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
  left: 0;
  top: 0;
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
