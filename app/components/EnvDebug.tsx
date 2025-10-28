'use client';

import { useEffect } from 'react';

export default function EnvDebug() {
  useEffect(() => {
    console.log('🔍 Environment Variables Debug:');
    console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
    console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
    console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);
    console.log('NEXT_PUBLIC_GA_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    
    // Check if they have newlines
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      console.log('API Key length:', apiKey.length);
      console.log('API Key includes newlines:', apiKey.includes('\n') || apiKey.includes('\r'));
      console.log('API Key cleaned:', apiKey.trim().replace(/[\r\n]+$/, ''));
    }
  }, []);

  return null; // This component doesn't render anything
}
