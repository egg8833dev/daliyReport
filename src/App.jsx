import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import SectionNav from './components/SectionNav.jsx'
import ReportViewer from './components/ReportViewer.jsx'

export default function App() {
  const [manifest, setManifest] = useState([])
  const [activeDate, setActiveDate] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  )

  // Load manifest
  useEffect(() => {
    fetch('/reports/manifest.json')
      .then(r => r.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
        setManifest(sorted)
        if (sorted.length > 0) setActiveDate(sorted[0].date)
        else setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Load report when date changes
  useEffect(() => {
    if (!activeDate) return
    setLoading(true)
    setReport(null)
    fetch(`/reports/${activeDate}.json`)
      .then(r => r.json())
      .then(data => { setReport(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeDate])

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const currentEntry = manifest.find(r => r.date === activeDate)

  return (
    <div className="app-layout">
      <Sidebar
        manifest={manifest}
        activeDate={activeDate}
        onSelect={setActiveDate}
      />
      <div className="main">
        <Header
          date={activeDate}
          generatedAt={currentEntry?.generatedAt}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
        <SectionNav />
        <div className="content">
          {loading && (
            <div className="state-center">
              <div className="spin" />
              <p>載入中...</p>
            </div>
          )}
          {!loading && !report && (
            <div className="state-center">
              <div className="emoji">📭</div>
              <h2>尚無報告</h2>
              <p>排程任務將在每日清晨自動生成報告。</p>
            </div>
          )}
          {!loading && report && (
            <ReportViewer content={report.content} />
          )}
        </div>
      </div>
    </div>
  )
}
