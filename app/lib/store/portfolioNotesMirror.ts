/**
 * IndexedDB mirror for Decision Journal notes — second local layer without Google Drive.
 * Writes mirror on every save; read used at hydration when localStorage is empty.
 */

const DB_NAME = 'pocket-portfolio-sovereign-v1';
const STORE = 'kv';
const NOTES_KEY = 'portfolio-notes-json-v1';

function reqResult<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

/** Fire-and-forget mirror of raw JSON (same payload as localStorage value). */
export function mirrorPortfolioNotesJson(json: string): void {
  if (typeof indexedDB === 'undefined') return;
  void (async () => {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(json, NOTES_KEY);
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
        tx.onabort = () => rej(tx.error);
      });
      db.close();
    } catch (e) {
      console.warn('[portfolio notes mirror] IndexedDB write failed:', e);
    }
  })();
}

export async function readMirroredPortfolioNotesJson(): Promise<string | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, 'readonly');
    const raw = await reqResult<string | undefined>(tx.objectStore(STORE).get(NOTES_KEY));
    db.close();
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
  } catch (e) {
    console.warn('[portfolio notes mirror] IndexedDB read failed:', e);
    return null;
  }
}
