<!-- 侧栏与快速链接：一排浮动的链接，当前栏目加 focus -->
<template>
  <div>
    <!-- 带 focus 的是内页侧栏，不带的是首页快速链接 -->
    <div :id="w.uid" class="menu-links" :class="{ side: w.focus }">
      <a
        v-for="l in w.links"
        :id="l.id"
        :key="l.href + l.label"
        :class="{ focus: w.focus && l.id === w.focus + tab }"
        :target="l.target"
        :href="l.href"
        :title="l.title"
      >{{ l.label }}</a>
      <div />
    </div>
    <div class="grid-clear">&nbsp;</div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '#shared/cms'

defineProps<{ w: Extract<Widget, { kind: 'menu' }>; tab: number }>()
</script>
