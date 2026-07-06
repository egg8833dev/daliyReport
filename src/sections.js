export const SECTIONS = [
  { id: 'sec-news',      ico: '📰',  ttl: '國際與台灣重要新聞', label: '📰 新聞',    color: '#3b82f6', re: /##\s*📰[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-finance',   ico: '💹',  ttl: '財經與股市資訊',    label: '💹 財經',    color: '#10b981', re: /##\s*💹[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-tech',      ico: '🔬',  ttl: '科技與技術新知',    label: '🔬 科技',    color: '#8b5cf6', re: /##\s*🔬[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-frontend',  ico: '🖥️', ttl: '前端 / UI UX / 網頁設計', label: '🖥️ 前端', color: '#f59e0b', re: /##\s*🖥[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-backend',   ico: '⚙️', ttl: '後端 / 資安 / 維運',  label: '⚙️ 後端',   color: '#ef4444', re: /##\s*⚙[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-fintech',   ico: '💱',  ttl: '金融科技與交易系統',  label: '💱 金科',    color: '#22c55e', re: /##\s*💱[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-algo',      ico: '🧮',  ttl: '演算法',            label: '🧮 演算法',  color: '#6366f1', re: /##\s*🧮[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-sysdesign', ico: '🏗️', ttl: '系統設計',          label: '🏗️ 系統設計', color: '#d97706', re: /##\s*🏗[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-ai',        ico: '🤖',  ttl: 'AI 工程與工作流實戰', label: '🤖 AI',      color: '#7c3aed', re: /##\s*🤖[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-seo',       ico: '🔍',  ttl: 'SEO 知識與內容優化',  label: '🔍 SEO',     color: '#ec4899', re: /##\s*🔍[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-writing',   ico: '✍️', ttl: '技術寫作與個人品牌',  label: '✍️ 寫作',   color: '#0d9488', re: /##\s*✍[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-tools',     ico: '🧰',  ttl: '開發者效率工具',    label: '🧰 工具',    color: '#65a30d', re: /##\s*🧰[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-deepread',  ico: '📖',  ttl: '深讀計畫',          label: '📖 深讀',    color: '#9333ea', re: /##\s*📖[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-history',   ico: '📅',  ttl: '歷史脈絡｜鑑往知今',  label: '📅 脈絡',    color: '#a16207', re: /##\s*📅[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-career',    ico: '💼',  ttl: '職涯規劃與職場發展',  label: '💼 職涯',    color: '#0ea5e9', re: /##\s*💼[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-inspire',   ico: '🌟',  ttl: '心靈勵志與成功學',    label: '🌟 勵志',    color: '#f97316', re: /##\s*🌟[\s\S]*?(?=\n##\s|$)/ },
  { id: 'sec-post',      ico: '📝',  ttl: '今日發文素材推薦',    label: '📝 發文',    color: '#14b8a6', re: /##\s*📝[\s\S]*?(?=\n##\s|$)/ },
]

// Split a report's markdown content into its matched sections.
// Returns only sections present in the content, in SECTIONS order,
// with the leading `## …` heading line removed.
export function splitSections(content) {
  const out = []
  for (const s of SECTIONS) {
    const m = content.match(s.re)
    if (!m) continue
    const body = m[0].replace(/^##[^\n]*\n?/, '').trim()
    out.push({ id: s.id, ico: s.ico, ttl: s.ttl, body })
  }
  return out
}
