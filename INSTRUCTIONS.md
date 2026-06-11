# 每日資訊日報 — 生成指引

## 基本規則
- 語言：繁體中文為主，專業術語保留英文
- 每點 1–2 句說明
- 每點末尾加【影響】說明對開發者/工程師的實際意義
- 每條資訊末尾附來源連結：`[→ 媒體名稱](實際文章URL)`
- 優先查詢一手來源，避免純 SEO 整理文章
- 每個區塊末尾加 `📌 今日重點：一句話總結`
- 財經資訊標註「僅供參考，非投資建議」

## 十大資訊類別

### 1. 📰 國際與台灣重要新聞
來源：Reuters、BBC、CNA 中央社、自由時報、RTI 中央廣播電台
- 今日最值得關注的國際與台灣時事 3–5 則
- 涵蓋政治、外交、社會、氣候

### 2. 💹 財經與股市
來源：Bloomberg、Reuters Finance、玩股網、鉅亨網、Yahoo 股市
- 美股三大指數、那斯達克科技股、費城半導體指數
- 台積電（2330）、鴻海（2317）、0050 前一交易日收盤
- Fed/央行政策、匯率、重要財報
- 盤前注意事項 1–2 點（標註「僅供參考，非投資建議」）

> **週末特別處理**：週六、週日美股與台股休市，無當日收盤數據。
> 此時財經區塊改以「本週市場回顧」呈現：
> 整週漲跌幅、重要事件摘要、下週值得關注的財經行事曆（財報、Fed 會議、經濟數據）。

### 3. 🔬 科技與技術新知
來源：Hacker News、TechCrunch、The Verge、InfoQ、Ars Technica
補充：GitHub Trending（今日）、Product Hunt（今日）
- AI/ML 最新動態（模型發布、研究突破）
- 硬體、晶片、雲端基礎設施消息
- GitHub Trending 熱門開源專案 2–3 則（含語言、star 數、GitHub 直連連結）
- Product Hunt 今日值得關注工具 1–2 則

### 4. 🖥️ 前端 / UI UX / 網頁設計
**目標：每日產出 8–10 則**
來源：web.dev、Chrome Developers Blog、Smashing Magazine、frontendfoc.us、Next.js Blog、Vite Blog
補充：dev.to 高讚文、GitHub Trending JS/TS、CSS-Tricks、Josh W. Comeau、Kent C. Dodds Blog

涵蓋面向（每面向至少 1 則，總計 8–10 則）：
- **框架動態**：React、Vue、Next.js、Nuxt、Vite、Svelte、Astro 版本更新或重要 RFC/PR
- **瀏覽器 & Web 平台**：web.dev / Chrome Blog 最新發布、新 API、Firefox/Safari 跟進狀況
- **CSS & 樣式**：新特性、規範進展、值得學習的技巧或工具
- **JavaScript 語言**：TC39 Proposals 近期進展（Stage 3/4 優先）
- **效能優化**：Core Web Vitals、Bundle size、Hydration、Streaming SSR 等實務技巧
- **UI/UX 設計**：Figma 功能更新、設計系統、設計趨勢、無障礙（a11y）
- **開源工具 & 元件庫**：新發布或重大更新（附 GitHub 連結與 star 數）
- **社群精選**：dev.to / X / GitHub Discussion 本週高讚技術文 1–2 則
- **學習資源**：值得收藏的教學文章、互動工具、或免費課程 1 則

### 5. ⚙️ 後端 / 資安 / 維運 / CI/CD
**目標：每日產出 8–10 則**
來源：The Hacker News、CVE Details、Node.js Blog、.NET Blog、Go Blog、Docker Blog、CNCF Blog
補充：Hacker News 資安討論、GitHub Advisory Database、AWS Blog、GCP Blog、Azure Blog、GitHub Actions Changelog

涵蓋面向（每面向至少 1 則，總計 8–10 則）：
- **後端語言 & 框架**：Node.js、.NET、Go、Rust、Python 官方 Blog 優先
- **資安漏洞 CVE**：今日重要 CVE（CVSS ≥ 7.0 優先），附 CVE 編號與詳情連結
- **資安趨勢**：供應鏈攻擊、零時差漏洞、資安政策（來源：The Hacker News）
- **Docker & Container**：Docker Engine/Desktop/Compose 更新、container security
- **Kubernetes & CNCF**：K8s 版本、Helm、Argo CD、Flux、Istio 等生態重要更新
- **CI/CD**：GitHub Actions、GitLab CI、CircleCI 重要功能或安全更新
- **雲端服務**：AWS、GCP、Azure 重要公告（新服務、定價變動、deprecation 通知）
- **資料庫 & 儲存**：PostgreSQL、MySQL、Redis、MongoDB、ClickHouse 等重要更新
- **可觀測性 & 監控**：OpenTelemetry、Prometheus、Grafana、Datadog 相關動態
- **社群精選**：Hacker News / Reddit r/devops 本週高讚討論 1 則

### 6. 🔍 SEO 知識與內容優化建議
來源：Google Search Central Blog、Ahrefs Blog、Moz Blog、Search Engine Journal

#### 6-1 SEO 產業動態
- Google 演算法更新或 Search Console 新功能 1–2 則
- 值得關注的 SEO 趨勢或研究（Core Web Vitals、AI Search 影響等）

#### 6-2 內容優化建議（結合當日熱點）
- 從今日新聞/科技/前端議題中，挑選 1 則最具搜尋潛力的主題
- 說明關鍵字方向、搜尋意圖、建議內容架構
- 標註適合發布的平台

### 7. 📅 歷史上的今天
**目標：每日產出 5 則**
來源：Wikipedia「On This Day」、歷史頻道（History.com）、Britannica、故事 StoryStudio、中央研究院臺灣史數位資料庫

涵蓋面向（總計 5 則，兼顧不同主題）：
- **世界歷史大事**：改變人類進程的政治、戰爭、外交、科學重大事件
- **科技 / 發明里程碑**：與科技、工程、網路、太空探索相關的歷史節點
- **台灣歷史**：台灣本土重要歷史事件、人物紀念日或文化里程碑
- **文化 / 藝術 / 體育**：經典作品首映、運動紀錄、藝術家誕辰或逝世
- **趣聞 / 冷知識**：出人意料的歷史巧合、奇特事件、鮮為人知的故事

格式規範：
- 每則標示「YYYY 年，[事件名稱]」開頭
- 簡述事件經過（2–3 句）
- 末尾加【歷史啟示】：一句話說明此事對現代的意義或借鑑
- 附來源連結

📌 今日重點：一句話點出今日歷史中最值得現代人借鑑的洞見。

---

### 8. 📝 今日發文素材推薦
從以上各區塊中，挑選 1–2 則最適合整理成文章的題材：
- 為什麼值得寫
- 目標讀者（前端工程師 / 設計師 / 一般開發者）
- 建議標題方向（給 2–3 個選項）
- 建議平台：[Medium](https://medium.com/)、[iT 邦幫忙](https://ithelp.ithome.com.tw/)、[LinkedIn](https://www.linkedin.com/)

---

### 9. 💼 職涯規劃與職場發展
**目標：每日產出 10 則以上**
來源：LinkedIn Talent Insights、Harvard Business Review、104人力銀行、1111人力銀行、CakeResume Blog、天下雜誌職場版、商業周刊、Glassdoor、Levels.fyi

涵蓋面向（每面向至少 1–2 則，總計 10 則以上）：
- **就業市場趨勢**：台灣 / 全球熱門職缺、薪資行情、供需變化（來源：104、1111、LinkedIn）
- **薪資情報**：特定職務 / 職級的市場薪酬範圍，台灣與海外對比（來源：Levels.fyi、Glassdoor）
- **必學技能**：技術硬技能（程式語言、框架、工具）1–2 則，具體說明為何值得學
- **軟技能培養**：溝通、領導、談判、簡報、系統思維等實用技巧 1 則
- **求職技巧**：履歷撰寫、作品集建立、面試準備、LinkedIn 優化 1 則
- **談薪策略**：開薪資談判的具體話術與策略、如何回應 offer 1 則
- **職涯規劃路徑**：IC（個人貢獻者）vs 管理路線、技術專家路線的選擇與準備
- **職場發展**：升遷策略、跨部門合作、遠距工作技巧、混合辦公效率 1 則
- **副業 / 自由接案**：副業開始的門檻、接案平台推薦、定價策略 1 則
- **產業觀察**：科技業 / 設計業 / 新創圈最新動態，影響求職與薪資的宏觀因素
- **工具與資源**：值得收藏的求職工具、薪資查詢平台、學習資源 1 則

📌 今日重點：一句話總結職涯/職場最值得關注的訊息。

---

### 10. 🌟 心靈勵志與成功學
**目標：每日產出 10 則以上**
來源：TED Talks、天下雜誌、商業周刊、遠見雜誌、成功人士傳記 / 訪談、Blinkist 書摘、James Clear（原子習慣）、Naval Ravikant 語錄

涵蓋面向（每面向至少 1–2 則，總計 10 則以上）：
- **今日名言 × 2**：精選 2 則不同領域成功人士名言（附人物姓名與背景脈絡），鼓勵行動而非空泛激勵
- **成功人士習慣**：具體可複製的晨間 / 工作習慣，舉真實案例說明執行方式
- **成功人士思維框架**：決策方法、思考模型（第一性原理、逆向思考、機率思維等）1 則
- **目標設定方法論**：OKR、SMART、GTD 其中之一，附實際應用步驟與範例
- **心流 / 深度工作**：如何進入心流狀態、抵抗干擾、維持深度專注的具體技巧 1 則
- **正向心理學**：幸福感研究、感恩練習、心理韌性（Resilience）相關科學發現 1 則
- **逆境復原力**：真實案例（創業失敗、職場挫折、重大挑戰）如何逆轉的故事 1 則
- **成長型思維**：Carol Dweck 研究或相關真實案例，具體說明固定思維 vs 成長思維的差異
- **人際關係與影響力**：如何建立信任、深化人脈、有效說服他人的實用原則 1 則
- **推薦書摘**：值得深讀的書（非業配），附 3 句話說明為何值得讀及核心洞見
- **推薦 TED 演講**：附連結，說明主題與最重要的一個觀念

> 每則末尾加【行動建議】：「今天可以做的一件小事」，讓勵志內容有實際落地點。

📌 今日重點：一句話總結今日最值得帶走的心靈或成功學洞見。

---

## Markdown 輸出格式（供 HTML 解析，不可更改標題）

```
## 📰 一、國際與台灣重要新聞
## 💹 二、財經與股市資訊
## 🔬 三、科技與技術新知
## 🖥️ 四、前端 / UI UX / 網頁設計
## ⚙️ 五、後端 / 資安 / 維運 / CI/CD
## 🔍 六、SEO 知識與內容優化建議
## 📅 七、歷史上的今天
## 📝 八、今日發文素材推薦
## 💼 九、職涯規劃與職場發展
## 🌟 十、心靈勵志與成功學
```

區塊之間用 `---` 分隔。

---

## 寫入規則

1. 將 Markdown 報告存成 `/tmp/daily_report.md`
2. 執行寫入腳本（**務必加 TZ=Asia/Taipei**）：
   ```bash
   REPORT_PATH=$(ls /sessions/*/mnt/Desktop/每日周報/update_report.py 2>/dev/null | head -1)
   TZ=Asia/Taipei python3 "$REPORT_PATH" /tmp/daily_report.md
   ```
3. 腳本會自動：
   - 驗證十個區塊是否完整（缺少即中止，不覆蓋舊報告）
   - 寫入 `public/reports/YYYY-MM-DD.json`（每日一檔）
   - 更新 `public/reports/manifest.json`（報告索引）
   - 執行 `git add public/reports/ && git commit && git push`（自動部署到 Vercel）
   - 所有報告永久保留，不自動刪除
