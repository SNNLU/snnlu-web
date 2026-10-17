<!-- 版面：行里套行，列左浮，每行末一道 1px 的清浮动 -->
<template>
  <template v-for="(n, i) in nodes" :key="i">
    <div v-if="n.t === 'row'" class="grid-row"><CmsGrid :nodes="n.kids" :tab="tab" /></div>
    <div v-else-if="n.t === 'col'" class="grid-col" :style="{ '--w': n.width }">
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

/* 列宽取自版式（按 1200 版心排的 px）；版心变窄时换成同比例的百分比，略减一点免得浮动因舍入换行 */
.grid-col {
  float: left;
  clear: none;
  width: calc(var(--w) * 1px);
  height: auto;
}

@media (max-width: 1199.98px) {
  .grid-col {
    width: calc(var(--w) / 1200 * 100% - 0.05px);
  }
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
