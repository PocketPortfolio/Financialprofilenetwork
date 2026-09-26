/**
 * OneDrive Sovereign Sync — browser-only Graph client.
 * Scope: Files.ReadWrite.AppFolder. Tokens stay in MSAL sessionStorage.
 * No server proxy. No refresh token on our infrastructure.
 */

'use client';

import {
  PublicClientApplication,
  NavigationClient,
  type Configuration,
  type NavigationOptions,
} from '@azure/msal-browser';
import type { OneDriveFileMetadata, PortfolioData } from './types';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const PORTFOLIO_FILE_NAME = 'pocket_portfolio_db.json';
const EXCEL_FILE_NAME = 'pocket_view.xlsx';

/** App-folder only — standing consent limited to Apps/Pocket Portfolio. */
export const ONEDRIVE_SCOPES = ['Files.ReadWrite.AppFolder', 'User.Read'] as const;

const CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '';

/** Set only before acquireTokenRedirect — popup returns must not consume #code=. */
export const MSAL_EXPECT_REDIRECT_KEY = 'pp-msal-expect-redirect';
/** Set before OneDrive redirect so /settings can finish folder/file setup after return. */
export const ONEDRIVE_CONNECT_PENDING_KEY = 'pp-onedrive-connect-pending';

/**
 * Azure SPA redirect must match EXACTLY and must be the same origin the user
 * is browsing. Pocket canonical host is www (apex 301 → www); baking apex
 * breaks PKCE because sessionStorage is origin-scoped.
 */
export function resolveMsalRedirectUri(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Prefer live origin so www vs localhost always matches sessionStorage.
    const origin = window.location.origin;
    const fromEnv = (process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || '').trim();
    // Only honour env when it matches this origin (optional forwarder path OK).
    if (fromEnv) {
      try {
        const u = new URL(fromEnv, origin);
        if (u.origin === origin) {
          if (u.pathname.includes('onedrive-auth.html')) {
            return `${u.origin}${u.pathname}`.replace(/\/$/, '');
          }
          return u.origin;
        }
      } catch {
        /* ignore mismatched env */
      }
    }
    return origin;
  }
  const fromEnv = (process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || '').trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through */
    }
  }
  return 'https://www.pocketportfolio.app';
}

let msalInstance: PublicClientApplication | null = null;
let msalInitPromise: Promise<PublicClientApplication> | null = null;
/** Prevents Strict Mode / double-click from starting two redirects (corrupts MSAL state). */
let redirectInFlight = false;
/** Only one handleRedirectPromise at a time (Strict Mode double-mount). */
let handleRedirectInFlight: Promise<string | null> | null = null;

/**
 * MSAL was navigating to /settings mid-handleRedirectPromise (hash cleared, no token).
 * Block internal navigations; allow external (login.microsoftonline.com).
 */
class StayPutNavigationClient extends NavigationClient {
  async navigateInternal(_url: string, _options: NavigationOptions): Promise<boolean> {
    return false;
  }
}

function getMsalConfig(): Configuration {
  if (typeof window === 'undefined') {
    throw new Error('MSAL is browser-only');
  }
  if (!CLIENT_ID) {
    throw new Error(
      'NEXT_PUBLIC_MICROSOFT_CLIENT_ID is missing. Add the Azure public client ID and restart the app.'
    );
  }
  const redirectUri = resolveMsalRedirectUri();
  return {
    auth: {
      clientId: CLIENT_ID,
      authority: 'https://login.microsoftonline.com/common',
      redirectUri,
    },
    cache: {
      // Same-tab redirect: sessionStorage is enough and avoids stale localStorage from prior attempts
      cacheLocation: 'sessionStorage',
    },
  };
}

/**
 * True when this window is an MSAL popup return (auth response in URL, no redirect flag).
 * login.live.com severs window.opener, so opener checks alone are insufficient.
 */
export function hasMsalAuthResponse(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hash || '';
  const s = window.location.search || '';
  return (
    h.includes('code=') ||
    h.includes('error=') ||
    s.includes('code=') ||
    s.includes('error=')
  );
}

export function isMsalPopupHashReturn(): boolean {
  if (!hasMsalAuthResponse()) return false;
  try {
    if (sessionStorage.getItem(MSAL_EXPECT_REDIRECT_KEY) === '1') return false;
  } catch {
    /* ignore */
  }
  return true;
}

async function getMsal(): Promise<PublicClientApplication> {
  if (msalInstance) return msalInstance;
  if (msalInitPromise) return msalInitPromise;
  msalInitPromise = (async () => {
    const pca = new PublicClientApplication(getMsalConfig());
    pca.setNavigationClient(new StayPutNavigationClient());
    await pca.initialize();
    msalInstance = pca;
    return pca;
  })();
  return msalInitPromise;
}

function markExpectRedirect() {
  try {
    sessionStorage.setItem(MSAL_EXPECT_REDIRECT_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearExpectRedirect() {
  try {
    sessionStorage.removeItem(MSAL_EXPECT_REDIRECT_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear only interaction.status locks (both storages). Do not touch PKCE request params. */
function clearMsalInteractionLocks(): void {
  if (typeof window === 'undefined') return;
  for (const store of [sessionStorage, localStorage]) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && key.includes('interaction.status')) keys.push(key);
      }
      keys.forEach((k) => store.removeItem(k));
    } catch {
      /* ignore */
    }
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class OneDriveService {
  private accessToken: string | null = null;

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!CLIENT_ID) {
      console.warn('OneDrive sync unavailable: NEXT_PUBLIC_MICROSOFT_CLIENT_ID missing');
      return;
    }
    // Popup return to SPA origin: parent MSAL owns #code= — do not init here.
    if (isMsalPopupHashReturn()) return;
    await getMsal();
  }

  isConfigured(): boolean {
    return Boolean(CLIENT_ID);
  }

  /**
   * Interactive consent for Files.ReadWrite.AppFolder (second plane — not Firebase login).
   * Full-page redirect only (popup COOP-broken after login.live.com).
   * @param interactive When false (post-redirect resume), never start a new redirect.
   */
  async requestAccess(options?: { interactive?: boolean }): Promise<string> {
    const interactive = options?.interactive !== false;
    const pca = await getMsal();
    const redirectUri = resolveMsalRedirectUri();
    const loginRequest = {
      scopes: [...ONEDRIVE_SCOPES],
      prompt: 'select_account' as const,
      redirectUri,
    };
    const authResponse = hasMsalAuthResponse();

    try {
      const expect =
        typeof window !== 'undefined' &&
        sessionStorage.getItem(MSAL_EXPECT_REDIRECT_KEY) === '1';

      // Already leaving for Microsoft — second call must not clear state / start again
      if (
        interactive &&
        !authResponse &&
        (redirectInFlight ||
          (typeof window !== 'undefined' &&
            sessionStorage.getItem(MSAL_EXPECT_REDIRECT_KEY) === '1'))
      ) {
        throw new Error('Redirecting to Microsoft to connect OneDrive…');
      }

      // Complete redirect whenever the URL carries an auth response (hash or query).
      // MSAL v5: navigateToLoginRequestUrl defaults TRUE on handleRedirectPromise options
      // (auth config key was removed). If true, MSAL caches #code and navigates to ORIGIN_URI
      // (/settings) before exchanging — then our URL-hash gate never runs again → no token.
      if (authResponse) {
        if (!handleRedirectInFlight) {
          handleRedirectInFlight = (async () => {
            try {
              const redirected = await pca.handleRedirectPromise({
                navigateToLoginRequestUrl: false,
              });
              clearExpectRedirect();
              const accountsAfter = pca.getAllAccounts();
              if (redirected?.accessToken) {
                this.accessToken = redirected.accessToken;
                return redirected.accessToken;
              }
              if (accountsAfter.length > 0) {
                const silent = await pca.acquireTokenSilent({
                  account: accountsAfter[0],
                  scopes: [...ONEDRIVE_SCOPES],
                  redirectUri,
                });
                this.accessToken = silent.accessToken;
                return silent.accessToken;
              }
              return null;
            } catch (redirErr: any) {
              clearExpectRedirect();
              const redirMsg =
                redirErr instanceof Error ? redirErr.message : String(redirErr);
              if (redirMsg.includes('no_token_request_cache_error')) {
                return null;
              }
              throw redirErr;
            } finally {
              handleRedirectInFlight = null;
            }
          })();
        }
        const token = await handleRedirectInFlight;
        if (token) return token;
      } else if (expect) {
        clearExpectRedirect();
      }

      const accounts = pca.getAllAccounts();
      if (accounts.length > 0) {
        try {
          const silent = await pca.acquireTokenSilent({
            account: accounts[0],
            scopes: [...ONEDRIVE_SCOPES],
            redirectUri,
          });
          this.accessToken = silent.accessToken;
          return silent.accessToken;
        } catch {
          /* need interactive */
        }
      }

      // Post-redirect resume: do not start another Microsoft trip
      if (!interactive) {
        throw new Error(
          'OneDrive sign-in did not finish. Click Connect OneDrive once more.'
        );
      }

      const startRedirect = async () => {
        if (redirectInFlight) {
          throw new Error('Redirecting to Microsoft to connect OneDrive…');
        }
        redirectInFlight = true;
        clearMsalInteractionLocks();
        markExpectRedirect();
        try {
          if (!sessionStorage.getItem(ONEDRIVE_CONNECT_PENDING_KEY)) {
            sessionStorage.setItem(
              ONEDRIVE_CONNECT_PENDING_KEY,
              JSON.stringify({ syncExcel: true })
            );
          }
        } catch {
          /* ignore */
        }
        try {
          await pca.acquireTokenRedirect({
            ...loginRequest,
            redirectUri,
          });
        } catch (e) {
          redirectInFlight = false;
          throw e;
        }
        throw new Error('Redirecting to Microsoft to connect OneDrive…');
      };

      try {
        await startRedirect();
      } catch (redirStartErr: any) {
        const code = redirStartErr?.errorCode || '';
        const msg =
          redirStartErr instanceof Error ? redirStartErr.message : String(redirStartErr);
        if (msg.includes('Redirecting to Microsoft')) {
          throw redirStartErr;
        }
        if (
          code === 'interaction_in_progress' ||
          msg.includes('interaction_in_progress')
        ) {
          clearExpectRedirect();
          clearMsalInteractionLocks();
          try {
            await pca.clearCache();
          } catch {
            /* ignore */
          }
          await sleep(50);
          await startRedirect();
        }
        throw redirStartErr;
      }
      throw new Error('Redirecting to Microsoft to connect OneDrive…');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('Redirecting to Microsoft')) throw err;
      clearExpectRedirect();
      throw new Error(message || 'OneDrive consent failed');
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;
    try {
      const pca = await getMsal();
      const accounts = pca.getAllAccounts();
      if (!accounts.length) return null;
      const result = await pca.acquireTokenSilent({
        account: accounts[0],
        scopes: [...ONEDRIVE_SCOPES],
        redirectUri: resolveMsalRedirectUri(),
      });
      this.accessToken = result.accessToken;
      return result.accessToken;
    } catch {
      return null;
    }
  }

  hasCachedAccount(): boolean {
    if (typeof window === 'undefined' || !CLIENT_ID) return false;
    try {
      // Sync peek via sessionStorage key presence is brittle; after init use accounts.
      return false;
    } catch {
      return false;
    }
  }

  async hasSession(): Promise<boolean> {
    if (!CLIENT_ID) return false;
    try {
      const pca = await getMsal();
      return pca.getAllAccounts().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Clear MSAL session cache. Does not delete OneDrive files.
   */
  async revokeAccess(): Promise<void> {
    this.accessToken = null;
    try {
      const pca = await getMsal();
      await pca.clearCache();
    } catch (error) {
      console.warn('OneDrive MSAL cache clear:', error);
    }
  }

  private async graphFetch(
    path: string,
    init: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Not connected to OneDrive. Connect in Settings.');
    }

    const url = path.startsWith('http') ? path : `${GRAPH_BASE}${path}`;
    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && init.body && !(init.body instanceof Blob) && !(init.body instanceof ArrayBuffer)) {
      // leave as-is for binary uploads
    }

    const response = await fetch(url, { ...init, headers });

    if (response.status === 401 && retryCount < 1) {
      this.accessToken = null;
      await this.requestAccess();
      return this.graphFetch(path, init, retryCount + 1);
    }

    if (response.status === 429 && retryCount < 4) {
      const retryAfter = Number(response.headers.get('Retry-After') || '2');
      const delay = Math.min(Math.max(retryAfter, 1) * 1000 * Math.pow(2, retryCount), 30000);
      console.warn(`OneDrive throttled (429). Backing off ${delay}ms`);
      await sleep(delay);
      return this.graphFetch(path, init, retryCount + 1);
    }

    return response;
  }

  async ensureAppFolder(): Promise<{ id: string; name: string; webUrl?: string }> {
    const response = await this.graphFetch('/me/drive/special/approot');
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to open OneDrive app folder: ${text || response.statusText}`);
    }
    const data = await response.json();
    return {
      id: data.id,
      name: data.name || 'Apps/Pocket Portfolio',
      webUrl: data.webUrl,
    };
  }

  async findPortfolioFile(): Promise<OneDriveFileMetadata | null> {
    const response = await this.graphFetch(
      `/me/drive/special/approot/children?$filter=name eq '${PORTFOLIO_FILE_NAME}'&$select=id,name,lastModifiedDateTime,size,eTag,webUrl`
    );
    if (!response.ok) {
      // Filter may fail on some tenants — fall back to list
      return this.findPortfolioFileByList();
    }
    const data = await response.json();
    const file = data.value?.[0];
    if (!file) return null;
    return this.mapMeta(file);
  }

  private async findPortfolioFileByList(): Promise<OneDriveFileMetadata | null> {
    const response = await this.graphFetch(
      `/me/drive/special/approot/children?$select=id,name,lastModifiedDateTime,size,eTag,webUrl`
    );
    if (!response.ok) {
      throw new Error(`Failed to list OneDrive app folder: ${response.statusText}`);
    }
    const data = await response.json();
    const file = (data.value || []).find((f: { name: string }) => f.name === PORTFOLIO_FILE_NAME);
    return file ? this.mapMeta(file) : null;
  }

  private mapMeta(file: any): OneDriveFileMetadata {
    return {
      id: file.id,
      name: file.name,
      lastModifiedDateTime: file.lastModifiedDateTime,
      size: file.size,
      eTag: file.eTag || file.cTag,
      webUrl: file.webUrl,
    };
  }

  async getFileMetadata(fileId: string): Promise<OneDriveFileMetadata> {
    const response = await this.graphFetch(
      `/me/drive/items/${fileId}?$select=id,name,lastModifiedDateTime,size,eTag,cTag,webUrl`
    );
    if (!response.ok) {
      throw new Error(`Failed to get OneDrive file metadata: ${response.statusText}`);
    }
    return this.mapMeta(await response.json());
  }

  async createPortfolioFile(data: PortfolioData): Promise<OneDriveFileMetadata> {
    const body = JSON.stringify(data, null, 2);
    const response = await this.graphFetch(
      `/me/drive/special/approot:/${encodeURIComponent(PORTFOLIO_FILE_NAME)}:/content`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create OneDrive portfolio file: ${text || response.statusText}`);
    }
    return this.mapMeta(await response.json());
  }

  async updatePortfolioFile(
    fileId: string,
    data: PortfolioData,
    ifMatchEtag?: string | null
  ): Promise<OneDriveFileMetadata> {
    const body = JSON.stringify(data, null, 2);
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (ifMatchEtag) {
      headers['If-Match'] = ifMatchEtag;
    }

    const response = await this.graphFetch(`/me/drive/items/${fileId}/content`, {
      method: 'PUT',
      headers,
      body,
    });

    if (response.status === 412) {
      const conflict: any = new Error('SYNC_CONFLICT: File modified on OneDrive. Pull required.');
      conflict.code = 'CONFLICT';
      conflict.status = 412;
      throw conflict;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to update OneDrive portfolio file: ${text || response.statusText}`);
    }

    // PUT /content may return the item or empty — refresh metadata
    return this.getFileMetadata(fileId);
  }

  async downloadPortfolioFile(fileId: string): Promise<PortfolioData> {
    const response = await this.graphFetch(`/me/drive/items/${fileId}/content`);
    if (!response.ok) {
      throw new Error(`Failed to download OneDrive portfolio file: ${response.statusText}`);
    }
    return response.json();
  }

  async uploadExcelFile(
    existingId: string | null,
    blob: Blob
  ): Promise<OneDriveFileMetadata> {
    if (existingId) {
      const response = await this.graphFetch(`/me/drive/items/${existingId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: blob,
      });
      if (!response.ok) {
        throw new Error(`Failed to update Excel on OneDrive: ${response.statusText}`);
      }
      return this.getFileMetadata(existingId);
    }

    const response = await this.graphFetch(
      `/me/drive/special/approot:/${encodeURIComponent(EXCEL_FILE_NAME)}:/content`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: blob,
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to upload Excel to OneDrive: ${response.statusText}`);
    }
    return this.mapMeta(await response.json());
  }

  /**
   * Delta on app folder. Returns whether portfolio JSON changed + next deltaLink.
   */
  async pollDelta(deltaLink: string | null): Promise<{
    changed: boolean;
    deltaLink: string | null;
  }> {
    const path =
      deltaLink ||
      `${GRAPH_BASE}/me/drive/special/approot/delta?$select=id,name,lastModifiedDateTime,deleted,eTag`;

    let next: string | null = path;
    let changed = false;
    let finalLink: string | null = deltaLink;

    while (next) {
      const response = await this.graphFetch(next);
      if (!response.ok) {
        // Stale delta — reset
        if (response.status === 410) {
          return { changed: true, deltaLink: null };
        }
        throw new Error(`OneDrive delta failed: ${response.statusText}`);
      }
      const data = await response.json();
      for (const item of data.value || []) {
        if (item.name === PORTFOLIO_FILE_NAME || item.deleted) {
          changed = true;
        }
      }
      if (data['@odata.nextLink']) {
        next = data['@odata.nextLink'];
      } else {
        finalLink = data['@odata.deltaLink'] || null;
        next = null;
      }
    }

    return { changed, deltaLink: finalLink };
  }
}

export const oneDriveService = new OneDriveService();
export { PORTFOLIO_FILE_NAME as ONEDRIVE_PORTFOLIO_FILE_NAME, EXCEL_FILE_NAME as ONEDRIVE_EXCEL_FILE_NAME };
