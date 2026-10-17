<!-- 手机版列表的日期：大号的「日」加「/年.月」，同 sicnu.edu.cn 手机版；桌面上不显示 -->
<template>
  <span class="m-date"><b>{{ ymd.slice(8, 10) }}</b>/{{ ymd.slice(0, 4) }}.{{ ymd.slice(5, 7) }}</span>
</template>

<script setup lang="ts">
defineProps<{ ymd: string }>()
</script>
