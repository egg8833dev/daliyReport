@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

set LOGFILE=C:\Users\egg8833\Desktop\每日周報\push_log.txt
echo [%DATE% %TIME%] === bat started === >> "%LOGFILE%"

:: Clean ALL git lock files left by any process
if exist ".git\index.lock"               del /f /q ".git\index.lock"
if exist ".git\HEAD.lock"                del /f /q ".git\HEAD.lock"
if exist ".git\ORIG_HEAD.lock"           del /f /q ".git\ORIG_HEAD.lock"
if exist ".git\refs\heads\main.lock"     del /f /q ".git\refs\heads\main.lock"
if exist ".git\objects\maintenance.lock" del /f /q ".git\objects\maintenance.lock"
echo [%DATE% %TIME%] lock cleanup done >> "%LOGFILE%"

del /f /q ".git\index" 2>nul
git reset --quiet 2>nul
echo [%DATE% %TIME%] git reset done >> "%LOGFILE%"

:: Get today's date
for /f "tokens=*" %%d in ('powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd')"') do set TODAY=%%d
echo [%DATE% %TIME%] TODAY=%TODAY% >> "%LOGFILE%"

:: Check report file exists
if not exist "public\reports\%TODAY%.json" (
    echo [%DATE% %TIME%] ERROR: public/reports/%TODAY%.json not found >> "%LOGFILE%"
    echo [%DATE% %TIME%] === FAILED: no report file === >> "%LOGFILE%"
    exit /b 1
)
echo [%DATE% %TIME%] report file OK: public/reports/%TODAY%.json >> "%LOGFILE%"

:: git add + commit
git add public/reports/
git status --short >> "%LOGFILE%" 2>&1

git commit -m "daily report %TODAY%" >> "%LOGFILE%" 2>&1
set COMMIT_ERR=%errorlevel%
echo [%DATE% %TIME%] commit err=%COMMIT_ERR% >> "%LOGFILE%"

:: 0=success, 1=nothing to commit, 128=lock error
if %COMMIT_ERR% equ 128 (
    echo [%DATE% %TIME%] ERROR: git lock still exists >> "%LOGFILE%"
    echo [%DATE% %TIME%] === FAILED: commit lock === >> "%LOGFILE%"
    exit /b 1
)

:: git push
git push >> "%LOGFILE%" 2>&1
set PUSH_ERR=%errorlevel%
echo [%DATE% %TIME%] push err=%PUSH_ERR% >> "%LOGFILE%"

if %PUSH_ERR% neq 0 (
    echo [%DATE% %TIME%] push FAILED - opening Fork >> "%LOGFILE%"
    start "" "%LOCALAPPDATA%\Fork\current\Fork.exe" "C:\Users\egg8833\Desktop\每日周報"
    echo [%DATE% %TIME%] === FAILED: push error === >> "%LOGFILE%"
    exit /b 1
)

echo [%DATE% %TIME%] === SUCCESS: %TODAY% committed and pushed === >> "%LOGFILE%"
