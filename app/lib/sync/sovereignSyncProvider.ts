/**
 * Single active Sovereign Sync cloud (Drive XOR OneDrive).
 * Connect of one cloud notifies the other to disconnect auto-sync.
 */

export type SovereignSyncCloud = 'google' | 'microsoft';

const STORAGE_KEY = 'sovereign_sync_active_cloud';

type Listener = (cloud: SovereignSyncCloud | null) => void;

const listeners = new Set<Listener>();

export function getActiveSyncCloud(): SovereignSyncCloud | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'google' || v === 'microsoft') return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function setActiveSyncCloud(cloud: SovereignSyncCloud | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (cloud) localStorage.setItem(STORAGE_KEY, cloud);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => {
    try {
      fn(cloud);
    } catch {
      /* ignore */
    }
  });
}

/** Claim exclusive auto-sync for this cloud; peers must disconnect. */
export function requestExclusiveSyncCloud(cloud: SovereignSyncCloud): void {
  setActiveSyncCloud(cloud);
}

export function clearActiveSyncCloudIf(cloud: SovereignSyncCloud): void {
  if (getActiveSyncCloud() === cloud) setActiveSyncCloud(null);
}

export function onActiveSyncCloudChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
