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
      <div class="div_title">{{ v.title }}<div v-if="v.subtitle !== null" class="div_subtitle">{{ v.subtitle }}</div><div class="box"><div v-html="v.info" /></div></div>
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
                <a :target="r.target" :href="r.href" v-html="r.title" />
                <div style="clear:both;height:1px;width:auto;overflow:hidden">&nbsp;</div>
              </div>
            </div>
            <hr v-if="r.rule">
          </template>
        </div>
        <Pager v-bind="paging" @turn="turn" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { St, StList, Tool } from '#shared/cms'

const props = defineProps<{ st: St }>()
const v = computed(() => props.st.view)

const list = props.st.view.kind === 'list' ? props.st.view : null
const rows = ref(list?.rows ?? [])
const paging = ref(list?.paging ?? { page: 1, pages: 0, total: 0 })

async function turn(page: number) {
  const got = await loading($fetch<Pick<StList, 'rows' | 'paging'>>('/api/list', { query: { ...list!.query, PageNum: page } }))
  rows.value = got.rows
  paging.value = got.paging
}

const dialog = ref<NonNullable<Tool['dialog']> | null>(null)
const use = (t: Tool) => (t.dialog ? (dialog.value = t.dialog) : print())
</script>
