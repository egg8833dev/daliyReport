# setup_auto_push_task.ps1 - Run once to enable full automation

$dir   = "C:\Users\egg8833\Desktop\daliyReport"
$task  = "DailyReport-GitPush"
$bat   = "$dir\push_report_auto.bat"
$log   = "$dir\push_log.txt"
$time  = "04:45"
$skill = "C:\Users\egg8833\Claude\Scheduled\daily-briefing-tw\SKILL.md"
$newmd = "$dir\new_skill_content.md"

# -- 1. Register Windows Scheduled Task --

if (Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $task -Confirm:$false
    Write-Host "Removed old task: $task"
}

$a = New-ScheduledTaskAction `
    -Execute  "cmd.exe" `
    -Argument "/c `"$bat`" >> `"$log`" 2>&1"

$t = New-ScheduledTaskTrigger -Daily -At $time

$s = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Interactive = run as currently logged-in user, no admin needed
$p = New-ScheduledTaskPrincipal `
    -UserId   $env:USERNAME `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName   $task `
    -Action     $a `
    -Trigger    $t `
    -Settings   $s `
    -Principal  $p `
    -Description "Daily report git push at 04:45 Taiwan time" |
    Out-Null

if ($?) {
    Write-Host "[1/2] Task registered OK: $task (daily $time)"
} else {
    Write-Host "[1/2] Task registration FAILED - see error above"
}

# -- 2. Update SKILL.md (already done, but re-apply if needed) --

if ((Test-Path $newmd) -and (Test-Path $skill)) {
    Copy-Item -Path $newmd -Destination $skill -Force
    Write-Host "[2/2] SKILL.md updated"
} elseif (-not (Test-Path $skill)) {
    Write-Host "[2/2] SKILL.md not found: $skill"
} else {
    Write-Host "[2/2] SKILL.md already up to date (new_skill_content.md missing)"
}

# -- Done --

Write-Host ""
Write-Host "========================================"
Write-Host " Setup complete!"
Write-Host " Claude task : 04:04  search + write JSON"
Write-Host " Windows task: 04:45  clear lock + git push"
Write-Host " Log         : $log"
Write-Host "========================================"
Write-Host ""
Write-Host "Test with:"
Write-Host "  Start-ScheduledTask -TaskName '$task'; Start-Sleep 15; Get-Content '$log' -Tail 5"
