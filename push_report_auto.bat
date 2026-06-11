@echo off
chcp 65001 > nul
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: === 使用絕對路徑記錄 log，避免 cd 失敗時寫錯位置 ===
set LOGFILE=C:\Users\egg8833\Desktop\每日周報\push_log.txt
echo [%DATE% %TIME%] === bat started === >> "%LOGFILE%"

:: 1. 清除殘留 lock 檔
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

:: 2. 重建 git index（Claude sandbox 的 Linux git 會損壞 index，每次重建確保乾淨）
del /f ".git\index" 2>nul
git reset --quiet 2>nul
echo [%DATE% %TIME%] git reset done >> "%LOGFILE%"

:: 3. 取得今日日期
for /f "tokens=*" %%d in ('powershell -NoProfile -Command "(Get-Date).ToStrin