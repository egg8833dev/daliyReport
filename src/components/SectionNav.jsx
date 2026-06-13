import { useState, useEffect } from 'react'

const TABS = [
  { href: '#sec-news',     label: '📰 新聞' },
  { href: '#sec-finance',  label: '💹 財經' },
  { href: '#sec-tech',     label: '🔬 科技' },
  { href: '#sec-frontend', label: '🖥️ 前端' },
  { href: '#sec-backend',  label: '⚙️ 後端' },
  { href: '#sec-seo',      label: '🔍 SEO' },
  { href: '#sec-career',   label: '💼 職涯' },
  { href: '#sec-inspire',  label: '🌟 勵志' },
  { href: '#sec-history',  label: '📅 脈絡' },
  { href: '#sec-post',     label: '📝 發文' },
]

export default function SectionNav() {
  const [activeId, setActiveId] = useState('sec-news')

  useEffect(() => {
    const content = document.querySelector('.content')
    if (!content) return

    const ids = TABS.map(t => t.href.slice(1))
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { root: content, threshold: 0.15, rootMargin: '-5% 0px -55% 0px' }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleClick = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="tabs">
      {TABS.map(t => {
        const id = t.href.slice(1)
        return (
          <a
            key={t.href}
            className={`tab${activeId === id ? ' tab-active' : ''}`}
            href={t.href}
            onClick={e => handleClick(e, t.href)}
          >
            {t.label}
          </a>
        )
      })}
    </div>
  )
}
