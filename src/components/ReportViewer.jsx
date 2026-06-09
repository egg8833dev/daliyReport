import { useState, useMemo } from 'react'

const SECTIONS = [
  {
    id: 'sec-news',
    ico: '📰',
    ttl: '一、國際與台灣重要新聞',
    re: /##\s*📰[\s\S]*?(?=##\s*💹|$)/,
  },
  {
    id: 'sec-finance',
    ico: '💹',
    ttl: '二、財經與股市資訊',
    re: /##\s*💹[\s\S]*?(?=##\s*🔬|$)/,
  },
  {
    id: 'sec-tech',
    ico: '🔬',
    ttl: '三、科技與技術新知',
    re: /##\s*🔬[\s\S]*?(?=##\s*🖥|$)/,
  },
  {
    id: 'sec-frontend',
    ico: '🖥️',
    ttl: '四、前端 / UI UX / 網頁設計',
    re: /##\s*🖥[\s\S]*?(?=##\s*⚙|$)/,
  },
  {
    id: 'sec-backend',
    ico: '⚙️',
    ttl: '五、後端 / 資安 / 維運',
    re: /##\s*⚙[\s\S]*?(?=##\s*🔍|$)/,
  },
  {
    id: 'sec-seo',
    ico: '🔍',
    ttl: '六、SEO 知識與內容優化',
    re: /##\s*🔍[\s\S]*?(?=##\s*📝|$)/,
  },
  {
    id: 'sec-post',
    ico: '📝',
    ttl: '七、今日發文素材推薦',
    re: /##\s*📝[\s\S]*?$/,
  },
]

/* ── Inline formatting ─────────────────────────── */
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

/* ── Single collapsible section ─────────────────── */
function Section({ id, ico, ttl, raw }) {
  const [open, setOpen] = useState(true)

  const hlMatch = raw.match(/📌[^：:\n]*[：:]\s*(.+)/)
  const hl = hlMatch ? hlMatch[1].trim() : ''
  const bodyMd = raw.replace(/^📌[^\n]+$/mg, '').trim()
  const bodyHtml = useMemo(() => toHtml(bodyMd), [bodyMd])

  return (
    <div className="sec" id={id}>
      <div className="sec-hdr" onClick={() => setOpen(o => !o)}>
        <span className="ico">{ico}</span>
        <span className="ttl">{ttl}</span>
        <span className="tog">{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div className="sec-body">
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {hl && (
            <div className="hl">
              <div className="hl-lbl">📌 今日重點</div>
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
