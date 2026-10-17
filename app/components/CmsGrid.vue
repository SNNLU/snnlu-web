<template>
  <template v-for="(n, i) in nodes" :key="i">
    <div v-if="n.t === 'row'" class="grid-row" v-bind="rowAttrs(n)"><CmsGrid :nodes="n.kids" :tab="tab" /></div>
    <div v-else-if="n.t === 'col'" class="grid-col">
      <div class="cell">
        <CmsModule v-for="m in n.modules" :key="m.key" :m="m" :tab="tab" />
        <div v-if="!n.modules.length" class="grid-spacer">&nbsp;</div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Node } from '#shared/cms'

defineProps<{ nodes: Node[]; tab: number }>()

function rowAttrs(n: Node) {
  if (n.t !== 'row') return {}
  const cols = n.kids.filter((k) => k.t === 'col')
  if (!cols.length) return {}
  const template = cols.map((c) => `${+(c.width / 1200 * 100).toFixed(4)}%`).join(' ')
  return { style: `grid-template-columns:${template}` }
}
</script>

<style>
.grid-row {
  display: grid;
  align-items: start;
  width: auto;
}

.grid-row > .grid-row {
  grid-column: 1 / -1;
}

.grid-col {
  min-width: 0;
  height: auto;
}

.grid-spacer {
  width: 1px;
  height: 1px;
  overflow: hidden;
  font-size: 0;
}
</style>
