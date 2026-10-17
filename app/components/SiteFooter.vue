<template>
  <div id="footer">
    <!-- 手机版页脚顶部：快速链接一排，校名与校训（同 sicnu.edu.cn 手机版）；桌面上不显示 -->
    <div class="m-foot">
      <nav class="m-foot-links" aria-label="快速链接">
        <a v-for="q in quick" :key="q.href" :href="q.href" :target="q.target">{{ q.label }}</a>
      </nav>
      <div class="m-foot-brand">
        <img src="/img/brand.svg" alt="遂宁奶龙大学 Suining Nailong University" width="381" height="87" loading="lazy">
        <span class="m-motto" role="img" aria-label="重德博学 务实尚美" />
      </div>
    </div>
    <CmsBox fixed box-style="left:0;right:2px;height:76px;top:10px;z-index:1">
      <!-- eslint-disable-next-line vue/no-v-html -- 页脚来自 content/site.json（不走快车道，需所有者审批） -->
      <div><div v-html="html" /></div>
    </CmsBox>
    <!-- 原站访客计数的位置：静态站不计数，换成 Nuxt 标识 -->
    <CmsBox fixed cls="badge-box" box-style="width:234px;height:21px;left:calc(50% - 118px);top:110px;z-index:3">
      <div>
        <a class="nuxt-badge" href="https://nuxt.com/" target="_blank" rel="noopener" title="Nuxt">
          <svg class="nuxt-mark" viewBox="0 54 324 216" aria-hidden="true"><path fill="#00DC82" d="M181.767 270H302.211C306.037 270 309.795 269.003 313.108 267.107C316.421 265.211 319.172 262.484 321.084 259.2C322.996 255.915 324.002 252.19 324 248.399C323.998 244.607 322.989 240.883 321.074 237.601L240.187 98.7439C238.275 95.4607 235.525 92.7342 232.213 90.8385C228.901 88.9429 225.143 87.9449 221.318 87.9449C217.494 87.9449 213.736 88.9429 210.424 90.8385C207.112 92.7342 204.361 95.4607 202.449 98.7439L181.767 134.272L141.329 64.7975C139.416 61.5145 136.664 58.7884 133.351 56.8931C130.038 54.9978 126.28 54 122.454 54C118.629 54 114.871 54.9978 111.558 56.8931C108.245 58.7884 105.493 61.5145 103.58 64.7975L2.92554 237.601C1.01067 240.883 0.00166657 244.607 2.06272e-06 248.399C-0.00166244 252.19 1.00407 255.915 2.91605 259.2C4.82803 262.484 7.57884 265.211 10.8918 267.107C14.2047 269.003 17.963 270 21.7886 270H97.3936C127.349 270 149.44 256.959 164.641 231.517L201.546 168.172L221.313 134.272L280.637 236.1H201.546L181.767 270ZM96.1611 236.065L43.3984 236.054L122.49 100.291L161.953 168.172L135.531 213.543C125.436 230.051 113.968 236.065 96.1611 236.065Z" /></svg>
          <span>Built with Nuxt</span>
        </a>
      </div>
    </CmsBox>
  </div>
</template>

<script setup lang="ts">
import type { Link } from '#shared/cms'

defineProps<{ html: string; quick: Link[] }>()

/* 竖线只隔开同一行里的两段：后一段折到下一行时，这条竖线就落在行尾，藏起 */
let ro: ResizeObserver | undefined
function tidy() {
  const segs = [...document.querySelectorAll<HTMLElement>('#footer .ft-seg')]
  const seps = [...document.querySelectorAll<HTMLElement>('#footer .ft-sep')]
  seps.forEach((s) => s.classList.remove('ft-end'))
  seps.forEach((s, i) => {
    const a = segs[i]
    const b = segs[i + 1]
    if (a && b && Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top) > 4) s.classList.add('ft-end')
  })
}
onMounted(() => {
  tidy()
  ro = new ResizeObserver(tidy)
  const box = document.querySelector('#footer')
  if (box) ro.observe(box)
})
onUnmounted(() => ro?.disconnect())
</script>

<style>
#footer a {
  text-decoration: none;
}

#footer .ft-seg {
  white-space: nowrap;
}

/* 只藏不挪：占位保留，免得后一段又挤回这一行、来回折 */
#footer .ft-end {
  visibility: hidden;
}

#footer .badge-box .div_module {
  text-align: center;
}

/* 页脚小框：提交号与 Nuxt 标识同一式样（照旧站 .commit-link） */
#footer .commit-link,
#footer .nuxt-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 6px;
  border: 1px solid #d0e3d866;
  border-radius: 3px;
  color: #d0e3d8;
  font: 12px/18px Arial, "Microsoft YaHei", sans-serif;
  vertical-align: 1px;
}

#footer .commit-link:hover,
#footer .nuxt-badge:hover {
  color: #fff;
  border-color: #fff9;
}

#footer .gh-mark {
  width: 12px;
  height: 12px;
  flex: none;
}

#footer .commit-link code {
  padding: 0;
  font: 11px/18px Consolas, Menlo, monospace;
  color: inherit;
}

#footer .nuxt-mark {
  width: 15px;
  height: 10px;
  flex: none;
}

/* naiwa.win：下划线 + 右上箭头，示意跳到外站 */
#footer .naiwa-link {
  color: #fff;
}

#footer .naiwa-link span {
  text-decoration: underline;
  text-underline-offset: 3px;
}

#footer .ext-arrow {
  width: 10px;
  height: 10px;
  margin-left: 2px;
  vertical-align: 1px;
}
</style>
