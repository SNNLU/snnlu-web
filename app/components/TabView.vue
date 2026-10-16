<template>
  <template v-if="tab">
    <div id="site">
      <div id="center">
        <div id="home">
          <div style="width:100%;overflow:hidden">
            <div id="main">
              <SiteHeader :nav="tab.nav" :tab="tab.id" />
              <div id="content">
                <StView v-if="tab.st" :key="route.fullPath" :st="tab.st" />
                <div v-else style="width:5000px"><CmsGrid :nodes="tab.grid" :tab="tab.id" /></div>
              </div>
              <SiteFooter :html="tab.footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="width:100%;height:auto;margin:0;padding:0">
      <HeroCarousel v-if="tab.hero.length" :slides="tab.hero" />
    </div>
    <div v-show="busy" id="loading"><img :src="LOADING" alt="导入数据..."></div>
    <ScrollUp />
  </template>
</template>

<script setup lang="ts">
import type { Tab, Visit } from '#shared/cms'

const LOADING = '/img/loading.svg'

/* src 是本页数据接口：/api/tab/<id>、/api/st/news/<id>、/api/st/list/<id>、/api/st/search，构建时都已生成好 */
const props = defineProps<{ src: string }>()
const route = useRoute()

const { data, error } = await useFetch<Tab | Visit>(() => props.src)
if (error.value) throw createError(error.value)

const visit = computed(() => (data.value && 'redirect' in data.value ? data.value.redirect : ''))
if (visit.value) await navigateTo(visit.value, { external: !visit.value.startsWith('/'), redirectCode: 302 })

const tab = computed(() => (data.value && 'grid' in data.value ? data.value : null))
const busy = computed(() => useLoading().value > 0)

useHead({
  title: () => tab.value?.title,
  htmlAttrs: { class: 'skin' },
  bodyAttrs: { class: 'skin' },
  style: () => (tab.value ? [{ key: 'cms', innerHTML: tab.value.css }] : []),
})
</script>
