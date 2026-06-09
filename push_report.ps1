Set-Location "C:\Users\egg8833\Desktop\每日周報"

$date = Get-Date -Format "yyyy-MM-dd"

git add public/reports/
$commitResult = git commit -m "daily report $date" 2>&1
Write-Host $commitResult

if ($LASTEXITCODE -eq 0) {
    $pushResult = git push 2>&1
    Write-Host $pushResult
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push OK - $date"
    } else {
        Write-Host "❌ Push failed"
        exit 1
    }
} elseif ($commitResult -match "nothing to commit") {
    Write-Host "ℹ️ Nothing to commit"
} else {
    Write-Host "❌ Commit failed"
    exit 1
}
