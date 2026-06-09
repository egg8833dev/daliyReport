@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: 取得今日日期 (Taiwan time)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TODAY=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%

git add public/reports/
git commit -m "daily report %TODAY%"
git push

echo.
echo Push completed at %TIME%
