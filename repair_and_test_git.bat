@echo off
cd /d "C:\Users\egg8833\Desktop\每日周報"

echo [%DATE% %TIME%] === Starting git repair ===

:: 1. 清除所有 lock 檔
if exist ".git\index.lock" del /f ".git\index.lock" && echo Deleted index.lock
if exist ".git\HEAD.lock"  del /f ".git\HEAD.lock"  && echo Deleted HEAD.lock

:: 2. 刪除損壞的 index，讓 git 從 HEAD 重建
echo Removing corrupt .git\index...
del /f ".git\index" 2>nul

:: 3. 重建 index
echo Rebuilding index from HEAD...
git reset --quiet
if errorlevel 1 (
    echo git reset failed, trying read-tree...
    git read-tree HEAD
)

:: 4. 確認 index 健康
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: git index still broken after repair
    pause
    exit /b 1
) else (
    echo git index OK
)

:: 5. 試做一次完整 push 流程
echo.
echo === Running full push flow ===
git add public/reports/
git status --short

powershell -NoProfile -Command "(Get-Date).ToString('yyyy-MM-dd')" > rpt_date.tmp
set /p TODAY=<rpt_date.tmp
del rpt_date.tmp 2>nul

git commit -m "daily report %TODAY% [repair-test]"
if errorlevel 1 (
    echo Nothing new to commit or commit failed - checking...
    git log --oneline -3
) else (
    git push
    if errorlevel 0 echo Push SUCCESS
)

echo [%DATE% %TIME%] === Done ===
pause
