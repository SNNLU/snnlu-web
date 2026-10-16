<!-- 页头：校名在 body 背景图里；这里只有 superfish 导航与搜索框 -->
<template>
  <div id="header">
    <CmsBox fixed box-style="width:1196px;height:48px;left:0;top:135px;z-index:12">
      <div>
        <ul class="sf-menu sf-js-enabled sf-arrows">
          <li v-for="n in nav" :key="n.label" :class="{ sfHover: open === n.label }" @mouseenter="enter(n.label)" @mouseleave="leave">
            <a :target="n.target" :href="n.href" :class="{ 'sf-with-ul': n.children.length }">{{ n.label }}</a>
            <Transition name="sf">
              <ul v-if="n.children.length" v-show="open === n.label">
                <li v-for="c in n.children" :key="c.label">
                  <a :target="c.target" :href="c.href" :title="c.title">{{ c.label }}</a>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
      </div>
    </CmsBox>
    <CmsBox fixed box-style="width:205px;height:30px;left:980px;top:63px;z-index:13">
      <div>
        <div>
          <form class="search text-warning" @submit.prevent="search">
            <input v-model="kw" type="text" class="input_kw form-control bg-transparent border-0" name="kw" placeholder="请输入搜索关键字...">
            <button type="button" class="btn_kw_ok p-0 overflow-hidden btn btn-info opacity-0" @click="search">&nbsp;</button>
          </form>
        </div>
      </div>
    </CmsBox>
  </div>
</template>

<script setup lang="ts">
import { searchHref, type NavItem } from '#shared/cms'

defineProps<{ nav: NavItem[]; tab: number }>()

const kw = ref('')
const open = ref('')
let timer: ReturnType<typeof setTimeout>

const enter = (label: string) => {
  clearTimeout(timer)
  open.value = label
}
const leave = () => {
  timer = setTimeout(() => (open.value = ''), 500)
}

/* 检索在 /search/ 页里做，结果不分栏目 */
const search = () => window.open(searchHref(kw.value), '_blank')
</script>

<style>
.sf-menu,
.sf-menu * {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sf-menu {
  float: left;
  margin-bottom: 1em;
}

.sf-menu li {
  position: relative;
  min-width: 130px;
  text-align: center;
  white-space: nowrap;
  background-color: transparent;
  transition: background 0.2s;
}

.sf-menu > li {
  float: left;
}

.sf-menu a {
  display: block;
  position: relative;
  padding: 0 10px;
  border-left: 1px solid transparent;
  border-top: 1px solid transparent;
  line-height: 35px;
  font-family: 宋体;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

.sf-menu a:hover {
  color: #d1ad69;
}

.sf-menu ul {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 99;
  min-width: 130px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
}

.sf-menu ul li {
  background-color: #24694c;
}

.sf-menu ul li:hover {
  background-color: #d1ad69;
  transition: none;
}

.sf-menu ul a,
.sf-menu ul a:hover {
  font-size: 18px;
  color: #fff;
}

.sf-enter-active,
.sf-leave-active {
  transition: opacity 200ms cubic-bezier(0.37, 0, 0.63, 1);
}

.sf-enter-from,
.sf-leave-to {
  opacity: 0;
}

.search {
  position: relative;
  margin: 0;
  padding: 0;
  width: 205px;
  height: 30px;
  border: 0;
  background-color: transparent;
}

.search .input_kw {
  position: absolute;
  width: 158px;
  height: 30px;
  left: 5px;
  top: 0;
  font-family: 微软雅黑;
  font-size: 14px;
  color: #ddd;
}

.search .input_kw::placeholder {
  color: #ccc;
}

.search .btn_kw_ok {
  display: block;
  position: absolute;
  text-align: center;
  cursor: pointer;
  width: 20px;
  height: 30px;
  line-height: 30px;
  left: 165px;
  top: 0;
}
</style>
