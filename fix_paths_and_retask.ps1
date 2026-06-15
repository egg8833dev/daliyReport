$dir  = "C:\Users\egg8833\Desktop\daliyReport"
$task = "DailyReport-GitPush"
$bat  = "$dir\push_report_auto.bat"

Write-Host "=== Step 1: Fix SKILL.md paths ==="

$searchRoot = "$env:APPDATA\Claude"
$fixed = 0
if (Test-Path $searchRoot) {
    $files = Get-ChildItem $searchRoot -Recurse -Filter "SKILL.md" -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -like "*daily-briefing*" }
    foreach ($f in $files) {
        $c = Get-Content $f.FullName -Raw -Encoding UTF8
        if ($c -match [regex]::Escape("daliyReport")) {
            Write-Host "  Already OK: $($f.FullName)"
        } elseif ($c -match [regex]::Escape("dailyReport")) {
            $c2 = $c -replace [regex]::Escape("dailyReport"), "daliyReport"
            [System.IO.File]::WriteAllText($f.FullName, $c2, [System.Text.Encoding]::UTF8)
            Write-Host "  Fixed (dailyReport->daliyReport): $($f.FullName)"
            $fixed++
        } elseif ($c -match [regex]::Escape("each")) {
            Write-Host "  Found but no path match: $($f.FullName)"
        }
        if ($c -match [regex]::Escape("update_report")) {
            $old = [regex]::Escape("Desktop/each")
            $pat = "mnt/Desktop/[^/]*/update_report"
            if ($c -match $pat) {
                Write-Host "    Contains update_report path reference"
            }
        }
        # Replace old folder name in any variant
        if ($c -match [regex]::Escape("每日周報") -or $c -match "每日周報") {
            $c2 = $c -replace "每日周報", "daliyReport"
            [System.IO.File]::WriteAllText($f.FullName, $c2, [System.Text.Encoding]::UTF8)
            Write-Host "  Fixed Chinese path: $($f.FullName)"
            $fixed++
        }
    }
    if ($files.Count -eq 0) { Write-Host "  No SKILL.md found under $searchRoot" }
} else {
    Write-Host "  Claude AppData not found: $searchRoot"
}

Write-Host ""
Write-Host "=== Step 2: Re-register Task Scheduler ==="

if (Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $task -Confirm:$false
    Write-Host "  Removed old task."
}

$a = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$bat`""
$t = New-ScheduledTaskTrigger -Daily -At "04:45"
$s = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1)
$p = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $task -Action $a -Trigger $t -Settings $s -Principal $p `
    -Description "Daily report git push 04:45 Taiwan (daliyReport)" | Out-Null

if ($?) {
    Write-Host "  Task registered OK: $task at 04:45"
} else {
    Write-Host "  Task registration FAILED"
}

Write-Host ""
Write-Host "=== Step 3: Verify ==="
$reg = Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
if ($reg) {
    Write-Host "  State: $($reg.State)"
    Write-Host "  Action: $($reg.Actions[0].Arguments)"
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "To test: Start-ScheduledTask -TaskName '$task'"
Write-Host "Log: $dir\push_log.txt"
