import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface WaitlistData {
  email: string;
  name?: string;
  region?: string;
  role?: string;
  source: 'web:join' | 'web:footer' | 'web:header';
  userAgent?: string;
}

export async function saveToWaitlist(data: WaitlistData): Promise<{ success: boolean; message: string; duplicate?: boolean; id?: string }> {
  try {
    // Skip duplicate checking for now - we'll handle this server-side later
    // or implement a different approach that doesn't require read permissions
    
    // Add to Firestore with simpler structure that matches existing rules
    const waitlistRef = collection(db, 'waitlist');
    const docRef = await addDoc(waitlistRef, {
      email: data.email.toLowerCase().trim(),
      name: data.name || '',
      region: data.region || '',
      role: data.role || '',
      source: data.source,
      userAgent: data.userAgent || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Waitlist submission saved to Firestore:', {
      id: docRef.id,
      email: data.email,
      name: data.name,
      region: data.region,
      role: data.role,
      source: data.source,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'Successfully joined the waitlist!',
      duplicate: false,
      id: docRef.id
    };
    
  } catch (error) {
    console.error('Error saving to waitlist:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.'
    };
  }
}
