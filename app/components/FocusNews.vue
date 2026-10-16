<!-- 校区新闻：左图轮播（淡出至半透明 100ms、换图、淡入 500ms），右侧条目表 -->
<template>
  <div>
    <div :id="w.uid">
      <div class="d-flex align-items-start w-100">
        <div class="td_img0">
          <div class="div_img0">
            <div :id="w.slider">
              <div :style="{ width: `${o.w}px`, height: 'auto', border: '0px' }">
                <div :style="{ position: 'relative', overflow: 'hidden', width: `${o.w}px`, height: `${o.h - o.titleH}px` }">
                  <div ref="pane" style="display:block;width:100%;height:100%;">
                    <a
                      :style="{ display: 'block', width: `${o.w}px`, height: `${o.h}px`, backgroundImage: `url(${shown.src})`, backgroundPosition: 'center center', backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%' }"
                      :target="shown.target"
                      :href="shown.href"
                    >&nbsp;</a>
                  </div>
                  <div :style="{ width: `${o.w}px`, height: '18px', position: 'absolute', left: '0px', bottom: '0px', border: '0px', zIndex: 999 }">
                    <div
                      v-for="i in order"
                      :key="i"
                      class="btn-num"
                      :style="{ backgroundColor: i === at ? '#ff0000' : '#333333', borderColor: i === hover ? '#ff0000' : '#eeeeee' }"
                      :title="w.slides[i].alt"
                      @mouseover="hover = i"
                      @mouseout="hover = -1"
                      @click="play(i)"
                    >{{ i + 1 }}</div>
                  </div>
                </div>
                <div>
                  <div
                    class="caption"
                    :style="{ height: `${o.titleH}px`, lineHeight: `${o.titleH}px`, backgroundColor: o.titleBg, color: lit ? o.titleHover : o.titleColor }"
                    @mouseover="lit = true"
                    @mouseout="lit = false"
                    @click="open(item.href)"
                  >{{ item.alt }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-fill">
          <div class="div_items">
            <table v-for="r in w.rows" :key="r.href" border="0" cellspacing="0" cellpadding="0" class="table_item">
              <tbody>
                <tr>
                  <td align="left"><div class="div_item_link"><a :title="r.tip" :target="r.target" :href="r.href">{{ r.title }}</a></div></td>
                  <td align="right"><div class="div_item_date">{{ r.date }}</div></td>
                </tr>
              </tbody>
            </table>
            <div class="grid-clear">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '#shared/cms'

const props = defineProps<{ w: Extract<Widget, { kind: 'focus' }> }>()
const o = props.w.options

const at = ref(0)
const shownAt = ref(0)
const hover = ref(-1)
const lit = ref(false)
const pane = ref<HTMLElement>()
const item = computed(() => props.w.slides[at.value])
const shown = computed(() => props.w.slides[shownAt.value])
// 按钮倒序插入、右浮动，看上去仍是 1 2 3 4 5
const order = computed(() => props.w.slides.map((_, i) => i).reverse())

let timer: ReturnType<typeof setTimeout> | undefined
let fade: Animation | undefined

function play(i: number) {
  clearTimeout(timer)
  at.value = i
  fade?.finish()
  const el = pane.value
  if (el?.animate) {
    fade = el.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: 100, easing: SWING, fill: 'forwards' })
    fade.onfinish = () => {
      shownAt.value = i
      fade = el.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, easing: SWING, fill: 'forwards' })
    }
  } else shownAt.value = i
  timer = setTimeout(() => play((i + 1) % props.w.slides.length), o.time)
}

const open = (href: string) => window.open(href)

onMounted(() => play(0))
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.btn-num {
  float: right;
  margin: 1px;
  padding: 0;
  width: 20px;
  height: 14px;
  line-height: 14px;
  font-size: 11px;
  color: #fff;
  border-width: 1px;
  border-style: solid;
  text-align: center;
  cursor: pointer;
  opacity: 0.5;
}

.caption {
  font-family: 微软雅黑;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  text-align: center;
  border: 0;
  width: 100%;
}
</style>
