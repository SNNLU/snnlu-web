<!-- 十页一段；首页、上一段、上一页 … 下一页、下一段、尾页 -->
<template>
  <nav>
    <ul class="pagination pagination-sm mt-1 mb-1 justify-content-end">
      <li v-if="page > 1" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="首页" @click="go(1)"><svg class="text-dark" width="13" height="13" fill="currentColor"><use :href="`${ICONS}#chevron-bar-left`" /></svg>&nbsp;</a></li>
      <li v-if="from > 1" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="上一段" @click="go(from - 10)">&laquo;</a></li>
      <li v-if="page > 1" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="" @click="go(page - 1)">上一页</a></li>
      <li v-for="n in numbers" :key="n" class="page-item" :class="{ disabled: n === page }">
        <a v-if="n === page" class="page-link text-danger" href="javascript:void(0);">{{ n }}</a>
        <a v-else class="page-link text-secondary" href="javascript:void(0);" title="" @click="go(n)">{{ n }}</a>
      </li>
      <li v-if="page < pages" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="" @click="go(page + 1)">下一页</a></li>
      <li v-if="from + 10 <= pages" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="下一段" @click="go(from + 10)">&raquo;</a></li>
      <li v-if="page < pages" class="page-item"><a class="page-link text-secondary" href="javascript:void(0);" title="尾页" @click="go(pages)">&nbsp;<svg class="text-dark" width="13" height="13" fill="currentColor"><use :href="`${ICONS}#chevron-bar-right`" /></svg></a></li>
      <li class="page-item disabled"><a class="page-link bg-light" href="javascript:void(0);">{{ page }}/{{ pages }}页&nbsp;共{{ total }}条</a></li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const ICONS = '/_tools/bi1131/bootstrap-icons.svg'

const props = defineProps<{ page: number; pages: number; total: number }>()
const emit = defineEmits<{ turn: [page: number] }>()

const from = computed(() => Math.floor((props.page - 1) / 10) * 10 + 1)
const numbers = computed(() => {
  const to = Math.min(props.pages, from.value + 9)
  return Array.from({ length: Math.max(0, to - from.value + 1) }, (_, i) => from.value + i)
})
const go = (n: number) => emit('turn', n)
</script>
