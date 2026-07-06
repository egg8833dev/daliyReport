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
