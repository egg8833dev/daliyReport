const WD = ['日', '一', '二', '三', '四', '五', '六']

function todayTW() {
  const t = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' }))
  return [
    t.getFullYear(),
    String(t.getMonth() + 1).padStart(2, '0'),
    String(t.getDate()).padStart(2, '0'),
  ].join('-')
}

export default function Sidebar({ manifest, activeDate, onSelect }) {
  const td = todayTW()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>📋 每日資訊日報</h1>
        <p>共 {manifest.length} 份報告</p>
      </div>
      <div className="report-list">
        {manifest.map(r => {
          const dt = new Date(r.date + 'T00:00:00')
          const dow = dt.getDay()
          const isToday = r.date === td
          const isActive = r.date === activeDate
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
