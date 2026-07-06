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
