import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type RawNode = { t: string; kids?: RawNode[]; modules?: Record<string, unknown>[] }

describe('layout classes', () => {
  it('keeps module styling class-based, not inline', () => {
    const files = readdirSync('content/layout').filter((f) => f.endsWith('.json'))
    let modules = 0
    for (const file of files) {
      const data = JSON.parse(readFileSync(`content/layout/${file}`, 'utf8')) as { grid?: RawNode[] }
      const walk = (nodes: RawNode[]) => {
        for (const n of nodes) {
          if (n.t === 'row') walk(n.kids ?? [])
          if (n.t !== 'col') continue
          for (const m of n.modules ?? []) {
            modules++
            expect(String(m.boxClass)).toMatch(/^cms-box\b/)
            expect(m).not.toHaveProperty('style')
            expect(m).not.toHaveProperty('cell')
            expect(m).not.toHaveProperty('wrap')
            if (m.cellClass) expect(m.cellClass).toBe('cms-cell--boxed')
            const bar = m.bar as Record<string, unknown> | null | undefined
            if (bar) {
              expect(bar).not.toHaveProperty('cell')
              expect(bar).not.toHaveProperty('box')
              expect(String(bar.boxClass)).toMatch(/^sk_box--h(40|50)$/)
            }
          }
        }
      }
      walk(data.grid ?? [])
    }
    expect(modules).toBeGreaterThan(0)
  })
})
