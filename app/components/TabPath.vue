<template>
  <div>
    <div :id="w.uid">&nbsp;当前位置：首页&nbsp;<span :id="`${w.uid}_html`"><a
      v-for="l in w.trail"
      :key="l.href"
      class="r10"
      :target="l.target"
      :href="l.href"
    >{{ l.label }}</a></span></div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '#shared/cms'

defineProps<{ w: Extract<Widget, { kind: 'tabpath' }> }>()
</script>
