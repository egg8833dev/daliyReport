import { useState, useMemo, useEffect } from 'react'
import { SECTIONS } from '../sections.js'

/* ── Inline formatting ──────────────────────────── */
function fmt(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
}

/* ── HTML escape (for code blocks) ─────────────── */
function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/* ── Markdown → HTML ──────────────────────────── */
function toHtml(md) {
  let out = ''
  let inList = false
  let inCode = false
  let codeLines = []
  const lines = md.split('\n')

  for (const raw of lines) {
    const l = raw.trim()
    // fenced code block ``` ... ```
    if (l.startsWith('```')) {
      if (inCode) {
        out += `<pre class="code"><code>${esc(codeLines.join('\n'))}</code></pre>`
        codeLines = []
        inCode = false
      } else {
        if (inList) { out += '</ul>'; inList = false }
        inCode = true
      }
      continue
    }
    if (inCode) { codeLines.push(raw); continue }
    if (!l) {
      if (inList) { out += '</ul>'; inList = false }
      continue
    }
    if (l.startsWith('### ')) {
      if (inList) { out += '</ul>'; inList = false }
      out += `<h3>${fmt(l.slice(4))}</h3>`
    } else if (/^[-*]\s/.test(l) || /^\d+\.\s/.test(l)) {
      if (!inList) { out += '<ul>'; inList = true }
      const text = l.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '')
      out += `<li><span>${fmt(text)}</span></li>`
    } else {
      if (inList) { out += '</ul>'; inList = false }
      out += `<p>${fmt(l)}</p>`
    }
  }
  if (inCode && codeLines.length) {
    out += `<pre class="code"><code>${esc(codeLines.join('\n'))}</code></pre>`
  }
  if (inList) out += '</ul>'
  return out
}

const ChevronIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,4 6,8 10,4" />
  </svg>
)

/* ── Single section ─────────────────────────────── */
function Section({ id, ico, ttl, color, raw }) {
  const [open, setOpen] = useState(true)

  const hlMatch = raw.match(/📌[^：:\n]*[：:]\s*(.+)/)
  const hl = hlMatch ? hlMatch[1].trim() : ''
  const bodyMd = raw.replace(/^📌[^\n]+$/mg, '').trim()
  const bodyHtml = useMemo(() => toHtml(bodyMd), [bodyMd])

  const icoStyle = {
    background: `${color}16`,
    borderColor: `${color}28`,
  }

  return (
    <div className="sec" id={id}>
      <div className="sec-hdr" onClick={() => setOpen(o => !o)}>
        <div className="sec-ico-wrap" style={icoStyle}>{ico}</div>
        <span className="ttl">{ttl}</span>
        <span className={`tog${open ? ' open' : ''}`}><ChevronIcon /></span>
      </div>
      {open && (
        <div className="sec-body">
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {hl && (
            <div className="hl">
              <div className="hl-lbl">今日重點</div>
              <p dangerouslySetInnerHTML={{ __html: fmt(hl) }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main viewer ─────────────────────────────────── */
export default function ReportViewer({ content, scrollTo, onScrolled }) {
  useEffect(() => {
    if (!scrollTo) return
    const el = document.getElementById(scrollTo)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onScrolled?.()
  }, [scrollTo, content])

  const sections = useMemo(() => {
    return SECTIONS.map(s => {
      const m = content.match(s.re)
      const raw = m ? m[0].replace(/^##[^\n]+\n/, '') : '（本日無資料）'
      return { ...s, raw }
    })
  }, [content])

  return (
    <div className="wrap">
      {sections.map(s => (
        <Section key={s.id} {...s} />
      ))}
    </div>
  )
}
