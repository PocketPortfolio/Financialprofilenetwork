# Remove all localhost fetch calls and agent log regions from dividend route
$file = 'app/api/dividend/[ticker]/route.ts'
$content = Get-Content $file -Raw

# Remove all agent log regions with localhost fetch calls
$content = $content -replace '(?s)// #region agent log.*?// #endregion', ''

# Remove any remaining standalone localhost fetch calls
$content = $content -replace '(?s)if \(typeof fetch !== ''undefined''\) \{[^}]*fetch\(''http://127\.0\.0\.1:43110[^}]*\}\.catch\(\(\) => \{\}\);', ''

# Remove any remaining localhost fetch patterns
$content = $content -replace 'fetch\(''http://127\.0\.0\.1:43110[^}]*\}\.catch\(\(\) => \{\}\);', ''

Set-Content -Path $file -Value $content -NoNewline










