<template>
  <NuxtLink v-if="internal" v-bind="$attrs" :to="href" :target="target" :title="title" prefetch-on="interaction"><slot /></NuxtLink>
  <a v-else v-bind="$attrs" :href="href" :target="target" :title="title"><slot /></a>
</template>

<script setup lang="ts">
/* 站内链接走客户端路由，外链/新窗口仍交给浏览器 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{ href: string; target?: string; title?: string }>()
const internal = computed(() => props.href.startsWith('/') && !props.href.startsWith('//') && (!props.target || props.target === '_self'))
</script>
