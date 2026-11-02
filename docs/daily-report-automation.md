# 每日日報自動化

GitHub Actions 的 `Daily report` workflow 每日 UTC 21:45（台灣隔日 05:45）開始，GitHub 可能延後執行。只有 workflow 存在於遠端預設分支才會啟用排程。公開儲存庫長期無活動時 GitHub 可能停用排程，請定期查看 Actions 狀態。

## 一次性設定

1. 在 GitHub 儲存庫 Settings → Secrets and variables → Actions 新增 `REPORT_OPENAI_API_KEY`。值為可使用 Codex API 的 OpenAI API key；ChatGPT 訂閱不等同 API 額度。不要把金鑰放進程式碼或聊天。
2. 確認 Actions 可執行官方 OpenAI action，且 repository Actions 政策允許 workflow 的 `contents: write`。若 main 有分支保護或 ruleset，須依你的規則允許這項自動推送；本 workflow 不繞過保護或 force push。
3. 在 Actions → Daily report → Run workflow 手動測試，可輸入補報日期（YYYY-MM-DD），空白則取台灣當日。
4. 確認兩個 job 完成、main 出現 `daily report YYYY-MM-DD` commit，再至 Vercel 確認部署。Vercel 必須已連接 main，並允許 github-actions[bot] 觸發部署；推送成功本身不能證明 Vercel 部署成功。

生成 job 只有讀取儲存庫權限，以官方 Codex Action 使用即時搜尋，完整遵循 `INSTRUCTIONS.md`；讀取最新進度、holdings 與防重複期間歷史資料。其輸出只有 Markdown artifact。獨立發布 job 從 main 重新 checkout，只採用 Markdown，檢查固定標題、進度、JavaScript 範例、來源連結，再執行既有測試與建置，最後僅提交當日 JSON 與 manifest。機械檢查不能取代新聞事實與內容品質審查；定期抽查來源及生成品質。

缺少 API key、來源無法存取、驗證失敗、推送被保護規則拒絕，都會使 Actions 明確失敗，不會假裝已完成。API 使用及 GitHub runner 可能產生費用。若同一天原有 Windows 排程仍在執行，請停用其中一份，避免覆蓋不同版本日報。

## 手動生成與發布

依 INSTRUCTIONS.md 將完整內容寫到 `/tmp/daily_report.md`，在專案根目錄執行：

```bash
python3 scripts/publish_daily_report.py /tmp/daily_report.md --date 2026-11-02 --check --verify-links
python3 scripts/publish_daily_report.py /tmp/daily_report.md --date 2026-11-02 --verify-links
python3 -m unittest discover -s scripts -p 'test_*.py'
npm test
npm run build
git add -- public/reports/2026-11-02.json public/reports/manifest.json
git commit -m 'daily report 2026-11-02'
git push origin HEAD:main
```

新腳本使用自己的實際 checkout 位置與 `Asia/Taipei` 時區，不依賴 Windows 絕對路徑，也不自動推送。舊 `update_report.py` 與 Windows 腳本保留原樣。所有可執行 `javascript/js` code fence 都須自包含並能以 Node.js 執行；需要瀏覽器或 API key 的額外片段使用 `text` 並明示未執行。
