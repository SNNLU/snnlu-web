<!-- 版面：行里套行，列左浮，每行末一道 1px 的清浮动 -->
<template>
  <template v-for="(n, i) in nodes" :key="i">
    <div v-if="n.t === 'row'" class="grid-row"><CmsGrid :nodes="n.kids" :tab="tab" /></div>
    <div v-else-if="n.t === 'col'" class="grid-col" :style="{ width: `${n.width}px` }">
      <div class="cell">
        <CmsModule v-for="m in n.modules" :key="m.key" :m="m" :tab="tab" />
        <div v-if="!n.modules.length" class="grid-spacer">&nbsp;</div>
      </div>
    </div>
    <div v-else class="grid-clear">{{ n.nbsp ? ' ' : '' }}</div>
  </template>
</template>

<script setup lang="ts">
import type { Node } from '#shared/cms'

defineProps<{ nodes: Node[]; tab: number }>()
</script>

<style>
.grid-row {
  float: none;
  clear: both;
  width: auto;
}

.grid-col {
  float: left;
  clear: none;
  height: auto;
}

.grid-clear {
  clear: both;
  font-size: 0;
  height: 1px;
}

.grid-spacer {
  width: 1px;
  height: 1px;
  overflow: hidden;
  font-size: 0;
}
</style>
