<!-- 手机版内页抬头：一条校园实景，下面是绿色栏目条（返回、栏目名、本栏目的子栏目），同 sicnu.edu.cn 手机版；桌面上不显示 -->
<template>
  <div class="m-subnav">
    <div class="m-banner" aria-hidden="true" />
    <div class="m-subbar">
      <a class="m-back" href="/" aria-label="返回" @click.prevent="back">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2.5 5 8l5.5 5.5" /></svg>
      </a>
      <div class="m-subtitle">{{ title }}</div>
      <button v-if="links.length" type="button" class="m-grid" :aria-expanded="open" aria-controls="m-sublinks" aria-label="本栏目" @click="open = !open">
        <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="5" height="5" rx="1" /><rect x="9.5" y="1.5" width="5" height="5" rx="1" /><rect x="1.5" y="9.5" width="5" height="5" rx="1" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /></svg>
      </button>
    </div>
    <ul v-if="links.length" v-show="open" id="m-sublinks" class="m-sublinks">
      <li v-for="l in links" :key="l.href + l.label">
        <a :href="l.href" :target="l.target" :class="{ on: l.href === current }" :aria-current="l.href === current ? 'page' : undefined">{{ l.label }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Link } from '#shared/cms'

defineProps<{ title: string; links: Link[]; current: string }>()
const open = ref(false)

/* 从站内点进来的就退回上一页，直接打开的回首页 */
function back() {
  if (history.length > 1 && document.referrer.startsWith(location.origin)) history.back()
  else location.href = '/'
}
</script>
