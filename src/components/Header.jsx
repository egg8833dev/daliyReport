const WD = ['日', '一', '二', '三', '四', '五', '六']

function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d + 'T00:00:00')
  return {
    display: d.replace(/-/g, '/'),
    week: `週${WD[dt.getDay()]}`,
  }
}

const SunIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="3" />
    <line x1="8" y1="1" x2="8" y2="2.5" />
    <line x1="8" y1="13.5" x2="8" y2="15" />
    <line x1="1" y1="8" x2="2.5" y2="8" />
    <line x1="13.5" y1="8" x2="15" y2="8" />
    <line x1="3.05" y1="3.05" x2="4.11" y2="4.11" />
    <line x1="11.89" y1="11.89" x2="12.95" y2="12.95" />
    <line x1="12.95" y1="3.05" x2="11.89" y2="4.11" />
    <line x1="4.11" y1="11.89" x2="3.05" y2="12.95" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 10A6 6 0 0 1 6 2.5a5.5 5.5 0 1 0 7.5 7.5z" />
  </svg>
)

export default function Header({ date, generatedAt, theme, onToggleTheme }) {
  const fmt = fmtDate(date)

  return (
    <div className="topbar">
      <div className="topbar-date">
        <div className="topbar-date-label">目前報告</div>
        {fmt
          ? <div className="topbar-date-value">{fmt.display} <span style={{ color: 'var(--text3)', fontWeight: 500 }}>{fmt.week}</span></div>
          : <div className="topbar-date-value" style={{ color: 'var(--text3)' }}>未選擇</div>
        }
      </div>
      <div className="topbar-right">
        {generatedAt && (
          <div className="gen-at">生成於 {generatedAt}</div>
        )}
        <button className="theme-btn" onClick={onToggleTheme} title="切換主題">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  )
}
