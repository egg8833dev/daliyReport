import { describe, it, expect } from 'vitest'
import { SECTIONS, splitSections } from './sections.js'

const SAMPLE = [
  '## 📰 一、國際與台灣重要新聞',
  '- 台海新聞一則',
  '',
  '---',
  '',
  '## 🧮 七、演算法',
  '主題:二分搜尋',
  '- 時間複雜度 O(log n)',
].join('\n')

describe('SECTIONS', () => {
  it('has 17 sections in fixed order starting with news', () => {
    expect(SECTIONS).toHaveLength(17)
    expect(SECTIONS[0].id).toBe('sec-news')
    expect(SECTIONS[6].id).toBe('sec-algo')
    expect(SECTIONS[16].id).toBe('sec-post')
  })
})

describe('splitSections', () => {
  it('returns only matched sections with heading stripped', () => {
    const out = splitSections(SAMPLE)
    expect(out.map(s => s.id)).toEqual(['sec-news', 'sec-algo'])
    const algo = out.find(s => s.id === 'sec-algo')
    expect(algo.ttl).toBe('演算法')
    expect(algo.body).toContain('二分搜尋')
    expect(algo.body.startsWith('##')).toBe(false)
  })

  it('omits sections not present (old-format report)', () => {
    const out = splitSections('## 📰 一、新聞\n只有一區')
    expect(out.map(s => s.id)).toEqual(['sec-news'])
  })
})
