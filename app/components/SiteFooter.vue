<template>
  <div id="footer">
    <CmsBox fixed box-style="width:1198px;height:76px;left:0;top:10px;z-index:1">
      <div><div v-html="html" /></div>
    </CmsBox>
    <CmsBox fixed cls="counter" box-style="width:234px;height:21px;left:532px;top:110px;z-index:3">
      <div>您是第<span class="l10 r10" style="color:#fff">{{ visits }}</span>位访客</div>
    </CmsBox>
  </div>
</template>

<script setup lang="ts">
defineProps<{ html: string }>()

const { data } = await useFetch('/api/counter')
const visits = computed(() => data.value?.value ?? '...')
</script>

<style>
#footer a {
  text-decoration: none;
}

#footer .counter .div_module {
  font-family: arial;
  font-size: 14px;
  color: #fff;
}
</style>
