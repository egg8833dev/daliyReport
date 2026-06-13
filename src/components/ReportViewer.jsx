import { useState, useMemo } from 'react'

const SECTIONS = [
  {
    id: 'sec-news',
    ico: '📰',
    ttl: '國際與台灣重要新聞',
    color: '#3b82f6',
    re: /##\s*📰[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-finance',
    ico: '💹',
    ttl: '財經與股市資訊',
    color: '#10b981',
    re: /##\s*💹[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-tech',
    ico: '🔬',
    ttl: '科技與技術新知',
    color: '#8b5cf6',
    re: /##\s*🔬[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-frontend',
    ico: '🖥️',
    ttl: '前端 / UI UX / 網頁設計',
    color: '#f59e0b',
    re: /##\s*🖥[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-backend',
    ico: '⚙️',
    ttl: '後端 / 資安 / 維運',
    color: '#ef4444',
    re: /##\s*⚙[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-seo',
    ico: '🔍',
    ttl: 'SEO 知識與內容優化',
    color: '#ec4899',
    re: /##\s*🔍[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-career',
    ico: '💼',
    ttl: '職涯規劃與職場發展',
    color: '#0ea5e9',
    re: /##\s*💼[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-inspire',
    ico: '🌟',
    ttl: '心靈勵志與成功學',
    color: '#f97316',
    re: /##\s*🌟[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-history',
    ico: '📅',
    ttl: '歷史上的今天',
    color: '#a16207',
    re: /##\s*📅[\s\S]*?(?=\n##\s|$)/,
  },
  {
    id: 'sec-post',
    ico: '📝',
    ttl: '今日發文素材推薦',
    color: '#14b8a6',
    re: /##\s*📝[\s\S]*?(?=\n##\s|$)/,
  },
]

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

/* ── Markdown → HTML ──────────────────────────── */
function toHtml(md) {
  let out = ''
  let inList = false
  const lines = md.split('\n')

  for (const raw of lines) {
    const l = raw.trim()
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
export default function ReportViewer({ content }) {
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
