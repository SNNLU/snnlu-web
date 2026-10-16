<template>
  <TabView :src="`/api/tab/${route.params.id}`" />
</template>

<script setup lang="ts">
import { legacyHref } from '#shared/cms'

definePageMeta({
  /* 旧链接 /p/<id>/?StId=… 换到静态路径；静态站只有 /p/<id>/ 这一份页面，查询串只能在浏览器里认。
     整页重新加载，新页面直接读它自己生成好的数据 */
  middleware: (to) => {
    const stid = to.query.StId
    const href = typeof stid === 'string' ? legacyHref(stid) : null
    if (href) return navigateTo(href, { replace: true, external: true })
  },
})

const route = useRoute()
</script>
