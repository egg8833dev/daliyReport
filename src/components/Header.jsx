const WD = ['日', '一', '二', '三', '四', '五', '六']

function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d + 'T00:00:00')
  return `${d.replace(/-/g, '/')} (週${WD[dt.getDay()]})`
}

export default function Header({ date, generatedAt, theme, onToggleTheme }) {
  return (
    <div className="topbar">
      <div className="lbl">
        目前檢視：<span>{fmtDate(date)}</span>
      </div>
      <div className="topbar-right">
        {generatedAt && <div className="gen-at">生成於 {generatedAt}</div>}
        <button className="theme-btn" onClick={onToggleTheme} title="切換主題">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
