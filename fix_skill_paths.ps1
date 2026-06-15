$old = [char]0x6BCF + [char]0x65E5 + [char]0x5468 + [char]0x5831  # 每日周報 as codepoints
$new = "daliyReport"

Write-Host "=== Fix SKILL.md: every location ==="

$locations = @(
    "C:\Users\egg8833\Claude\Scheduled\daily-briefing-tw\SKILL.md",
    "C:\Users\egg8833\AppData\Roaming\Claude\Scheduled\daily-briefing-tw\SKILL.md",
    "C:\Users\egg8833\AppData\Local\Claude\Scheduled\daily-briefing-tw\SKILL.md"
)

$fixed = 0
foreach ($p in $locations) {
    if (Test-Path $p) {
        $c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
        if ($c -match [regex]::Escape($old)) {
            $c2 = $c -replace [regex]::Escape($old), $new
            [System.IO.File]::WriteAllText($p, $c2, [System.Text.Encoding]::UTF8)
            Write-Host "  FIXED: $p"
            $fixed++
        } elseif ($c -match $new) {
            Write-Host "  Already OK: $p"
        } else {
            Write-Host "  No match: $p"
        }
    } else {
        Write-Host "  Not found: $p"
    }
}

# Also do a broad recursive search under user profile
Write-Host ""
Write-Host "=== Broad search under user profile ==="
$roots = @(
    "C:\Users\egg8833\Claude",
    "C:\Users\egg8833\AppData\Roaming\Claude",
    "C:\Users\egg8833\AppData\Local\Claude"
)
foreach ($root in $roots) {
    if (Test-Path $root) {
        Write-Host "  Searching: $root"
        Get-ChildItem $root -Recurse -Filter "SKILL.md" -ErrorAction SilentlyContinue | ForEach-Object {
            $c = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
            if ($c -match [regex]::Escape($old)) {
                $c2 = $c -replace [regex]::Escape($old), $new
                [System.IO.File]::WriteAllText($_.FullName, $c2, [System.Text.Encoding]::UTF8)
                Write-Host "    FIXED: $($_.FullName)"
                $fixed++
            }
        }
    }
}

Write-Host ""
if ($fixed -gt 0) {
    Write-Host "Total fixed: $fixed file(s)"
} else {
    Write-Host "No files needed fixing (all already OK or not found)"
}
Write-Host "=== DONE ==="
