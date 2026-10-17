<!-- 二维码页：「扫码分享」小窗里的内容 -->
<template>
  <div class="qr">
    <!-- eslint-disable-next-line vue/no-v-html -- qrcode 库生成的 SVG，输入只是网址文本 -->
    <div class="qr-code"><div v-html="svg" /></div>
    <div class="title">{{ text }}<div v-if="/^https?:\/\//.test(text)" class="open"><a target="_blank" :href="text">[打开]</a></div></div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

/* 静态页面里没有查询串：挂载后跟着地址栏现画二维码；/ 开头的相对路径补上当前域名 */
const route = useRoute()
const text = ref('')
const svg = ref('')

async function draw(raw: string) {
  text.value = raw.startsWith('/') ? location.origin + raw : raw
  svg.value = await QRCode.toString(text.value || ' ', { type: 'svg', width: 150, margin: 0 })
}

onMounted(() => watch(() => String(route.query.text ?? ''), draw, { immediate: true }))

useHead({ title: '生成二维码' })
</script>

<style scoped>
.qr {
  font-size: 16px;
}

.qr-code {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.title {
  margin: 5px;
  padding: 5px;
  text-align: center;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
}

.open {
  text-align: center;
  border-top: 1px dotted #eee;
  margin-top: 2px;
  padding-top: 2px;
}
</style>
