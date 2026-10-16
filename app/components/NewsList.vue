<template>
  <div>
    <div :id="w.uid">
      <div :id="`div_items_${w.uid}`" class="div_list">
        <div class="container-fluid w-100">
          <div class="row">
            <div v-for="r in rows" :key="r.href + r.title" class="div_item col">
              <div>
                <div class="div_title">
                  <div v-if="r.date" class="date">{{ r.date }}</div>
                  <a :target="r.target" :href="r.href" :title="r.tip">{{ r.title }}</a>
                </div>
              </div>
            </div>
          </div>
          <div v-if="paging" class="row">
            <div class="col-12">
              <Pager v-bind="paging" @turn="turn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pageOf, type Widget } from '#shared/cms'

const props = defineProps<{ w: Extract<Widget, { kind: 'list' }> }>()
const rows = ref(props.w.rows)
const paging = ref(props.w.paging)

/* 整栏条目已随页面带来，翻页只是切片 */
function turn(page: number) {
  const got = pageOf(props.w.all!, page, props.w.size)
  rows.value = got.items
  paging.value = got.paging
}
</script>
