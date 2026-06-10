@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: 清除殘留 lock
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

:: 取得日期
powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd')" > "C:\Users\egg8833\Desktop\每日周報\rpt_date.tmp"
set /p TODAY=<"C:\Users\egg8833\Desktop\每日周報\rpt_date.tmp"
del "C:\Users\egg8833\Desktop\每日周報\rpt_date.tmp" 2>nul

:: git push
git add public/reports/
git commit -m "daily report %TODAY%"
git push

:: 寫入 log
echo [%TODAY% %TIME%] push done >> push_log.txt
