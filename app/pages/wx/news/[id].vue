<!-- 手机版正文：给「手机版本」小窗和扫码打开用 -->
<template>
  <div v-if="a" class="wx">
    <h1>{{ a.title }}</h1>
    <p class="meta">{{ a.date }}　{{ a.source }}</p>
    <p v-if="a.byline" class="meta">{{ a.byline }}</p>
    <!-- eslint-disable-next-line vue/no-v-html -- 正文经 markdown() 逐块转义 -->
    <div class="body" v-html="a.body" />
    <p class="foot">{{ a.site }}</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: a } = await useFetch(`/api/news/${route.params.id}`)

useHead({
  title: () => a.value?.title,
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
})
</script>

<style scoped>
.wx {
  max-width: 720px;
  margin: 0 auto;
  padding: 12px 14px 24px;
  font-size: 16px;
  color: #333;
}

h1 {
  margin: 4px 0 10px;
  font-size: 21px;
  font-weight: bold;
  line-height: 1.4;
}

.meta {
  margin: 0 0 6px;
  font-size: 13px;
  color: #888;
}

.body :deep(p) {
  margin: 0 0 12px;
}

.body :deep(span) {
  font-size: 16px !important;
}

.body :deep(img) {
  width: 100%;
  height: auto;
}

.foot {
  margin: 20px 0 0;
  padding-top: 10px;
  border-top: 1px solid #eee;
  text-align: center;
  font-size: 13px;
  color: #999;
}
</style>
