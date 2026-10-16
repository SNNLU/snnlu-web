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
import type { Paging, Row, Widget } from '#shared/cms'

const props = defineProps<{ w: Extract<Widget, { kind: 'list' }> }>()
const rows = ref(props.w.rows)
const paging = ref(props.w.paging)

async function turn(page: number) {
  const got = await loading($fetch<{ rows: Row[]; paging: Paging | null }>('/api/list', { query: { ...props.w.query, PageNum: page } }))
  rows.value = got.rows
  paging.value = got.paging
}
</script>
