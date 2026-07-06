# Global Search Knowledge-Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side full-text search view that finds a keyword across all daily reports and shows which day + which section matched, with a highlighted snippet and click-to-jump.

**Architecture:** Pure static React SPA, no backend. A shared `sections.js` becomes the single source of truth for the 17 report sections (currently duplicated in `ReportViewer` and `SectionNav`). Search lazy-loads every daily JSON once into an in-memory cache, then runs pure-function matching in the browser. App gains a `view` toggle (`'report'` | `'search'`) and a `pendingScroll` handoff so a result click reopens the report scrolled to the matched section.

**Tech Stack:** React 18, Vite 5, Vitest (added for pure-function tests).

## Global Constraints

- No backend; all search runs client-side over static JSON in `public/reports/`.
- No new runtime dependencies (React only). Vitest is dev-only.
- No router — navigation is App state, matching existing patterns.
- Do NOT modify `update_report.py` or the report generation pipeline.
- 17 sections; section regexes use the base emoji without variation selectors, exactly as the existing `ReportViewer` regexes (e.g. `/##\s*🖥[\s\S]*?(?=\n##\s|$)/`).
- Section ids and colors are fixed values (see Task 1 table) — reuse verbatim; do not invent new ones.
- Work on branch `feature/global-search` (already checked out).

---

### Task 1: Shared `sections.js` + `splitSections` (with Vitest setup)

**Files:**
- Create: `src/sections.js`
- Create: `src/sections.test.js`
- Modify: `package.json` (add `vitest` devDep + test scripts)
- Modify: `vite.config.js` (add test config)

**Interfaces:**
- Produces:
  - `export const SECTIONS` — array of 17 `{ id: string, ico: string, ttl: string, label: string, color: string, re: RegExp }`, in display order.
  - `export function splitSections(content: string): Array<{ id: string, ico: string, ttl: string, body: string }>` — for each SECTION whose `re` matches `content`, returns the section with its `## …` heading line removed and body trimmed. Non-matching sections are omitted.

The 17 sections (order + exact values):

| id | ico | ttl | label | color | regex emoji |
|----|-----|-----|-------|-------|-------------|
| sec-news | 📰 | 國際與台灣重要新聞 | 📰 新聞 | #3b82f6 | 📰 |
| sec-finance | 💹 | 財經與股市資訊 | 💹 財經 | #10b981 | 💹 |
| sec-tech | 🔬 | 科技與技術新知 | 🔬 科技 | #8b5cf6 | 🔬 |
| sec-frontend | 🖥️ | 前端 / UI UX / 網頁設計 | 🖥️ 前端 | #f59e0b | 🖥 |
| sec-backend | ⚙️ | 後端 / 資安 / 維運 | ⚙️ 後端 | #ef4444 | ⚙ |
| sec-fintech | 💱 | 金融科技與交易系統 | 💱 金科 | #22c55e | 💱 |
| sec-algo | 🧮 | 演算法 | 🧮 演算法 | #6366f1 | 🧮 |
| sec-sysdesign | 🏗️ | 系統設計 | 🏗️ 系統設計 | #d97706 | 🏗 |
| sec-ai | 🤖 | AI 工程與工作流實戰 | 🤖 AI | #7c3aed | 🤖 |
| sec-seo | 🔍 | SEO 知識與內容優化 | 🔍 SEO | #ec4899 | 🔍 |
| sec-writing | ✍️ | 技術寫作與個人品牌 | ✍️ 寫作 | #0d9488 | ✍ |
| sec-tools | 🧰 | 開發者效率工具 | 🧰 工具 | #65a30d | 🧰 |
| sec-deepread | 📖 | 深讀計畫 | 📖 深讀 | #9333ea | 📖 |
| sec-history | 📅 | 歷史脈絡｜鑑往知今 | 📅 脈絡 | #a16207 | 📅 |
| sec-career | 💼 | 職涯規劃與職場發展 | 💼 職涯 | #0ea5e9 | 💼 |
| sec-inspire | 🌟 | 心靈勵志與成功學 | 🌟 勵志 | #f97316 | 🌟 |
| sec-post | 📝 | 今日發文素材推薦 | 📝 發文 | #14b8a6 | 📝 |

- [ ] **Step 1: Add Vitest dev dependency and scripts**

Run:
```bash
npm install -D vitest@^2
```

Then edit `package.json` `scripts` to add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 2: Configure Vitest in `vite.config.js`**

Replace file contents with:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Write the failing test**

Create `src/sections.test.js`:
```js
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/sections.test.js`
Expected: FAIL — cannot resolve `./sections.js`.

- [ ] **Step 5: Write `src/sections.js`**

```js
export const SECTIONS = [
  { id: 'sec-news',      ico: '📰',  ttl: '國際與台灣重要新聞', label: '📰 新聞',    color: '#3b82f6', re: /##\s*📰[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-finance',   ico: '💹',  ttl: '財經與股市資訊',    label: '💹 財經',    color: '#10b981', re: /##\s*💹[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-tech',      ico: '🔬',  ttl: '科技與技術新知',    label: '🔬 科技',    color: '#8b5cf6', re: /##\s*🔬[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-frontend',  ico: '🖥️', ttl: '前端 / UI UX / 網頁設計', label: '🖥️ 前端', color: '#f59e0b', re: /##\s*🖥[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-backend',   ico: '⚙️', ttl: '後端 / 資安 / 維運',  label: '⚙️ 後端',   color: '#ef4444', re: /##\s*⚙[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-fintech',   ico: '💱',  ttl: '金融科技與交易系統',  label: '💱 金科',    color: '#22c55e', re: /##\s*💱[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-algo',      ico: '🧮',  ttl: '演算法',            label: '🧮 演算法',  color: '#6366f1', re: /##\s*🧮[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-sysdesign', ico: '🏗️', ttl: '系統設計',          label: '🏗️ 系統設計', color: '#d97706', re: /##\s*🏗[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-ai',        ico: '🤖',  ttl: 'AI 工程與工作流實戰', label: '🤖 AI',      color: '#7c3aed', re: /##\s*🤖[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-seo',       ico: '🔍',  ttl: 'SEO 知識與內容優化',  label: '🔍 SEO',     color: '#ec4899', re: /##\s*🔍[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-writing',   ico: '✍️', ttl: '技術寫作與個人品牌',  label: '✍️ 寫作',   color: '#0d9488', re: /##\s*✍[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-tools',     ico: '🧰',  ttl: '開發者效率工具',    label: '🧰 工具',    color: '#65a30d', re: /##\s*🧰[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-deepread',  ico: '📖',  ttl: '深讀計畫',          label: '📖 深讀',    color: '#9333ea', re: /##\s*📖[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-history',   ico: '📅',  ttl: '歷史脈絡｜鑑往知今',  label: '📅 脈絡',    color: '#a16207', re: /##\s*📅[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-career',    ico: '💼',  ttl: '職涯規劃與職場發展',  label: '💼 職涯',    color: '#0ea5e9', re: /##\s*💼[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-inspire',   ico: '🌟',  ttl: '心靈勵志與成功學',    label: '🌟 勵志',    color: '#f97316', re: /##\s*🌟[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-post',      ico: '📝',  ttl: '今日發文素材推薦',    label: '📝 發文',    color: '#14b8a6', re: /##\s*📝[\s\S]*?(?=\n##\s|$)/ },
]

// Split a report's markdown content into its matched sections.
// Returns only sections present in the content, in SECTIONS order,
// with the leading `## …` heading line removed.
export function splitSections(content) {
  const out = []
  for (const s of SECTIONS) {
    const m = content.match(s.re)
    if (!m) continue
    const body = m[0].replace(/^##[^\n]*\n?/, '').trim()
    out.push({ id: s.id, ico: s.ico, ttl: s.ttl, body })
  }
  return out
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/sections.test.js`
Expected: PASS (all 4 assertions).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js src/sections.js src/sections.test.js
git commit -m "feat: shared sections.js single source of truth + vitest"
```

---

### Task 2: Migrate `ReportViewer` and `SectionNav` to shared SECTIONS

**Files:**
- Modify: `src/components/ReportViewer.jsx` (remove local `SECTIONS`, import shared)
- Modify: `src/components/SectionNav.jsx` (remove local `TABS`, derive from shared)

**Interfaces:**
- Consumes: `SECTIONS` from `src/sections.js` (Task 1).

Goal: identical rendered output, zero behavior change. This removes the duplication that previously forced editing section order in two files.

- [ ] **Step 1: Update `ReportViewer.jsx`**

Delete the entire local `const SECTIONS = [ … ]` block (lines beginning `const SECTIONS = [` through its closing `]`). Add at top of imports:
```js
import { SECTIONS } from '../sections.js'
```
Leave everything else (`fmt`, `esc`, `toHtml`, `Section`, `ReportViewer`) unchanged — they already consume `SECTIONS`.

- [ ] **Step 2: Update `SectionNav.jsx`**

Replace the local `const TABS = [ … ]` block with a derivation from shared SECTIONS:
```js
import { useState, useEffect } from 'react'
import { SECTIONS } from '../sections.js'

const TABS = SECTIONS.map(s => ({ href: '#' + s.id, label: s.label }))
```
Leave the component body (`SectionNav`, observer, `handleClick`, render) unchanged.

- [ ] **Step 3: Build to verify no breakage**

Run: `npm run build`
Expected: build succeeds, no unresolved import errors.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`, open the app, confirm the report renders all sections and the top tab bar shows all 17 tabs in order. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReportViewer.jsx src/components/SectionNav.jsx
git commit -m "refactor: ReportViewer + SectionNav consume shared SECTIONS"
```

---

### Task 3: Search matcher `search.js`

**Files:**
- Create: `src/search.js`
- Create: `src/search.test.js`

**Interfaces:**
- Consumes: `splitSections` from `src/sections.js`.
- Produces:
  - `export function stripMarkdown(text: string): string` — collapses markdown syntax (`#`, `*`, backticks, `[text](url)` → `text`) and whitespace runs to a single line of readable text.
  - `export function search(query: string, reports: Array<{ date: string, generatedAt: string, content: string }>): Array<Result>` where
    `Result = { date, generatedAt, sectionId, ico, ttl, snippet, matchCount, terms }`.
    - `terms`: lowercased, whitespace-split query terms.
    - Match rule: case-insensitive; a section matches only if **every** term appears in its body (AND). Empty/whitespace query → `[]`.
    - `snippet`: markdown-stripped window of ~120 chars centered on the first term hit.
    - `matchCount`: total occurrences of all terms in the section body (case-insensitive).
    - Sorted by `date` descending.

- [ ] **Step 1: Write the failing test**

Create `src/search.test.js`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/search.test.js`
Expected: FAIL — cannot resolve `./search.js`.

- [ ] **Step 3: Write `src/search.js`**

```js
import { splitSections } from './sections.js'

const SNIPPET_RADIUS = 60

export function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')       // fenced code
    .replace(/`([^`]+)`/g, '$1')            // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#>*_~]/g, ' ')               // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

function countOccurrences(haystackLower, termLower) {
  if (!termLower) return 0
  let n = 0, i = 0
  while ((i = haystackLower.indexOf(termLower, i)) !== -1) { n++; i += termLower.length }
  return n
}

function makeSnippet(body, firstHitIndex) {
  const start = Math.max(0, firstHitIndex - SNIPPET_RADIUS)
  const end = Math.min(body.length, firstHitIndex + SNIPPET_RADIUS)
  let slice = body.slice(start, end)
  slice = stripMarkdown(slice)
  return (start > 0 ? '…' : '') + slice + (end < body.length ? '…' : '')
}

export function search(query, reports) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const results = []
  for (const rep of reports) {
    for (const sec of splitSections(rep.content)) {
      const bodyLower = sec.body.toLowerCase()
      const hasAll = terms.every(t => bodyLower.includes(t))
      if (!hasAll) continue

      const firstHit = Math.min(...terms.map(t => bodyLower.indexOf(t)).filter(i => i >= 0))
      const matchCount = terms.reduce((n, t) => n + countOccurrences(bodyLower, t), 0)

      results.push({
        date: rep.date,
        generatedAt: rep.generatedAt,
        sectionId: sec.id,
        ico: sec.ico,
        ttl: sec.ttl,
        snippet: makeSnippet(sec.body, firstHit),
        matchCount,
        terms,
      })
    }
  }
  results.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return results
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/search.test.js`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/search.js src/search.test.js
git commit -m "feat: client-side search matcher with AND terms + snippets"
```

---

### Task 4: Report cache loader `reportCache.js`

**Files:**
- Create: `src/reportCache.js`
- Create: `src/reportCache.test.js`

**Interfaces:**
- Produces:
  - `export async function loadAllReports(manifest: Array<{date, generatedAt}>, onProgress?: (done: number, total: number) => void): Promise<Array<{date, generatedAt, content}>>` — fetches each `/reports/<date>.json` once, caches content in a module-level Map, skips failed fetches, reports progress. Returns successfully-loaded reports.
  - `export function _clearCache(): void` — test helper to reset the module cache.

- [ ] **Step 1: Write the failing test**

Create `src/reportCache.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadAllReports, _clearCache } from './reportCache.js'

beforeEach(() => { _clearCache() })

function mockFetchOk(map) {
  return vi.fn(async (url) => {
    const date = url.match(/(\d{4}-\d{2}-\d{2})\.json$/)[1]
    if (map[date] == null) throw new Error('404')
    return { json: async () => ({ date, content: map[date] }) }
  })
}

describe('loadAllReports', () => {
  it('loads all reports and reports progress', async () => {
    global.fetch = mockFetchOk({ '2026-07-05': 'A', '2026-07-06': 'B' })
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }, { date: '2026-07-05', generatedAt: 'x' }]
    const progress = []
    const out = await loadAllReports(manifest, (d, t) => progress.push([d, t]))
    expect(out.map(r => r.content).sort()).toEqual(['A', 'B'])
    expect(progress.at(-1)).toEqual([2, 2])
  })

  it('skips failed fetches without throwing', async () => {
    global.fetch = mockFetchOk({ '2026-07-06': 'B' }) // 07-05 will 404
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }, { date: '2026-07-05', generatedAt: 'x' }]
    const out = await loadAllReports(manifest)
    expect(out.map(r => r.content)).toEqual(['B'])
  })

  it('caches content so a second call does not re-fetch', async () => {
    const fetchMock = mockFetchOk({ '2026-07-06': 'B' })
    global.fetch = fetchMock
    const manifest = [{ date: '2026-07-06', generatedAt: 'y' }]
    await loadAllReports(manifest)
    await loadAllReports(manifest)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/reportCache.test.js`
Expected: FAIL — cannot resolve `./reportCache.js`.

- [ ] **Step 3: Write `src/reportCache.js`**

```js
const cache = new Map() // date -> content

export function _clearCache() { cache.clear() }

export async function loadAllReports(manifest, onProgress) {
  const results = []
  let done = 0
  const total = manifest.length

  await Promise.all(manifest.map(async (m) => {
    let content = cache.get(m.date)
    if (content == null) {
      try {
        const res = await fetch(`/reports/${m.date}.json`)
        const data = await res.json()
        content = data.content
        cache.set(m.date, content)
      } catch {
        done += 1
        onProgress?.(done, total)
        return
      }
    }
    results.push({ date: m.date, generatedAt: m.generatedAt, content })
    done += 1
    onProgress?.(done, total)
  }))

  return results
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/reportCache.test.js`
Expected: PASS (3 cases).

- [ ] **Step 5: Commit**

```bash
git add src/reportCache.js src/reportCache.test.js
git commit -m "feat: lazy report loader with in-memory cache"
```

---

### Task 5: `SearchView` component

**Files:**
- Create: `src/components/SearchView.jsx`

**Interfaces:**
- Consumes: `loadAllReports` (Task 4), `search` (Task 3).
- Props: `{ manifest: Array<{date, generatedAt}>, onOpenResult: (date: string, sectionId: string) => void }`.
- Renders: search input (autofocus), first-load progress, result cards. Each card calls `onOpenResult(result.date, result.sectionId)` on click.

Weekday label reuse: compute inline (same `['日','一','二','三','四','五','六']` pattern as Sidebar).

- [ ] **Step 1: Write `src/components/SearchView.jsx`**

```js
import { useState, useEffect, useMemo, useRef } from 'react'
import { loadAllReports } from '../reportCache.js'
import { search } from '../search.js'

const WD = ['日', '一', '二', '三', '四', '五', '六']

// Split snippet into highlighted / plain segments for the given terms.
function highlight(snippet, terms) {
  if (!terms.length) return [{ text: snippet, hit: false }]
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = snippet.split(re)
  return parts.filter(p => p !== '').map(p => ({
    text: p,
    hit: terms.includes(p.toLowerCase()),
  }))
}

export default function SearchView({ manifest, onOpenResult }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [reports, setReports] = useState(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Lazy-load all reports on first mount.
  useEffect(() => {
    let alive = true
    setProgress({ done: 0, total: manifest.length })
    loadAllReports(manifest, (done, total) => {
      if (alive) setProgress({ done, total })
    }).then(rs => { if (alive) setReports(rs) })
    return () => { alive = false }
  }, [manifest])

  // Debounce the query.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(t)
  }, [query])

  const results = useMemo(() => {
    if (!reports) return []
    return search(debounced, reports)
  }, [debounced, reports])

  const loading = reports === null
  const hasQuery = debounced.trim().length > 0

  return (
    <div className="search-view">
      <div className="search-bar">
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="輸入關鍵字搜尋所有報告…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {hasQuery && !loading && (
          <div className="search-count">{results.length} 筆結果</div>
        )}
      </div>

      {loading && (
        <div className="search-loading">
          載入報告中… {progress.done}/{progress.total}
        </div>
      )}

      {!loading && !hasQuery && (
        <div className="search-hint">輸入關鍵字,搜尋所有歷史報告的每個區塊。</div>
      )}

      {!loading && hasQuery && results.length === 0 && (
        <div className="search-hint">找不到符合的內容。</div>
      )}

      {!loading && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => {
            const dow = new Date(r.date + 'T00:00:00').getDay()
            return (
              <button
                key={`${r.date}-${r.sectionId}-${i}`}
                className="search-card"
                onClick={() => onOpenResult(r.date, r.sectionId)}
              >
                <div className="search-card-meta">
                  <span className="search-card-date">{r.date.replace(/-/g, '/')} 週{WD[dow]}</span>
                  <span className="search-card-sec">{r.ico} {r.ttl}</span>
                  <span className="search-card-hits">{r.matchCount} 次</span>
                </div>
                <div className="search-card-snippet">
                  {highlight(r.snippet, r.terms).map((seg, j) =>
                    seg.hit ? <mark key={j}>{seg.text}</mark> : <span key={j}>{seg.text}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build to verify it compiles**

Run: `npm run build`
Expected: build succeeds (component not yet wired into App, but must compile).

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchView.jsx
git commit -m "feat: SearchView component with debounced search + highlighted cards"
```

---

### Task 6: Wire search into App + Sidebar + scroll-to-section

**Files:**
- Modify: `src/App.jsx` (view state, pendingScroll, render switch, result handler)
- Modify: `src/components/Sidebar.jsx` (search button; selecting a date returns to report view)
- Modify: `src/components/ReportViewer.jsx` (scrollTo prop + effect)

**Interfaces:**
- Consumes: `SearchView` (Task 5) props `{ manifest, onOpenResult }`.
- App → Sidebar new props: `view: 'report'|'search'`, `onOpenSearch: () => void`.
- App → ReportViewer new props: `scrollTo: string|null`, `onScrolled: () => void`.

- [ ] **Step 1: Add scrollTo support to `ReportViewer.jsx`**

Change the component signature and add a scroll effect. Replace:
```js
export default function ReportViewer({ content }) {
  const sections = useMemo(() => {
```
with:
```js
export default function ReportViewer({ content, scrollTo, onScrolled }) {
  useEffect(() => {
    if (!scrollTo) return
    const el = document.getElementById(scrollTo)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onScrolled?.()
  }, [scrollTo, content])

  const sections = useMemo(() => {
```
Add `useEffect` to the React import at the top:
```js
import { useState, useMemo, useEffect } from 'react'
```

- [ ] **Step 2: Add search button + view-aware select to `Sidebar.jsx`**

Add props `view` and `onOpenSearch` to the signature:
```js
export default function Sidebar({ manifest, activeDate, view, onSelect, onOpenSearch, onClose }) {
```
Immediately after the `<div className="sidebar-meta">…</div>` line, insert a search button:
```jsx
        <button
          className={`sidebar-search-btn${view === 'search' ? ' active' : ''}`}
          onClick={onOpenSearch}
        >
          🔍 搜尋知識庫
        </button>
```
In the report-list item, mark active only in report view — change the `isActive` computation:
```js
          const isActive = view === 'report' && r.date === activeDate
```

- [ ] **Step 3: Wire state + rendering in `App.jsx`**

Add state near the other `useState` calls:
```js
  const [view, setView] = useState('report')
  const [pendingScroll, setPendingScroll] = useState(null)
```
Add the result-open handler (after `currentEntry`):
```js
  const openResult = (date, sectionId) => {
    setActiveDate(date)
    setView('report')
    setPendingScroll(sectionId)
    setNavOpen(false)
  }
```
Update the `<Sidebar>` usage to pass view + search opener, and make date select return to report view:
```jsx
      <Sidebar
        manifest={manifest}
        activeDate={activeDate}
        view={view}
        onSelect={(d) => { setActiveDate(d); setView('report'); setNavOpen(false) }}
        onOpenSearch={() => { setView('search'); setNavOpen(false) }}
        onClose={() => setNavOpen(false)}
      />
```
Replace the `<SectionNav />` + `<div className="content">…</div>` block so search view swaps in. The `SectionNav` (tab bar) only makes sense for the report view:
```jsx
        {view === 'report' && <SectionNav />}
        <div className="content">
          {view === 'search' ? (
            <SearchView manifest={manifest} onOpenResult={openResult} />
          ) : (
            <>
              {loading && <Skeleton />}
              {!loading && !report && (
                <div className="state-center">
                  <div className="state-icon"><InboxIcon /></div>
                  <h2>尚無報告</h2>
                  <p>排程任務將在每日清晨自動生成。</p>
                </div>
              )}
              {!loading && report && (
                <ReportViewer
                  content={report.content}
                  scrollTo={pendingScroll}
                  onScrolled={() => setPendingScroll(null)}
                />
              )}
            </>
          )}
        </div>
```
Add the import at the top:
```js
import SearchView from './components/SearchView.jsx'
```

- [ ] **Step 4: Build to verify it compiles**

Run: `npm run build`
Expected: build succeeds, no unresolved references.

- [ ] **Step 5: Manual end-to-end check**

Run `npm run dev`. Verify:
1. Sidebar shows **🔍 搜尋知識庫**; clicking switches main area to search; the tab bar disappears.
2. Typing a keyword (e.g. a term you know is in a report) shows result cards with highlighted snippets after the load bar completes.
3. Clicking a card returns to the report view, opens that date, and scrolls to the matched section.
4. Clicking a date in the sidebar returns to report view normally.
Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/Sidebar.jsx src/components/ReportViewer.jsx
git commit -m "feat: wire global search into app shell with scroll-to-section"
```

---

### Task 7: Search view styling

**Files:**
- Modify: `src/App.css` (append search styles)

**Interfaces:** none (pure CSS). Reuse existing CSS variables (`--surface`, `--surface-hover`, `--border`, `--text`, `--accent`, etc.) so light/dark themes work automatically.

- [ ] **Step 1: Append styles to `src/App.css`**

Add at the end of the file:
```css
/* ── Global search view ─────────────────────────── */
.sidebar-search-btn {
  margin-top: 12px;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: background .15s;
}
.sidebar-search-btn:hover { background: var(--surface-hover); }
.sidebar-search-btn.active { border-color: var(--accent); color: var(--accent); }

.search-view { padding: 20px; max-width: 860px; margin: 0 auto; }
.search-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  font-size: 15px;
}
.search-input:focus { outline: none; border-color: var(--accent); }
.search-count { color: var(--text-dim, #888); font-size: 13px; white-space: nowrap; }

.search-loading, .search-hint {
  color: var(--text-dim, #888);
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}

.search-results { display: flex; flex-direction: column; gap: 10px; }
.search-card {
  display: block;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.search-card:hover { background: var(--surface-hover); border-color: var(--accent); }
.search-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12.5px;
}
.search-card-date { font-weight: 600; }
.search-card-sec { color: var(--accent); }
.search-card-hits { margin-left: auto; color: var(--text-dim, #888); }
.search-card-snippet { font-size: 13.5px; line-height: 1.6; color: var(--text); }
.search-card-snippet mark {
  background: var(--accent);
  color: #fff;
  padding: 0 2px;
  border-radius: 3px;
}
```

- [ ] **Step 2: Manual visual check (light + dark)**

Run `npm run dev`, open search, run a query, toggle theme via the header button. Confirm cards, input, and highlights are legible in both themes. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "style: global search view (theme-aware)"
```

---

## Final verification

- [ ] Run full test suite: `npm test` — expected all pass.
- [ ] Run `npm run build` — expected success.
- [ ] Confirm `feature/global-search` branch has 7 commits and the feature works end-to-end in `npm run dev`.

## Notes for the implementer

- CSS variable names (`--surface`, `--surface-hover`, `--border`, `--text`, `--accent`, `--text-dim`) are assumed from the existing `App.css`. Before Task 7, grep `src/App.css` for the actual variable names in `:root` and adjust the CSS to match; `--text-dim` has a fallback so it is safe if absent.
- Do not add `react-router` — navigation is intentionally App state.
- The old-format report `public/reports/2026-07-06.json` (pre-v3) will simply yield fewer searchable sections; this is expected and covered by `splitSections` returning only present sections.
