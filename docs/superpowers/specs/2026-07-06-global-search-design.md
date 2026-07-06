# 全域搜尋知識庫頁面 — 設計文件

日期:2026-07-06
狀態:設計核准,待撰寫實作計畫

## 目標

在既有每日日報 SPA 中新增「全域搜尋」功能:使用者輸入關鍵字,跨所有歷史報告搜尋,結果呈現「哪一天 / 哪一個區塊」命中,附高亮摘要;點擊結果跳回該報告並自動捲到該區塊。

## 背景與限制

- 純靜態 SPA(Vite + React),部署於 Vercel,**無後端**。搜尋必須在前端完成。
- 資料模型:
  - `public/reports/manifest.json` — 陣列 `[{ date, generatedAt }]`
  - `public/reports/YYYY-MM-DD.json` — `{ date, generatedAt, content }`,`content` 為 Markdown,含 17 個 `## <emoji> <中文數字>、<標題>` 區塊,區塊間以 `---` 分隔。
- 現況無 router;導覽為 App 內狀態切換(側邊欄選日期)。
- 17 區塊定義目前**重複硬編碼於兩處**:`ReportViewer.jsx` 的 `SECTIONS` 與 `SectionNav.jsx` 的 `TABS`。

## 使用者決策(已確認)

1. 進入方式:**側邊欄切換分頁**(非 overlay、非獨立網址路由)。
2. 搜尋資料:**前端懶載全拓**(進搜尋頁才 fetch 所有 daily json,記憶體比對,不動 `update_report.py` pipeline)。
3. 結果呈現:**區塊結果卡 + 高亮摘要**,點擊跳回報告並捲到該區塊。
4. 含**共享 `sections.js` 重構**(單一真相來源)。
5. 區塊篩選 chips:**v1 跳過**(YAGNI)。

---

## 架構

### 導覽狀態(App.jsx)

App 新增狀態:

- `view`: `'report'`(現有預設)| `'search'`
- `pendingScroll`: `string | null` — 要在報告載入後捲到的區塊 id

行為:

- Sidebar 頂部新增 **🔍 搜尋知識庫** 按鈕 → `setView('search')`。
- Sidebar 報告清單點任一日期 → `onSelect(date)` 同時 `setView('report')`(回報告視圖)。
- 搜尋結果卡點擊 → `setActiveDate(date)` + `setView('report')` + `setPendingScroll(sectionId)`。

主內容區依 `view` 渲染 `<ReportViewer>` 或 `<SearchView>`。

### 捲動到區塊(ReportViewer.jsx)

ReportViewer 接受新 prop `scrollTo`(區塊 id)+ `onScrolled` callback。當 `content` 載入完成且 `scrollTo` 有值:於 effect 中 `document.getElementById(scrollTo)?.scrollIntoView({ behavior:'smooth', block:'start' })`,完成後呼叫 `onScrolled()` 清掉 App 的 `pendingScroll`(避免重複觸發)。若該區塊在當日報告不存在(舊格式),靜默略過。

---

## 共享區塊中繼資料:`src/sections.js`

匯出單一 `SECTIONS` 陣列,17 筆,每筆:

```
{ id, ico, ttl, label, color, re }
```

- `id` 例 `'sec-algo'`;`ico` emoji;`ttl` 完整標題;`label` 側邊欄短標(如 `'🧮 演算法'`);`color` 十六進位;`re` 擷取該區塊全文的正則(沿用現有 `/##\s*<emoji>[\s\S]*?(?=\n##\s|$)/`)。

改寫消費端:

- `ReportViewer.jsx` — 移除本地 `SECTIONS`,改 `import { SECTIONS } from '../sections.js'`。
- `SectionNav.jsx` — 移除本地 `TABS`,由 `SECTIONS` 映射 `{ href: '#'+id, label }`。
- `SearchView.jsx` — 用 `SECTIONS` 切分每篇報告內容成區塊。

**驗收:** 未來調整區塊順序/新增區塊只需改 `sections.js` 一處。

匯出純函式 `splitSections(content) -> [{ id, ico, ttl, body }]`:對每個 SECTIONS 項以 `re` 比對,回傳命中的區塊(去掉 `## 標題` 行後的 body)。供 SearchView 與(選用)ReportViewer 共用。純函式,可單元測試。

---

## 資料載入與快取:`src/reportCache.js`

- 模組層級 `Map<date, content>`。
- `loadAllReports(manifest, onProgress?)`:對 manifest 每個 date,若快取無則 `fetch('/reports/'+date+'.json')`,以 `Promise.all` 並行;寫入 Map;回傳 `[{ date, generatedAt, content }]`。已快取者跳過重取。
- 每個 session 只實際下載一次;後續搜尋純記憶體。
- fetch 失敗的單日略過(不整批失敗),記錄以利除錯。

規模評估:數百檔 × 30–60KB,單次 session 一次性下載可接受。未來若過大,再引入建置期索引檔(非 v1 範圍)。

---

## 搜尋邏輯:`src/search.js`(純函式)

`search(query, reports) -> results`

- 前處理:`query.trim()`,以空白切成關鍵字陣列 `terms`;空查詢回傳 `[]`。
- 對每篇 report → `splitSections(content)` → 每區塊 body:
  - 比對規則:**大小寫不敏感**;所有 `terms` 皆須出現於該 body(AND)。CJK 以子字串直接比對。
  - 命中則產出一筆結果:
    ```
    { date, generatedAt, sectionId, ico, ttl, snippet, matchCount }
    ```
- `snippet`:於 body 中找第一個 term 命中位置,取前後約 120 字視窗;先移除 Markdown 語法雜訊(`#`、`*`、反引號、連結語法 → 顯示文字),再標記所有 term 出現處供高亮。
- `matchCount`:各 term 在該區塊出現次數合計(或命中區塊數,擇一;實作採 term 出現總次數)。
- 排序:`date` 由新到舊。

高亮:回傳可含區間標記(如切分成 `{ text, hit }` 片段的陣列)或帶 `<mark>` 的安全片段;由 SearchView 渲染。以純資料回傳、由元件渲染,避免在純函式內產 HTML 字串。

---

## UI:`src/components/SearchView.jsx`

- 頂部:搜尋輸入框(autofocus)、結果數統計、載入進度(首次下載時)。
- 進入時觸發 `loadAllReports`;載入中顯示進度條/骨架。
- 輸入 debounce ~250ms(資料就緒後才比對)。
- 結果列表:每筆一張卡
  - 第一行:`日期(YYYY/MM/DD) · 週X` + 區塊 `emoji 標題`
  - 第二行:高亮摘要
  - 角落:命中次數
  - 整卡可點 → 觸發 App 的結果點擊流程。
- 空狀態:未輸入 → 提示「輸入關鍵字搜尋所有報告」;有輸入無結果 → 「找不到符合的內容」。
- 樣式沿用現有 `.sec-*` / CSS 變數風格,新增少量 class(`.search-*`)。深/淺色皆需相容(沿用 CSS 變數即可)。

---

## 錯誤處理

- manifest 載入失敗:搜尋頁顯示錯誤狀態,可重試。
- 個別 daily json fetch 失敗:略過該日,不影響其餘結果。
- 舊格式報告(缺少新 5 區塊):`splitSections` 只回傳實際命中的區塊,無則不產結果;點擊捲動時目標不存在則靜默略過。

## 測試

純函式優先,均可單元測試(Vitest,若專案未設置則於計畫階段加入最小配置):

- `splitSections`:給樣本 Markdown(含多區塊、含 `---`、含舊格式缺區塊)→ 正確切出區塊 id/ttl/body。
- `search`:
  - 單一關鍵字命中/不命中
  - 多關鍵字 AND(其一不在該區塊則不命中)
  - 大小寫不敏感
  - CJK 子字串命中
  - 空查詢回傳 `[]`
  - 排序為日期新到舊
  - snippet 視窗與高亮標記位置正確
- 元件層(選用,若已有測試設施):結果卡點擊呼叫正確 callback、參數含 date 與 sectionId。

## 非目標(v1 明確排除)

- 區塊篩選 chips、日期範圍篩選。
- 建置期/寫入期搜尋索引檔、`update_report.py` 改動。
- 模糊比對、同義詞、注音/拼音、相關度評分排序(僅日期排序)。
- 獨立網址路由 / 深連結分享搜尋結果。

## 受影響檔案

新增:
- `src/sections.js`
- `src/reportCache.js`
- `src/search.js`
- `src/components/SearchView.jsx`
- 測試檔(對應純函式)

修改:
- `src/App.jsx`(view / pendingScroll 狀態、渲染切換、結果點擊流程)
- `src/components/Sidebar.jsx`(搜尋按鈕、點日期回報告視圖)
- `src/components/ReportViewer.jsx`(改用共享 SECTIONS、scrollTo prop)
- `src/components/SectionNav.jsx`(改用共享 SECTIONS)
- `src/App.css`(搜尋頁樣式)
