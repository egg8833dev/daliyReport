import { useState, useEffect } from 'react'
import { SECTIONS } from '../sections.js'

const TABS = SECTIONS.map(s => ({ href: '#' + s.id, label: s.label }))

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
