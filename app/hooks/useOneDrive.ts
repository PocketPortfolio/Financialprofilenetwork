/**
 * React hook for OneDrive Sovereign Sync (paid seats only — gate in UI).
 * Second OAuth plane via MSAL; Firebase identity is separate.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  oneDriveService,
  ONEDRIVE_PORTFOLIO_FILE_NAME,
  ONEDRIVE_CONNECT_PENDING_KEY,
} from '../lib/onedrive/oneDriveService';
import type { OneDriveSyncState, PortfolioData } from '../lib/onedrive/types';
import {
  exportLocalPortfolio,
  loadLocalTrades,
  saveLocalTrades,
  loadPortfolioNotes,
  notifyPortfolioNotesChanged,
  savePortfolioNotes,
} from '../lib/store/localPortfolioStore';
import { mergePortfolioNotes, parsePortfolioNotes } from '../lib/portfolio/schema';
import { generateExcelFromPortfolio } from '../lib/google-drive/excelExport';
import type { Trade } from '../services/tradeService';
import { TradeService } from '../services/tradeService';
import { auth } from '../lib/firebase';
import {
  clearActiveSyncCloudIf,
  onActiveSyncCloudChange,
  requestExclusiveSyncCloud,
} from '../lib/sync/sovereignSyncProvider';

const FILE_ID_KEY = 'onedrive_file_id';
const EXCEL_ID_KEY = 'onedrive_excel_file_id';
const ETAG_KEY = 'onedrive_local_etag';
const DELTA_KEY = 'onedrive_delta_link';
const FOLDER_URL_KEY = 'onedrive_folder_web_url';
const FOLDER_NAME_KEY = 'onedrive_folder_name';
const POLL_VISIBLE_MS = 30000;
const POLL_HIDDEN_SKIP = true;
const SYNC_DEBOUNCE_MS = 1000;
const PULL_SUPPRESS_PUSH_MS = 30000;

/** Prefer explicit trades → Firebase (signed-in) → localStorage. Never push demo localStorage over live Firebase. */
async function resolveTradesForOneDriveSync(provided?: Trade[]): Promise<Trade[]> {
  if (provided !== undefined) return provided;
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      return await TradeService.getTrades(uid, false);
    }
  } catch (e) {
    console.warn('OneDrive: Firebase trades unavailable, falling back to localStorage', e);
  }
  return loadLocalTrades();
}

function tradeSyncFingerprint(trades: Trade[]): string {
  return JSON.stringify(
    [...trades]
      .map((t) => ({
        id: t.id,
        ticker: t.ticker,
        qty: t.qty,
        price: t.price,
        type: t.type,
        date: t.date,
      }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
  );
}

/** Only one restore/reconcile across many useOneDrive() mounts. */
let oneDriveRestoreInFlight: Promise<void> | null = null;
let lastOneDrivePullAt = 0;
/** ETag of last successful app write — skip pull when delta is our own push. */
let lastWrittenEtag: string | null = null;
let pullInFlight = false;
let pushInFlight = false;

/** Single shared poller — many components mount useOneDrive(). */
let modulePollTimer: ReturnType<typeof setInterval> | null = null;
let modulePollRefCount = 0;
let moduleDeltaCheck: (() => void) | null = null;

export function recentlySyncedFromOneDrive(): boolean {
  return Date.now() - lastOneDrivePullAt < PULL_SUPPRESS_PUSH_MS;
}

/**
 * Apply remote portfolio JSON: localStorage always; Firebase when signed in
 * (dashboard reads Firebase for auth users — localStorage-only pull never updates the UI).
 */
async function applyRemoteTradesToStores(trades: Trade[]): Promise<void> {
  saveLocalTrades(trades);
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const existing = await TradeService.getTrades(uid, true);
  const existingMap = new Map(existing.map((t) => [t.id, t]));
  const remoteIds = new Set(trades.map((t) => t.id).filter(Boolean));

  for (const t of existing) {
    if (!remoteIds.has(t.id)) {
      try {
        await TradeService.deleteTrade(uid, t.id, t.uid);
      } catch (e) {
        console.warn('OneDrive pull: delete trade failed', t.id, e);
      }
    }
  }

  const toCreate: Trade[] = [];
  for (const t of trades) {
    if (t.id && existingMap.has(t.id)) {
      const prev = existingMap.get(t.id)!;
      try {
        await TradeService.updateTrade(
          uid,
          t.id,
          {
            ticker: t.ticker,
            qty: t.qty,
            price: t.price,
            date: t.date,
            type: t.type,
            currency: t.currency,
            mock: t.mock,
          },
          prev.uid
        );
      } catch (e) {
        console.warn('OneDrive pull: update trade failed', t.id, e);
      }
    } else {
      toCreate.push(t);
    }
  }
  if (toCreate.length > 0) {
    await TradeService.importTrades(uid, toCreate);
  }
}

const initialState: OneDriveSyncState = {
  isConnected: false,
  isSyncing: false,
  lastSyncTime: null,
  localEtag: null,
  remoteEtag: null,
  fileId: null,
  excelFileId: null,
  folderName: null,
  folderWebUrl: null,
  jsonFileMetadata: null,
  excelFileMetadata: null,
  error: null,
  conflictDetected: false,
  conflictData: null,
  deltaLink: null,
};

export function useOneDrive() {
  const [syncState, setSyncState] = useState<OneDriveSyncState>(initialState);
  const syncStateRef = useRef(syncState);
  const initializedRef = useRef(false);

  useEffect(() => {
    syncStateRef.current = syncState;
  }, [syncState]);

  const stopPolling = useCallback(() => {
    modulePollRefCount = Math.max(0, modulePollRefCount - 1);
    if (modulePollRefCount === 0 && modulePollTimer) {
      clearInterval(modulePollTimer);
      modulePollTimer = null;
    }
  }, []);

  const applyRemotePortfolio = useCallback(async (data: PortfolioData) => {
    const trades = (data.trades || []) as Trade[];
    await applyRemoteTradesToStores(trades);
    if (data.notes !== undefined) {
      const parsed = parsePortfolioNotes(data.notes);
      savePortfolioNotes(mergePortfolioNotes(loadPortfolioNotes(), parsed));
      notifyPortfolioNotesChanged({ source: 'onedrive-pull' });
    }
  }, []);

  const syncFromOneDrive = useCallback(
    async (fileId?: string): Promise<void> => {
      const id = fileId || syncStateRef.current.fileId;
      if (!id) return;
      if (pullInFlight) return;
      pullInFlight = true;

      setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
      try {
        const data = await oneDriveService.downloadPortfolioFile(id);
        await applyRemotePortfolio(data);
        const meta = await oneDriveService.getFileMetadata(id);
        if (meta.eTag) {
          localStorage.setItem(ETAG_KEY, meta.eTag);
          lastWrittenEtag = meta.eTag;
        }
        lastOneDrivePullAt = Date.now();
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: meta.lastModifiedDateTime,
          localEtag: meta.eTag || null,
          remoteEtag: meta.eTag || null,
          jsonFileMetadata: meta,
          conflictDetected: false,
          conflictData: null,
        }));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('onedrive-sync-complete', {
              detail: { tradeCount: (data.trades || []).length },
            })
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Pull from OneDrive failed';
        setSyncState((prev) => ({ ...prev, isSyncing: false, error: message }));
        throw error;
      } finally {
        pullInFlight = false;
      }
    },
    [applyRemotePortfolio]
  );

  const syncToOneDrive = useCallback(
    async (fileId?: string, trades?: Trade[], syncExcel = true): Promise<void> => {
      const id = fileId || syncStateRef.current.fileId;
      if (!id) return;
      if (pullInFlight || pushInFlight) return;
      if (recentlySyncedFromOneDrive()) {
        return;
      }

      pushInFlight = true;
      setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
      try {
        const resolved = await resolveTradesForOneDriveSync(trades);
        const portfolioData = exportLocalPortfolio(resolved).data;
        const etag =
          lastWrittenEtag ||
          syncStateRef.current.localEtag ||
          localStorage.getItem(ETAG_KEY);
        const meta = await oneDriveService.updatePortfolioFile(id, portfolioData, etag);
        if (meta.eTag) {
          localStorage.setItem(ETAG_KEY, meta.eTag);
          lastWrittenEtag = meta.eTag;
        }

        let excelFileId = syncStateRef.current.excelFileId || localStorage.getItem(EXCEL_ID_KEY);
        let excelMeta = null;
        if (syncExcel) {
          try {
            const blob = generateExcelFromPortfolio(portfolioData);
            excelMeta = await oneDriveService.uploadExcelFile(excelFileId, blob);
            excelFileId = excelMeta.id;
            localStorage.setItem(EXCEL_ID_KEY, excelMeta.id);
          } catch (e) {
            console.warn('OneDrive Excel sync non-critical:', e);
          }
        }

        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: meta.lastModifiedDateTime,
          localEtag: meta.eTag || null,
          remoteEtag: meta.eTag || null,
          jsonFileMetadata: meta,
          excelFileId: excelFileId || null,
          excelFileMetadata: excelMeta || prev.excelFileMetadata,
          conflictDetected: false,
          conflictData: null,
        }));
        try {
          localStorage.setItem('onedrive_last_push_at', String(Date.now()));
        } catch {
          /* ignore */
        }
      } catch (error: any) {
        if (error?.code === 'CONFLICT' || error?.status === 412) {
          const remote = await oneDriveService.getFileMetadata(id);
          setSyncState((prev) => ({
            ...prev,
            isSyncing: false,
            conflictDetected: true,
            conflictData: {
              localEtag: prev.localEtag || '',
              remoteEtag: remote.eTag || '',
            },
            remoteEtag: remote.eTag || null,
            error: 'Conflict: OneDrive file changed. Pull before pushing.',
          }));
          return;
        }
        const message = error instanceof Error ? error.message : 'Push to OneDrive failed';
        setSyncState((prev) => ({ ...prev, isSyncing: false, error: message }));
        throw error;
      } finally {
        pushInFlight = false;
      }
    },
    []
  );

  const runDeltaCheck = useCallback(async () => {
    const state = syncStateRef.current;
    if (!state.isConnected || !state.fileId || state.isSyncing || state.conflictDetected) return;
    if (pullInFlight || pushInFlight) return;
    if (POLL_HIDDEN_SKIP && typeof document !== 'undefined' && document.hidden) return;

    try {
      // Always prefer localStorage — per-instance state.deltaLink goes stale across mounts
      const storedDelta = localStorage.getItem(DELTA_KEY);
      const { changed, deltaLink } = await oneDriveService.pollDelta(storedDelta);
      if (deltaLink) {
        localStorage.setItem(DELTA_KEY, deltaLink);
        setSyncState((prev) => ({ ...prev, deltaLink }));
      }
      const cachedEtag = lastWrittenEtag || localStorage.getItem(ETAG_KEY) || state.localEtag;
      if (!changed) return;

      const meta = await oneDriveService.getFileMetadata(state.fileId);
      // Our own push/excel upload — advance delta only, do not pull-write-back
      if (meta.eTag && cachedEtag && meta.eTag === cachedEtag) {
        return;
      }
      await syncFromOneDrive(state.fileId);
    } catch (error) {
      console.warn('OneDrive delta poll:', error);
    }
  }, [syncFromOneDrive]);

  const startPolling = useCallback(() => {
    moduleDeltaCheck = () => {
      void runDeltaCheck();
    };
    modulePollRefCount += 1;
    if (!modulePollTimer) {
      modulePollTimer = setInterval(() => {
        moduleDeltaCheck?.();
      }, POLL_VISIBLE_MS);
      // Immediate check once so Pull isn't waiting 30s after connect
      void runDeltaCheck();
    }
  }, [runDeltaCheck]);

  const disconnect = useCallback(async (): Promise<void> => {
    stopPolling();
    await oneDriveService.revokeAccess();
    localStorage.removeItem(FILE_ID_KEY);
    localStorage.removeItem(EXCEL_ID_KEY);
    localStorage.removeItem(ETAG_KEY);
    localStorage.removeItem(DELTA_KEY);
    localStorage.removeItem(FOLDER_URL_KEY);
    localStorage.removeItem(FOLDER_NAME_KEY);
    clearActiveSyncCloudIf('microsoft');
    setSyncState({ ...initialState });
  }, [stopPolling]);

  const connect = useCallback(
    async (trades?: Trade[], syncExcel = true): Promise<void> => {
      if (!oneDriveService.isConfigured()) {
        throw new Error(
          'OneDrive is not configured. Set NEXT_PUBLIC_MICROSOFT_CLIENT_ID (Platform Phase 0).'
        );
      }

      setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
      try {
        requestExclusiveSyncCloud('microsoft');
        try {
          // Preference only — pending flag is set when redirect actually starts
          sessionStorage.setItem(
            ONEDRIVE_CONNECT_PENDING_KEY,
            JSON.stringify({ syncExcel: !!syncExcel })
          );
        } catch {
          /* ignore */
        }
        await oneDriveService.requestAccess({ interactive: true });
        // Consent done in this window — clear pending
        try {
          sessionStorage.removeItem(ONEDRIVE_CONNECT_PENDING_KEY);
        } catch {
          /* ignore */
        }
        const resolvedTrades = await resolveTradesForOneDriveSync(trades);
        const folder = await oneDriveService.ensureAppFolder();

        let file = await oneDriveService.findPortfolioFile();
        if (!file) {
          const portfolioData = exportLocalPortfolio(resolvedTrades).data;
          file = await oneDriveService.createPortfolioFile(portfolioData);
        } else {
          const localData = exportLocalPortfolio(resolvedTrades).data;
          const driveTime = new Date(file.lastModifiedDateTime).getTime();
          const localTime = new Date(localData.metadata.lastUpdated).getTime();
          if (driveTime > localTime) {
            await applyRemotePortfolio(await oneDriveService.downloadPortfolioFile(file.id));
          } else {
            file = await oneDriveService.updatePortfolioFile(file.id, localData, file.eTag);
          }
        }

        let excelFile: typeof file | null = null;
        if (syncExcel) {
          try {
            const portfolioData = exportLocalPortfolio(resolvedTrades).data;
            const blob = generateExcelFromPortfolio(portfolioData);
            const existingExcelId = localStorage.getItem(EXCEL_ID_KEY);
            excelFile = await oneDriveService.uploadExcelFile(existingExcelId, blob);
            localStorage.setItem(EXCEL_ID_KEY, excelFile.id);
          } catch (e) {
            console.warn('OneDrive Excel sync non-critical:', e);
          }
        }

        localStorage.setItem(FILE_ID_KEY, file.id);
        if (file.eTag) {
          localStorage.setItem(ETAG_KEY, file.eTag);
          lastWrittenEtag = file.eTag;
        }
        if (folder.webUrl) localStorage.setItem(FOLDER_URL_KEY, folder.webUrl);
        if (folder.name) localStorage.setItem(FOLDER_NAME_KEY, folder.name);

        const { deltaLink } = await oneDriveService.pollDelta(null);
        if (deltaLink) localStorage.setItem(DELTA_KEY, deltaLink);
        try {
          localStorage.setItem('onedrive_last_push_at', String(Date.now()));
        } catch {
          /* ignore */
        }

        setSyncState({
          isConnected: true,
          isSyncing: false,
          lastSyncTime: file.lastModifiedDateTime,
          localEtag: file.eTag || null,
          remoteEtag: file.eTag || null,
          fileId: file.id,
          excelFileId: excelFile?.id || null,
          folderName: folder.name || 'Pocket Portfolio',
          folderWebUrl: folder.webUrl || null,
          jsonFileMetadata: file,
          excelFileMetadata: excelFile,
          error: null,
          conflictDetected: false,
          conflictData: null,
          deltaLink,
        });

        startPolling();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to connect to OneDrive';
        // Full-page MSAL redirect in progress — keep pending flag
        if (message.includes('Redirecting to Microsoft')) {
          setSyncState((prev) => ({ ...prev, isSyncing: false, error: null }));
          throw error;
        }
        // Keep pending if we hit a lock — user can retry Connect after locks clear
        if (!message.includes('interaction_in_progress')) {
          try {
            sessionStorage.removeItem(ONEDRIVE_CONNECT_PENDING_KEY);
          } catch {
            /* ignore */
          }
        }
        setSyncState((prev) => ({ ...prev, isSyncing: false, error: message }));
        throw error;
      }
    },
    [applyRemotePortfolio, startPolling]
  );

  // Init: resume post-redirect connect, or restore existing session
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        await oneDriveService.initialize();

        let pending: { syncExcel?: boolean } | null = null;
        try {
          const raw = sessionStorage.getItem(ONEDRIVE_CONNECT_PENDING_KEY);
          if (raw) pending = JSON.parse(raw) as { syncExcel?: boolean };
        } catch {
          /* ignore */
        }

        if (pending) {
          try {
            // interactive:false — never start another Microsoft redirect from resume
            await oneDriveService.requestAccess({ interactive: false });
            try {
              sessionStorage.removeItem(ONEDRIVE_CONNECT_PENDING_KEY);
            } catch {
              /* ignore */
            }
            // Must use Firebase trades when signed in — loadLocalTrades() is often demo AAPL/MSFT/VOO
            const resumeTrades = await resolveTradesForOneDriveSync();
            await connect(resumeTrades, pending.syncExcel !== false);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            try {
              sessionStorage.removeItem(ONEDRIVE_CONNECT_PENDING_KEY);
            } catch {
              /* ignore */
            }
            if (!msg.includes('Redirecting to Microsoft')) {
              console.warn('OneDrive pending connect:', err);
              setSyncState((prev) => ({
                ...prev,
                isSyncing: false,
                error: msg,
              }));
            }
          }
          return;
        }

        const hasSession = await oneDriveService.hasSession();
        const fileId = localStorage.getItem(FILE_ID_KEY);
        if (!hasSession || !fileId) return;

        const token = await oneDriveService.getAccessToken();
        if (!token) return;

        const meta = await oneDriveService.getFileMetadata(fileId);
        const excelFileId = localStorage.getItem(EXCEL_ID_KEY);
        let excelMeta = null;
        if (excelFileId) {
          try {
            excelMeta = await oneDriveService.getFileMetadata(excelFileId);
          } catch {
            /* ignore */
          }
        }

        let folderName = localStorage.getItem(FOLDER_NAME_KEY) || 'Pocket Portfolio';
        let folderWebUrl = localStorage.getItem(FOLDER_URL_KEY);
        try {
          const folder = await oneDriveService.ensureAppFolder();
          if (folder.name) {
            folderName = folder.name;
            localStorage.setItem(FOLDER_NAME_KEY, folder.name);
          }
          if (folder.webUrl) {
            folderWebUrl = folder.webUrl;
            localStorage.setItem(FOLDER_URL_KEY, folder.webUrl);
          }
        } catch {
          /* keep cached folder link if Graph fails */
        }

        setSyncState((prev) => ({
          ...prev,
          isConnected: true,
          fileId,
          excelFileId,
          localEtag: meta.eTag || localStorage.getItem(ETAG_KEY),
          remoteEtag: meta.eTag || null,
          lastSyncTime: meta.lastModifiedDateTime,
          jsonFileMetadata: meta,
          excelFileMetadata: excelMeta,
          folderName,
          folderWebUrl,
          deltaLink: localStorage.getItem(DELTA_KEY),
        }));
        requestExclusiveSyncCloud('microsoft');
        startPolling();

        // Single reconcile across all useOneDrive mounts (avoids push storms)
        if (!oneDriveRestoreInFlight) {
          oneDriveRestoreInFlight = (async () => {
            try {
              const remote = await oneDriveService.downloadPortfolioFile(fileId);
              const localTrades = await resolveTradesForOneDriveSync();
              const remoteFp = tradeSyncFingerprint((remote.trades || []) as Trade[]);
              const localFp = tradeSyncFingerprint(localTrades);
              const remoteMod = new Date(
                (remote.metadata as { lastUpdated?: string } | undefined)?.lastUpdated ||
                  meta.lastModifiedDateTime
              ).getTime();
              let lastPush = 0;
              try {
                lastPush = Number(localStorage.getItem('onedrive_last_push_at') || '0');
              } catch {
                /* ignore */
              }
              const remoteNewer = remoteMod > lastPush + 2000;
              if (remoteFp === localFp) return;
              if (remoteNewer) {
                await syncFromOneDrive(fileId);
              } else {
                await syncToOneDrive(fileId, localTrades);
              }
            } catch (reconcileErr) {
              console.warn('OneDrive restore reconcile:', reconcileErr);
            }
          })();
        }
      } catch (error) {
        console.warn('OneDrive restore:', error);
      }
    })();

    return () => stopPolling();
  }, [connect, startPolling, stopPolling, syncToOneDrive, syncFromOneDrive]);

  // Auto-push when notes change (trades are pushed from dashboard with Firebase list)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const onNotesChanged = (e: Event) => {
      const source = (e as CustomEvent<{ source?: string }>).detail?.source ?? 'user';
      if (source === 'onedrive-pull' || source === 'drive-pull' || source === 'tab-sync') return;
      const state = syncStateRef.current;
      if (!state.isConnected || !state.fileId) return;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const s = syncStateRef.current;
        if (!s.isConnected || !s.fileId || s.isSyncing || s.conflictDetected) return;
        void syncToOneDrive(s.fileId).catch((err) =>
          console.error('Notes-triggered OneDrive sync failed:', err)
        );
      }, SYNC_DEBOUNCE_MS);
    };
    window.addEventListener('portfolio-notes-changed', onNotesChanged);
    return () => {
      window.removeEventListener('portfolio-notes-changed', onNotesChanged);
      if (timeout) clearTimeout(timeout);
    };
  }, [syncToOneDrive]);

  // Peer exclusivity: Drive claimed → drop OneDrive
  useEffect(() => {
    return onActiveSyncCloudChange((cloud) => {
      if (cloud === 'google' && syncStateRef.current.isConnected) {
        void disconnect();
      }
    });
  }, [disconnect]);

  return {
    syncState,
    connect,
    disconnect,
    syncToOneDrive,
    syncFromOneDrive,
    portfolioFileName: ONEDRIVE_PORTFOLIO_FILE_NAME,
    isConfigured: oneDriveService.isConfigured(),
  };
}
