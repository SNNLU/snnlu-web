/* 静态站没有服务端可写，访客数取 site.json 里的定值 */
export default defineEventHandler(async () => ({ value: String((await site()).visits) }))
