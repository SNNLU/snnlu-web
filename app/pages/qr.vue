<!-- 二维码页：「扫码分享」小窗里的内容 -->
<template>
  <div class="qr">
    <table align="center"><tbody><tr><td align="center" style="padding-top:10px"><div v-html="svg" /></td></tr></tbody></table>
    <div class="title">{{ text }}<div v-if="/^https?:\/\//.test(text)" class="open"><a target="_blank" :href="text">[打开]</a></div></div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

const route = useRoute()
const text = String(route.query.text ?? '')
const svg = await QRCode.toString(text || ' ', { type: 'svg', width: 150, margin: 0 })

useHead({ title: '生成二维码' })
</script>

<style scoped>
.qr {
  font-size: 16px;
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
