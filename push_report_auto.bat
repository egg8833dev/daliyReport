@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

set LOGFILE=C:\Users\egg8833\Desktop\每日周報\push_log.txt
echo [%DATE% %TIME%] === bat started === >> "%LOGFILE%"

if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"

del /f ".git\index" 2>nul
git reset --quiet 2>nul
echo [%DATE% %TIME%] git reset done >> "%LOGFILE%"

for /f "tokens=*" %%d in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd')"') do set TODAY=%%d
echo [%DATE% %TIME%] TODAY=%TODAY% >> "%LOGFILE%"

git add public/reports/
git status --short >> "%LOGFILE%" 2>&1
git commit -m "daily report %TODAY%"
set COMMIT_ERR=%errorlevel%
echo [%DATE% %TIME%] commit errorlevel=%COMMIT_ERR% >> "%LOGFILE%"

if %COMMIT_ERR% neq 0 (
    echo [%DATE% %TIME%] nothing to commit >> "%LOGFILE%"
    goto :eof
)

git push
echo [%DATE% %TIME%] push errorlevel=%errorlevel% >> "%LOGFILE%"

:eof
echo [%DATE% %TIME%] === done === >> "%LOGFILE%"
