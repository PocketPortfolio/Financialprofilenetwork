#!/bin/bash

# Add all required environment variables to Vercel
echo "Adding environment variables to Vercel..."

# Firebase Configuration
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "<YOUR_FIREBASE_API_KEY>"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< "pocket-portfolio-67fa6.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< "pocket-portfolio-67fa6"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< "pocket-portfolio-67fa6.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< "862430760996"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< "1:862430760996:web:b1af05bdc347d5a65788b1"
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production <<< "G-9FQ2NBHY7H"

# Google Analytics
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production <<< "G-9FQ2NBHY7H"

# API Configuration
vercel env add NEXT_PUBLIC_API_BASE_URL production <<< "https://api.pocketportfolio.app"
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://www.pocketportfolio.app"

# Development Settings
vercel env add NODE_ENV production <<< "production"
vercel env add DISABLE_YAHOO_QUOTE production <<< "0"

# Rate Limiting
vercel env add RATE_LIMIT_WINDOW_MS production <<< "60000"
vercel env add RATE_LIMIT_MAX_PER_MIN production <<< "1000"

# Waitlist Configuration
vercel env add NEXT_PUBLIC_ENABLE_WAITLIST production <<< "true"
vercel env add WAITLIST_DOUBLE_OPT_IN production <<< "false"
vercel env add ENCRYPTION_SECRET production <<< "your-encryption-secret-here"
vercel env add MAIL_FROM production <<< "noreply@pocketportfolio.app"
vercel env add MAIL_PROVIDER production <<< "sendgrid"
vercel env add NEXT_PUBLIC_BRAND_V2 production <<< "true"
vercel env add NEXT_PUBLIC_BRAND_DEFAULT_THEME production <<< "system"

echo "Environment variables added successfully!"
