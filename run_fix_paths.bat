@echo off
:: 雙擊此檔案即可執行路徑修正 + Task Scheduler 重新登錄
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix_paths_and_retask.ps1"
pause
