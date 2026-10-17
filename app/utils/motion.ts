/* jQuery 默认缓动 swing：0.5 - cos(pπ)/2 */
export const SWING = 'cubic-bezier(0.37, 0, 0.63, 1)'

/* 系统设了「减少动态效果」时，轮播不自动翻（手动仍可切换） */
export const reducedMotion = () => import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
