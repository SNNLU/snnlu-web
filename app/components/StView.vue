<!-- 系统页：检索结果或正文，顶上一条灰框路径 -->
<template>
  <div class="st_div">
    <div class="div_top">
      <div style="width:auto;height:auto;margin:1px;padding:0;border:0">
        <div class="mt_bgcolor" style="width:auto;height:1px;margin:0 3px;padding:0;border:0;font-size:0">&nbsp;</div>
        <div class="mt_bgcolor" style="width:auto;height:2px;margin:0 1px;padding:0;border:0;font-size:0">&nbsp;</div>
        <div class="mt_bgcolor" style="width:100%;height:auto;margin:0;padding:0;border:0;overflow:hidden">
          <div class="mt_text">&nbsp;<template v-for="(l, i) in st.trail" :key="l.href">{{ i ? '    ' : '' }}<a :href="l.href">{{ l.label }}</a></template></div>
        </div>
        <div class="mt_bgcolor" style="width:auto;height:2px;margin:0 1px;padding:0;border:0;font-size:0">&nbsp;</div>
        <div class="mt_bgcolor" style="width:auto;height:1px;margin:0 3px;padding:0;border:0;font-size:0">&nbsp;</div>
        <div style="width:auto;height:4px;margin:0;padding:0;border:0">
          <div v-for="(w, i) in [7, 5, 3, 1]" :key="w" class="mt_bgcolor" :style="`width:${w}px;height:1px;margin:0;margin-left:${35 + i}px;padding:0;border:0;font-size:0`">&nbsp;</div>
        </div>
      </div>
    </div>

    <template v-if="v.kind === 'detail'">
      <!-- eslint-disable-next-line vue/no-v-html -- detailInfo() 转义了投稿字段 -->
      <div class="div_title">{{ v.title }}<div v-if="v.subtitle !== null" class="div_subtitle">{{ v.subtitle }}</div><div class="box"><div v-html="v.info" /></div></div>
      <!-- eslint-disable-next-line vue/no-v-html -- 正文经 markdown() 逐块转义 -->
      <div class="div_content" v-html="v.body" />
      <div class="div_bottom"><template v-for="(t, i) in v.tools" :key="t.label">{{ i ? '    ' : '' }}<a href="javascript:void(0);" @click="use(t)">{{ t.label }}</a></template></div>
      <HsFrame v-if="dialog" v-bind="dialog" @close="dialog = null" />
    </template>

    <div v-else>
      <div :id="`div_items_${v.uid}`">
        <div>
          <template v-for="r in rows" :key="r.href">
            <div class="div_item">
              <div class="div_itemtitle">
                <div class="other" style="float:right">{{ r.date }}</div>
                <MDate v-if="r.ymd" :ymd="r.ymd" />
                <!-- eslint-disable-next-line vue/no-v-html -- mark() 先转义再标红 -->
                <a :target="r.target" :href="r.href" v-html="r.title" />
                <div style="clear:both;height:1px;width:auto;overflow:hidden">&nbsp;</div>
              </div>
            </div>
            <hr v-if="r.rule">
          </template>
        </div>
        <Pager v-if="ready" v-bind="paging" @turn="turn" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mark, pageOf, type St, type Tool } from '#shared/cms'

const SIZE = 30 // 每页条数，五条一道线

const props = defineProps<{ st: St }>()
const v = computed(() => props.st.view)

const list = props.st.view.kind === 'list' ? props.st.view : null
/* 检索词只在地址栏里，静态页面里没有：检索页的结果等到浏览器里再出 */
const ready = ref(!list?.search)
const kw = ref('')
const page = ref(1)

const hits = computed(() => (list ? (kw.value ? list.rows.filter((r) => r.tip.includes(kw.value)) : list.rows) : []))
const shown = computed(() => pageOf(hits.value, page.value, SIZE))
const rows = computed(() => (ready.value ? shown.value.items.map((r, i) => ({ ...r, title: mark(r.tip, kw.value), date: r.date.trim(), rule: i % 5 === 4 })) : []))
const paging = computed(() => shown.value.paging)

const route = useRoute()
onMounted(() => {
  if (!list?.search) return
  watch(() => route.query.kw, (q) => {
    kw.value = typeof q === 'string' ? q : ''
    page.value = 1
  }, { immediate: true })
  ready.value = true
})

const turn = (n: number) => (page.value = n)

const dialog = ref<NonNullable<Tool['dialog']> | null>(null)
const use = (t: Tool) => (t.dialog ? (dialog.value = t.dialog) : print())
</script>
