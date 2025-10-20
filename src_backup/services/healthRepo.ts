import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ProviderHealth } from './api';
import { db } from './firebase';

// Schema: collection('providerHealth'), each doc:
// { ts: serverTimestamp, providers: ProviderHealth[] }
export async function writeHealthSnapshot(providers: ProviderHealth[]) {
  try {
    await addDoc(collection(db, 'providerHealth'), {
      ts: serverTimestamp(),
      providers
    });
  } catch (e) {
    // swallow for now; optional persistence
    console.error('writeHealthSnapshot failed', e);
  }
}
