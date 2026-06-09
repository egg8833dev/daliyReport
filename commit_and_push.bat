@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: Remove any stale lock file
if exist ".git\index.lock" del /f ".git\index.lock"

:: Stage all changes (explicit to avoid index issues)
git add -A
git add src/ public/ update_report.py 2>nul

:: Commit
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TODAY=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%

git commit -m "feat: update UI styles and add auto-push scripts %TODAY%"

:: Push
git push

echo.
echo Done at %TIME%
pause
