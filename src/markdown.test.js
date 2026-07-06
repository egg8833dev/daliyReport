import { describe, it, expect } from 'vitest'
import { toHtml, fmt } from './markdown.js'

describe('fmt', () => {
  it('renders bold, code, and links', () => {
    expect(fmt('**a** `b` [c](https://x.com)')).toBe(
      '<strong>a</strong> <code>b</code> <a href="https://x.com" target="_blank" rel="noopener noreferrer">c</a>'
    )
  })
})

describe('toHtml ordered lists', () => {
  it('renders numbered items as an <ol> preserving the numbers', () => {
    const html = toHtml('1. 第一\n2. 第二\n3. 第三')
    expect(html).toBe(
      '<ol><li><span>第一</span></li><li><span>第二</span></li><li><span>第三</span></li></ol>'
    )
  })

  it('keeps ordered and unordered lists separate', () => {
    const html = toHtml('- 甲\n1. 乙')
    expect(html).toBe('<ul><li><span>甲</span></li></ul><ol><li><span>乙</span></li></ol>')
  })

  it('keeps a loose list (blank lines between items) as ONE <ol>', () => {
    // regression: report news items are separated by blank lines; each must
    // stay in the same <ol> so numbering runs 1,2,3 instead of resetting to 1
    const html = toHtml('1. 甲\n\n2. 乙\n\n3. 丙')
    expect(html).toBe(
      '<ol><li><span>甲</span></li><li><span>乙</span></li><li><span>丙</span></li></ol>'
    )
  })

  it('closes the list when a paragraph interrupts, then restarts', () => {
    const html = toHtml('1. 甲\n\n說明\n\n1. 乙')
    expect(html).toBe(
      '<ol><li><span>甲</span></li></ol><p>說明</p><ol><li><span>乙</span></li></ol>'
    )
  })
})

describe('toHtml horizontal rule', () => {
  it('renders --- as an <hr>, not literal text', () => {
    expect(toHtml('文字\n\n---')).toBe('<p>文字</p><hr class="rule">')
  })
})

describe('toHtml tables', () => {
  it('renders a pipe table with header and skips the separator row', () => {
    const md = '| 讀到 | 動作 |\n|------|------|\n| ( | push |\n| ) | pop |'
    const html = toHtml(md)
    expect(html).toContain('<div class="tbl-wrap"><table>')
    expect(html).toContain('<thead><tr><th>讀到</th><th>動作</th></tr></thead>')
    expect(html).toContain('<tbody><tr><td>(</td><td>push</td></tr><tr><td>)</td><td>pop</td></tr></tbody>')
    expect(html).not.toContain('---')
  })
})

describe('toHtml blockquotes', () => {
  it('wraps consecutive > lines in a blockquote and strips the marker', () => {
    const html = toHtml('> 第一行\n> 第二行')
    expect(html).toBe('<blockquote>第一行<br>第二行</blockquote>')
  })

  it('does not leave a literal > in output', () => {
    expect(toHtml('> 注意事項')).not.toContain('&gt;')
    expect(toHtml('> 注意事項')).toBe('<blockquote>注意事項</blockquote>')
  })
})

describe('toHtml mixed / regression', () => {
  it('handles headings, paragraphs, and code fences together', () => {
    const md = '### 標題\n說明文字\n```\ncode();\n```'
    const html = toHtml(md)
    expect(html).toBe('<h3>標題</h3><p>說明文字</p><pre class="code"><code>code();</code></pre>')
  })
})
