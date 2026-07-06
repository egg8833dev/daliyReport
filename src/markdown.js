/* ── Inline formatting ──────────────────────────── */
export function fmt(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
}

/* ── HTML escape (for code blocks) ─────────────── */
export function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* ── Table rendering ────────────────────────────── */
// rows: array of raw "| a | b |" strings. Row index 1 is the
// "|---|---|" separator (skipped). First row becomes the header.
function renderTable(rows) {
  const cells = (row) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
  const isSep = (row) => /-/.test(row) && /^[\s:|-]+$/.test(row.replace(/^\||\|$/g, ''))

  let head = null
  const body = []
  rows.forEach((r, i) => {
    if (i === 1 && isSep(r)) return
    const c = cells(r)
    if (i === 0) head = c
    else body.push(c)
  })

  let html = '<div class="tbl-wrap"><table>'
  if (head) {
    html += '<thead><tr>' + head.map(c => `<th>${fmt(c)}</th>`).join('') + '</tr></thead>'
  }
  html += '<tbody>' + body.map(
    r => '<tr>' + r.map(c => `<td>${fmt(c)}</td>`).join('') + '</tr>'
  ).join('') + '</tbody>'
  return html + '</table></div>'
}

/* ── Markdown → HTML ──────────────────────────── */
// Line-based renderer supporting: headings (###), ordered lists (1.),
// unordered lists (- / *), tables (| … |), blockquotes (>), fenced
// code blocks (```), and paragraphs, plus inline fmt().
export function toHtml(md) {
  let out = ''
  let listType = null      // 'ul' | 'ol' | null
  let inCode = false
  let codeLines = []
  let quoteLines = null    // string[] | null
  let tableRows = null     // string[] | null

  const closeList = () => { if (listType) { out += `</${listType}>`; listType = null } }
  const closeQuote = () => {
    if (quoteLines) {
      out += `<blockquote>${quoteLines.map(fmt).join('<br>')}</blockquote>`
      quoteLines = null
    }
  }
  const closeTable = () => {
    if (tableRows) { out += renderTable(tableRows); tableRows = null }
  }
  const closeBlocks = () => { closeList(); closeQuote(); closeTable() }

  const openList = (type, raw, strip) => {
    closeQuote(); closeTable()
    if (listType !== type) { closeList(); out += `<${type}>`; listType = type }
    out += `<li><span>${fmt(raw.replace(strip, ''))}</span></li>`
  }

  for (const raw of md.split('\n')) {
    const l = raw.trim()

    // fenced code block ``` ... ```
    if (l.startsWith('```')) {
      if (inCode) {
        out += `<pre class="code"><code>${esc(codeLines.join('\n'))}</code></pre>`
        codeLines = []
        inCode = false
      } else {
        closeBlocks()
        inCode = true
      }
      continue
    }
    if (inCode) { codeLines.push(raw); continue }

    // table rows (accumulate consecutive | … | lines)
    if (l.startsWith('|') && l.endsWith('|')) {
      closeList(); closeQuote()
      if (!tableRows) tableRows = []
      tableRows.push(l)
      continue
    }
    closeTable()

    if (!l) { closeBlocks(); continue }

    // blockquote (accumulate consecutive > lines)
    if (l.startsWith('>')) {
      closeList()
      if (!quoteLines) quoteLines = []
      quoteLines.push(l.replace(/^>\s?/, ''))
      continue
    }
    closeQuote()

    if (l.startsWith('### ')) {
      closeList()
      out += `<h3>${fmt(l.slice(4))}</h3>`
    } else if (/^\d+\.\s/.test(l)) {
      openList('ol', l, /^\d+\.\s/)
    } else if (/^[-*]\s/.test(l)) {
      openList('ul', l, /^[-*]\s/)
    } else {
      closeList()
      out += `<p>${fmt(l)}</p>`
    }
  }

  if (inCode && codeLines.length) {
    out += `<pre class="code"><code>${esc(codeLines.join('\n'))}</code></pre>`
  }
  closeBlocks()
  return out
}
