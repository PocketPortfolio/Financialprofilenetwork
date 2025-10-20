# Set Firebase environment variables in Vercel
Write-Host "Setting Firebase environment variables in Vercel production..." -ForegroundColor Cyan

# Function to set environment variable
function Set-VercelEnv {
    param (
        [string]$Name,
        [string]$Value
    )
    
    Write-Host "Setting $Name..." -ForegroundColor Yellow
    echo $Value | vercel env add $Name production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $Name set successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set $Name" -ForegroundColor Red
    }
    Write-Host ""
}

# Set all Firebase environment variables
Set-VercelEnv NEXT_PUBLIC_FIREBASE_API_KEY "AIzaSyDIL02q3thafHYAEziJVRlr4ibst5dqvRo"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "pocket-portfolio-67fa6.firebaseapp.com"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_PROJECT_ID "pocket-portfolio-67fa6"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "pocket-portfolio-67fa6.firebasestorage.app"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "862430760996"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_APP_ID "1:862430760996:web:b1af05bdc347d5a65788b1"
Set-VercelEnv NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID "G-9FQ2NBHY7H"

Write-Host "✅ All environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Now triggering production deployment..."
vercel deploy --prod
Write-Host "🎉 Done! Check https://www.pocketportfolio.app in 2-3 minutes"
