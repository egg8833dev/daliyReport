@echo off
:: 建立 Windows 工作排程器任務 - 每日自動 git push
:: 請「以系統管理員身份執行」此腳本

echo 正在建立自動推送排程任務...

schtasks /create /tn "DailyReport-GitPush" ^
  /tr "powershell.exe -ExecutionPolicy Bypass -File \"C:\Users\egg8833\Desktop\每日周報\push_report.ps1\"" ^
  /sc daily /st 04:30 ^
  /ru "%USERNAME%" ^
  /f

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ 成功建立排程任務 "DailyReport-GitPush"
    echo    每天 04:30 自動執行 git push
) else (
    echo.
    echo ❌ 建立失敗，請以系統管理員身份執行此腳本
)

pause
