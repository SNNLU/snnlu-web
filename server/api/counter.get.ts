/* 每打开一页加一 */
export default defineEventHandler(async () => ({ value: String(await bump('visits', (await site()).visits)) }))
