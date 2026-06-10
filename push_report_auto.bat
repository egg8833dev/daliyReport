@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: 清除殘留 lock
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

:: 取得日期（寫入暫存檔再讀取，避免 for /f 在 Task Scheduler 下失效）
powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd')" > "%TEMP%\rpt_date.txt" 2>nul
set /p TODAY=<"%TEMP%\rpt_date.txt"
del "%TEMP%\rpt_date.txt" 2>nul

:: git push
git add public/reports/
git commit -m "daily report %TODAY%"
git push

:: 寫入 log
echo [%TODAY% %TIME%] push done >> push_log.txt
