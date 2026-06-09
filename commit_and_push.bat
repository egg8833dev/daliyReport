@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

:: Remove any stale lock files
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock" del /f ".git\HEAD.lock"

:: Get today's date (set vars outside the for-loop to avoid expansion issues)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set DT=%%I

set YYYY=%DT:~0,4%
set MM=%DT:~4,2%
set DD=%DT:~6,2%
set TODAY=%YYYY%-%MM%-%DD%

:: Stage all changes
git add -A

:: Commit
git commit -m "feat: update UI and scripts %TODAY%"

:: Push to remote
git push

echo.
echo ============================================
echo Done at %TIME%  [%TODAY%]
echo ============================================
pause
