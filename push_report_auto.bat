@echo off
setlocal EnableExtensions

:: === DailyReport-GitPush ===
:: This legacy Windows task only pushes a report that has already passed
:: update_report.py --check. Generation and validation happen before this step.
set "LOGFILE=C:\Users\egg8833\Desktop\daliyReport\push_log.txt"
set "PROJECT_DIR=C:\Users\egg8833\Desktop\daliyReport"
set "SOURCE_REPORT=%PROJECT_DIR%\daily_report_today.md"

echo [%DATE% %TIME%] === push task started === >> "%LOGFILE%"
cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: cannot open project directory >> "%LOGFILE%"
    exit /b 1
)

for /f %%D in ('powershell -NoProfile -Command "[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'Taipei Standard Time').ToString('yyyy-MM-dd')"') do set "TODAY=%%D"
if "%TODAY%"=="" (
    echo [%DATE% %TIME%] ERROR: Taiwan date lookup failed >> "%LOGFILE%"
    exit /b 1
)

if not exist "%SOURCE_REPORT%" (
    echo [%DATE% %TIME%] ERROR: source report is missing >> "%LOGFILE%"
    exit /b 1
)

python update_report.py --check "%SOURCE_REPORT%" >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: report quality check failed; nothing was staged >> "%LOGFILE%"
    exit /b 1
)

if not exist "public\reports\%TODAY%.json" (
    echo [%DATE% %TIME%] ERROR: validated report JSON is missing >> "%LOGFILE%"
    exit /b 1
)

git add -- "public/reports/%TODAY%.json" "public/reports/manifest.json" >> "%LOGFILE%" 2>&1
git diff --cached --quiet
if not errorlevel 1 (
    echo [%DATE% %TIME%] no report changes to push >> "%LOGFILE%"
    exit /b 0
)

git commit -m "daily report %TODAY%" >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: commit failed >> "%LOGFILE%"
    exit /b 1
)

git pull --rebase origin main >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: rebase failed; resolve before retrying >> "%LOGFILE%"
    exit /b 1
)

git push origin HEAD:main >> "%LOGFILE%" 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] ERROR: push failed >> "%LOGFILE%"
    exit /b 1
)

echo [%DATE% %TIME%] === success: %TODAY% pushed === >> "%LOGFILE%"
