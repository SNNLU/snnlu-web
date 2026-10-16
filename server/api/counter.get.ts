/* 访客数取原站当下的读数（GetHtml 只读不加） */
export default defineEventHandler(async () => {
  const text = await postForm('/_admin/_ms/_def_imgs/mc_counter/mc_counter_ajax.ashx', { action: 'GetHtml', said: '' })
  return { value: text.trim() }
})
