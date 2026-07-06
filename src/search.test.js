import { describe, it, expect } from 'vitest'
import { search, stripMarkdown } from './search.js'

const reports = [
  {
    date: '2026-07-05', generatedAt: 'x',
    content: '## 🧮 七、演算法\n二分搜尋 binary search 很常考\n複雜度 O(log n)',
  },
  {
    date: '2026-07-06', generatedAt: 'y',
    content: '## 📰 一、新聞\n半導體出口成長\n\n---\n\n## 🧮 七、演算法\n動態規劃 DP 題型 複雜度分析',
  },
]

describe('stripMarkdown', () => {
  it('removes markdown syntax and keeps link text', () => {
    expect(stripMarkdown('**粗體** 與 [連結](https://x.com) `code`')).toBe('粗體 與 連結 code')
  })
})

describe('search', () => {
  it('returns [] for empty query', () => {
    expect(search('   ', reports)).toEqual([])
  })

  it('finds a CJK keyword in the right day and section', () => {
    const r = search('二分搜尋', reports)
    expect(r).toHaveLength(1)
    expect(r[0].date).toBe('2026-07-05')
    expect(r[0].sectionId).toBe('sec-algo')
    expect(r[0].ttl).toBe('演算法')
    expect(r[0].snippet).toContain('二分搜尋')
  })

  it('is case-insensitive', () => {
    const r = search('BINARY', reports)
    expect(r).toHaveLength(1)
    expect(r[0].date).toBe('2026-07-05')
  })

  it('requires all space-separated terms (AND) within one section', () => {
    // 半導體 is in news(07-06), DP is in algo(07-06) — different sections, no single section has both
    expect(search('半導體 DP', reports)).toHaveLength(0)
    // both terms in the same algo section of 07-05
    expect(search('二分 binary', reports).map(x => x.date)).toEqual(['2026-07-05'])
  })

  it('sorts results by date descending', () => {
    // 複雜度 appears in both days' algo sections (heading text is stripped from body)
    const dates = search('複雜度', reports).map(x => x.date)
    expect(dates).toEqual(['2026-07-06', '2026-07-05'])
  })
})
