# Quick status check for sitemap test
if (Test-Path "sitemap-test-progress.json") {
    $p = Get-Content "sitemap-test-progress.json" | ConvertFrom-Json
    Write-Host "Test Progress:" -ForegroundColor Cyan
    Write-Host "  Tested: $($p.testedUrls.Count) / $($p.stats.total) URLs"
    Write-Host "  Passed: $($p.stats.passed)"
    Write-Host "  Failed: $($p.stats.failed)"
    if ($p.stats.total -gt 0) {
        $percent = [math]::Round(($p.testedUrls.Count / $p.stats.total) * 100, 1)
        Write-Host "  Progress: $percent%"
    }
    Write-Host "  Last Update: $($p.lastUpdate)"
} else {
    Write-Host "Test is starting up or progress file not found yet..." -ForegroundColor Yellow
}

