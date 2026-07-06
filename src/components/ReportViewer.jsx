import { useState, useMemo, useEffect } from 'react'
import { SECTIONS } from '../sections.js'
import { fmt, toHtml } from '../markdown.js'

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
