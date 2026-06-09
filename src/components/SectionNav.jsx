const TABS = [
  { href: '#sec-news',     label: '📰 新聞' },
  { href: '#sec-finance',  label: '💹 財經' },
  { href: '#sec-tech',     label: '🔬 科技' },
  { href: '#sec-frontend', label: '🖥️ 前端' },
  { href: '#sec-backend',  label: '⚙️ 後端' },
  { href: '#sec-seo',      label: '🔍 SEO' },
  { href: '#sec-post',     label: '📝 發文' },
]

export default function SectionNav() {
  const handleClick = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="tabs">
      {TABS.map(t => (
        <a
          key={t.href}
          className="tab"
          href={t.href}
          onClick={e => handleClick(e, t.href)}
        >
          {t.label}
        </a>
      ))}
    </div>
  )
}
