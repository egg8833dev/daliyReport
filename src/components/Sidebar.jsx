const WD = ['日', '一', '二', '三', '四', '五', '六']

function todayTW() {
  const t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
  return [
    t.getFullYear(),
    String(t.getMonth() + 1).padStart(2, '0'),
    String(t.getDate()).padStart(2, '0'),
  ].join('-')
}

const NewsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <line x1="5" y1="5.5" x2="11" y2="5.5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="10.5" x2="8" y2="10.5" />
  </svg>
)

export default function Sidebar({ manifest, activeDate, view, onSelect, onOpenSearch, onClose }) {
  const td = todayTW()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-close" onClick={onClose} aria-label="關閉選單">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <NewsIcon />
          </div>
          <span className="sidebar-title">每日資訊日報</span>
        </div>
        <div className="sidebar-meta">共 {manifest.length} 份報告</div>
        <button
          className={`sidebar-search-btn${view === 'search' ? ' active' : ''}`}
          onClick={onOpenSearch}
        >
          🔍 搜尋知識庫
        </button>
      </div>
      <div className="report-list">
        {manifest.map(r => {
          const dt = new Date(r.date + 'T00:00:00')
          const dow = dt.getDay()
          const isToday = r.date === td
          const isActive = view === 'report' && r.date === activeDate
          const isSun = dow === 0
          return (
            <div
              key={r.date}
              className={[
                'ri',
                isActive ? 'active' : '',
                isToday ? 'today' : '',
                isSun ? 'sunday' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(r.date)}
            >
              <div className="d">
                {r.date.replace(/-/g, '/')}
                {isToday && <span className="today-badge">今天</span>}
              </div>
              <div className="w">週{WD[dow]}</div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
