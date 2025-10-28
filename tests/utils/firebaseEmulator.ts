import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore, connectFirestoreEmulator,
  collection, getDocs, writeBatch, doc
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "pp-emulator",
  appId: "pp-emulator-app"
};

export function getTestApp() {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app);

  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);

  return { app, auth, db, functions };
}

export async function clearCollections(db: ReturnType<typeof getFirestore>) {
  const colls = ['trades', 'users', 'waitlist', 'telemetry'];
  for (const c of colls) {
    const snap = await getDocs(collection(db, c));
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function seedData(
  db: ReturnType<typeof getFirestore>,
  data: { trades?: any[]; users?: any[]; waitlist?: any[] }
) {
  const batch = writeBatch(db);
  data.trades?.forEach(t => batch.set(doc(db, 'trades', t.id), t));
  data.users?.forEach(u => batch.set(doc(db, 'users', u.uid), u));
  data.waitlist?.forEach(w => batch.set(doc(db, 'waitlist', w.id), w));
  await batch.commit();
}







