@echo off
:: === DailyReport-GitPush ===
:: Set LOGFILE FIRST so errors are always captured, then cd
set LOGFILE=C:\Users\egg8833\Desktop\daliyReport\push_log.txt
echo [%DATE% %TIME%] === bat started === >> "%LOGFILE%"

cd /d "C:\Users\egg8833\Desktop\daliyReport"
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: cannot cd to daliyReport - check folder name >> "%LOGFILE%"
    echo [%DATE% %TIME%] === FAILED: wrong directory === >> "%LOGFILE%"
    exit /b 1
)
echo [%DATE% %TIME%] cd OK >> "%LOGFILE%"

:: Clean ALL git lock files left by any process
for %%f in (
    ".git\index.lock"
    ".git\HEAD.lock"
    ".git\ORIG_HEAD.lock"
    ".git\refs\heads\main.lock"
    ".git\objects\maintenance.lock"
    ".git\COMMIT_EDITMSG.lock"
    ".git\config.lock"
) do (
    if exist "%%f" (
        del /f /q "%%f"
        echo [%DATE% %TIME%] deleted lock: %%f >> "%LOGFILE%"
    )
)

del /f /q ".git\index" 2>nul
git reset --quiet 2>nul
echo [%DATE% %TIME%] git reset done >> "%LOGFILE%"

:: Get today's date (Taiwan time via PowerShell)
:: Write to a temp file then read back - avoids the nested single-quote escaping
:: problems that for/f introduces (which previously left TODAY empty).
powershell -NoProfile -Command "[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'Taipei Standard Time').ToString('yyyy-MM-dd')" > "%TEMP%\dr_today.txt"
set "TODAY="
set /p TODAY=<"%TEMP%\dr_today.txt"
echo [%DATE% %TIME%] TODAY=%TODAY% >> "%LOGFILE%"

:: Fallback: if PowerShell still produced nothing, fail loudly instead of looking for .json
if "%TODAY%"=="" (
    echo [%DATE% %TIME%] ERROR: TODAY is empty - date lookup failed >> "%LOGFILE%"
    echo [%DATE% %TIME%] === FAILED: empty date === >> "%LOGFILE%"
    exit /b 1
)

:: Check report file exists
if not exist "public\reports\%TODAY%.json" (
    echo [%DATE% %TIME%] ERROR: public/reports/%TODAY%.json not found - Claude task may not have run yet >> "%LOGFILE%"
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

:: 0=success, 1=nothing to commit, 128=fatal/lock error
if %COMMIT_ERR% equ 128 (
    echo [%DATE% %TIME%] ERROR: git commit fatal - attempting force cleanup >> "%LOGFILE%"
    git gc --prune=now >> "%LOGFILE%" 2>&1
    echo [%DATE% %TIME%] === FAILED: commit lock === >> "%LOGFILE%"
    exit /b 1
)

:: git push
git push >> "%LOGFILE%" 2>&1
set PUSH_ERR=%errorlevel%
echo [%DATE% %TIME%] push err=%PUSH_ERR% >> "%LOGFILE%"

if %PUSH_ERR% neq 0 (
    echo [%DATE% %TIME%] push FAILED - opening Fork >> "%LOGFILE%"
    start "" "%LOCALAPPDATA%\Fork\current\Fork.exe" "C:\Users\egg8833\Desktop\daliyReport"
    echo [%DATE% %TIME%] === FAILED: push error === >> "%LOGFILE%"
    exit /b 1
)

echo [%DATE% %TIME%] === SUCCESS: %TODAY% committed and pushed === >> "%LOGFILE%"
