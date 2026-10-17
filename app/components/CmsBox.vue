<template>
  <div :class="['position-' + (fixed ? 'absolute' : 'relative'), cls, boxClass]" v-bind="boxStyle ? { style: boxStyle } : {}">
    <div class="cms-box-body">
      <div v-if="bar" class="sk_bar">
        <div class="sk_box" :class="bar.boxClass">
          <h2 class="sk_title"><span class="sk_name"><span>{{ bar.title.slice(0, half(bar.title)) }}</span><span class="sk_tail">{{ bar.title.slice(half(bar.title)) }}</span></span></h2>
          <div v-if="bar.more" class="sk_more"><a :target="bar.more.target" :href="bar.more.href">{{ bar.more.label }}</a>&nbsp;</div>
        </div>
      </div>
      <div class="cms-cell" :class="cellClass">
        <div v-if="bar" class="cms-wrap">
          <div class="div_module"><slot /></div>
        </div>
        <div v-else class="div_module"><slot /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bar } from '#shared/cms'

defineProps<{ boxStyle?: string; cls?: string; fixed?: boolean; bar?: Bar | null; boxClass?: string; cellClass?: string }>()

/* 手机版标题前一半深色、后一半绿色（「学校」「新闻」），同 sicnu.edu.cn；桌面上两段同色 */
const half = (t: string) => Math.floor(t.length / 2)
</script>

<style>
.sk_box {
  display: flex;
  align-items: center;
}

.sk_title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
}

.sk_more {
  flex: none;
}
</style>
