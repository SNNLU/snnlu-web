/* 指先や 風の向きには 絵が替わる */
export function useSwipe(onLeft: () => void, onRight: () => void, threshold = 40) {
  let x = 0
  let y = 0
  const start = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    x = t.clientX
    y = t.clientY
  }
  const end = (e: TouchEvent) => {
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - x
    const dy = t.clientY - y
    if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.2) return
    if (dx < 0) onLeft()
    else onRight()
  }
  return { start, end }
}
