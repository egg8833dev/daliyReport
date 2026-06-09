import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import SectionNav from './components/SectionNav.jsx'
import ReportViewer from './components/ReportViewer.jsx'

const SKEL_ROWS = [
  ['94%', '81%', '88%', '73%', '90%'],
  ['86%', '92%', '79%', '95%', '83%'],
  ['91%', '76%', '88%', '94%', '78%'],
]

function Skeleton() {
  return (
    <div className="skel-wrap">
      {SKEL_ROWS.map((rows, i) => (
        <div key={i} className="skel-sec">
          <div className="skel-hdr">
            <div className="skel-ico" />
            <div className="skel-title" />
          </div>
          {rows.map((w, j) => (
            <div key={j} className="skel-row" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  )
}

const InboxIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M2 13h4l1.5 2.5h5L14 13h4" />
    <rect x="2" y="4" width="16" height="12" rx="2" />
  </svg>
)

export default function App() {
  const [manifest, setManifest] = useState([])
  const [activeDate, setActiveDate] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'dark'
  )

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

  useEffect(() => {
    if (!activeDate) return
    setLoading(true)
    setReport(null)
    fetch(`/reports/${activeDate}.json`)
      .then(r => r.json())
      .then(data => { setReport(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeDate])

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
          {loading && <Skeleton />}
          {!loading && !report && (
            <div className="state-center">
              <div className="state-icon"><InboxIcon /></div>
              <h2>尚無報告</h2>
              <p>排程任務將在每日清晨自動生成。</p>
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
