# PowerShell script to fix Vercel environment variables
# This removes trailing newlines/CRLF from Firebase environment variables

$envVars = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY" = "<YOUR_FIREBASE_API_KEY>"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" = "pocket-portfolio-67fa6.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID" = "pocket-portfolio-67fa6"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "pocket-portfolio-67fa6.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "862430760996"
    "NEXT_PUBLIC_FIREBASE_APP_ID" = "1:862430760996:web:b1af05bdc347d5a65788b1"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" = "G-9FQ2NBHY7H"
    "NEXT_PUBLIC_GA_MEASUREMENT_ID" = "G-9FQ2NBHY7H"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key..."
    $value = $envVars[$key]
    
    # Create a temporary file with JUST the value (no newlines)
    $tempFile = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tempFile, $value, [System.Text.Encoding]::UTF8)
    
    # Remove existing var
    vercel env rm $key production --yes | Out-Null
    
    # Add new var from file (which has no trailing newlines)
    Get-Content $tempFile -Raw | vercel env add $key production | Out-Null
    
    # Clean up
    Remove-Item $tempFile
    
    Write-Host "Done with $key"
}

Write-Host "All environment variables updated!"
Write-Host "Deploying to production..."
vercel --prod --yes
