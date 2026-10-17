<!-- 原站每个模块都套这一层表格；保留它，行高与对齐才一致 -->
<template>
  <div :class="['position-' + (fixed ? 'absolute' : 'relative'), cls]" :style="boxStyle">
    <div style="position:relative;margin-top:0">
      <table border="0" cellspacing="0" cellpadding="0" style="width:100%;height:auto;table-layout:fixed">
        <tbody>
          <tr v-if="bar">
            <td class="sk_bar" :style="bar.cell">
              <div class="sk_box" :style="bar.box">
                <table border="0" cellspacing="0" cellpadding="0" style="width:100%;height:100%;table-layout:fixed">
                  <tbody>
                    <tr>
                      <td class="sk_title"><span class="sk_name"><span>{{ bar.title.slice(0, half(bar.title)) }}</span><span class="sk_tail">{{ bar.title.slice(half(bar.title)) }}</span></span></td>
                      <td v-if="bar.more" class="sk_more"><a :target="bar.more.target" :href="bar.more.href">{{ bar.more.label }}</a>&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td :style="cell">
              <div v-if="bar" :style="wrap">
                <div class="div_module"><slot /></div>
              </div>
              <div v-else class="div_module"><slot /></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bar } from '#shared/cms'

defineProps<{ boxStyle: string; cls?: string; fixed?: boolean; bar?: Bar | null; cell?: string; wrap?: string }>()

/* 手机版标题前一半深色、后一半绿色（「学校」「新闻」），同 sicnu.edu.cn；桌面上两段同色 */
const half = (t: string) => Math.floor(t.length / 2)
</script>
