#!/bin/bash

# Pocket Portfolio - Vercel Environment Variables Setup Script
# This script sets all Firebase environment variables in Vercel production

echo "🔥 Setting Firebase environment variables in Vercel production..."
echo ""

# Set each environment variable
echo "Setting NEXT_PUBLIC_FIREBASE_API_KEY..."
echo "AIzaSyDIL02q3thafHYAEziJVRlr4ibst5dqvRo" | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production

echo "Setting NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN..."
echo "pocket-portfolio-67fa6.firebaseapp.com" | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production

echo "Setting NEXT_PUBLIC_FIREBASE_PROJECT_ID..."
echo "pocket-portfolio-67fa6" | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production

echo "Setting NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET..."
echo "pocket-portfolio-67fa6.firebasestorage.app" | vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production

echo "Setting NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID..."
echo "862430760996" | vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production

echo "Setting NEXT_PUBLIC_FIREBASE_APP_ID..."
echo "1:862430760996:web:b1af05bdc347d5a65788b1" | vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

echo "Setting NEXT_PUBLIC_GA_MEASUREMENT_ID..."
echo "G-9FQ2NBHY7H" | vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production

echo ""
echo "✅ All environment variables set!"
echo ""
echo "📦 Now triggering production deployment..."
vercel --prod

echo ""
echo "🎉 Done! Check https://www.pocketportfolio.app in 2-3 minutes"
echo "💡 Open browser console and look for: '✅ Firebase config loaded successfully'"

