/* 全站检索 /search/：给出全部标题，检索词在浏览器里过滤 */
export default defineEventHandler(async () => (await stTab('search'))!)
