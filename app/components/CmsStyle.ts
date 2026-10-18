/* 版式 CSS 跟页面内容同一次渲染更新：走 useHead 会比内容晚一帧才生效，切换栏目时闪一下无格式页面。
   css 来自仓库内 content/layout 的 css 字段，非用户输入 */
export default defineComponent({
  props: { css: { type: String, required: true } },
  setup: (props) => () => h('style', { innerHTML: props.css }),
})
