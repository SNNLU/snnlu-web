<template>
  <CmsBox
    :id="`myp2c_sm_div_${m.key}`"
    :cls="`myp2c_sm_css_${m.key}`"
    :box-style="m.style"
    :bar="m.bar"
    :cell="m.cell"
    :wrap="m.wrap"
  >
    <NewsList v-if="w.kind === 'list'" :w="w" />
    <FocusNews v-else-if="w.kind === 'focus'" :w="w" />
    <MenuLinks v-else-if="w.kind === 'menu'" :w="w" :tab="tab" />
    <TabPath v-else-if="w.kind === 'tabpath'" :w="w" />
    <PhotoWall v-else-if="w.kind === 'gallery'" :w="w" />
    <div v-else-if="w.kind === 'iframe'">
      <iframe :id="w.uid" allowfullscreen="true" allowtransparency="true" :style="w.style" frameborder="0" scrolling="no" :src="w.src" />
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- pages/*.md 经 markdown() 逐块转义 -->
    <div v-else v-html="w.html" />
  </CmsBox>
</template>

<script setup lang="ts">
import type { Module } from '#shared/cms'

const props = defineProps<{ m: Module; tab: number }>()
const w = computed(() => props.m.widget)
</script>
