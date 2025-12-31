/**
 * Google Drive Service
 * Client-side service for interacting with Google Drive API
 * Uses Google Identity Services for OAuth and Drive API v3
 */

import type { DriveFileMetadata, PortfolioData, DriveSyncConfig } from './types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Google API credentials
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Validate API key on module load
if (typeof window !== 'undefined' && !API_KEY) {
  console.error('CRITICAL: NEXT_PUBLIC_GOOGLE_API_KEY is missing. Google Drive sync will not work.');
}

export class GoogleDriveService {
  private accessToken: string | null = null;
  private gapiLoaded = false;
  private gisLoaded = false;
  private isRefreshingToken = false; // Prevent multiple simultaneous refresh attempts
  private refreshTokenPromise: Promise<string> | null = null; // Cache refresh promise

  /**
   * Initialize Google APIs
   */
  async initialize(): Promise<void> {
    // Load Google API client library
    if (!this.gapiLoaded) {
      await this.loadGapi();
    }

    // Load Google Identity Services
    if (!this.gisLoaded) {
      await this.loadGis();
    }
  }

  /**
   * Load Google API client library
   */
  private loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google APIs can only be loaded in browser'));
        return;
      }

      // If gapi is already loaded, ensure client is initialized
      if (window.gapi) {
        // Check if client is already initialized with Drive API
        if (window.gapi.client && window.gapi.client.drive) {
          this.gapiLoaded = true;
          resolve();
          return;
        }
        
        // gapi exists but client not initialized - initialize it now
        window.gapi.load('client', async () => {
          try {
            console.log('🔑 Initializing gapi with API key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'MISSING');
            
            if (!API_KEY) {
              throw new Error('API Key is missing. Check .env.local and restart dev server.');
            }
            
            await window.gapi.client.init({
              apiKey: API_KEY, // Use the actual API key, not Client ID
              discoveryDocs: DISCOVERY_DOCS,
            });
            // Wait a bit for discovery docs to load
            await new Promise(resolve => setTimeout(resolve, 500));
            this.gapiLoaded = true;
            console.log('✅ gapi.client initialized successfully');
            resolve();
          } catch (error: any) {
            const errorMessage = error?.message || String(error);
            
            if (!API_KEY) {
              console.error('❌ CRITICAL: NEXT_PUBLIC_GOOGLE_API_KEY is missing. Google Drive sync will not work.');
              console.error('   Please add NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSy... to your .env.local file and restart the dev server.');
            } else if (errorMessage === 'qA' || errorMessage.includes('502')) {
              console.warn('⚠️ Google Drive API temporarily unavailable (502 error). This may be a Google infrastructure issue.');
            } else {
              console.error('Error initializing gapi.client:', error);
            }
            // Don't reject - allow fallback to fetch
            this.gapiLoaded = false;
            resolve(); // Resolve anyway to allow fallback
          }
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            console.log('🔑 Initializing gapi with API key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'MISSING');
            
            if (!API_KEY) {
              throw new Error('API Key is missing. Check .env.local and restart dev server.');
            }
            
            await window.gapi.client.init({
              apiKey: API_KEY, // Use the actual API key, not Client ID
              discoveryDocs: DISCOVERY_DOCS,
            });
            // Wait a bit for discovery docs to load
            await new Promise(resolve => setTimeout(resolve, 500));
            this.gapiLoaded = true;
            console.log('✅ gapi.client initialized successfully');
            resolve();
          } catch (error: any) {
            const errorMessage = error?.message || String(error);
            
            if (!API_KEY) {
              console.error('❌ CRITICAL: NEXT_PUBLIC_GOOGLE_API_KEY is missing. Google Drive sync will not work.');
              console.error('   Please add NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSy... to your .env.local file and restart the dev server.');
            } else if (errorMessage === 'qA' || errorMessage.includes('502')) {
              console.warn('⚠️ Google Drive API temporarily unavailable (502 error). This may be a Google infrastructure issue.');
            } else {
              console.error('Error initializing gapi.client:', error);
            }
            // Don't reject - allow fallback to fetch
            this.gapiLoaded = false;
            resolve(); // Resolve anyway to allow fallback
          }
        });
      };
      script.onerror = () => {
        console.warn('Failed to load Google API script, will use fetch fallback');
        this.gapiLoaded = false;
        resolve(); // Resolve anyway to allow fallback
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Load Google Identity Services
   */
  private loadGis(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Identity Services can only be loaded in browser'));
        return;
      }

      if (window.google?.accounts) {
        this.gisLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.gisLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Request OAuth token from Google
   */
  async requestAccess(): Promise<string> {
    if (!this.gisLoaded) {
      await this.loadGis();
    }

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, // OAuth uses Client ID (correct)
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          this.accessToken = response.access_token;
          this.storeToken(response);
          resolve(response.access_token);
        },
      });

      if (!client) {
        reject(new Error('Google Identity Services not loaded'));
        return;
      }

      client.requestAccessToken();
    });
  }

  /**
   * Store token securely
   */
  private storeToken(tokenResponse: any): void {
    try {
      const tokenData = {
        access_token: tokenResponse.access_token,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
      };
      localStorage.setItem('google_drive_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    try {
      const stored = localStorage.getItem('google_drive_token');
      if (!stored) return null;

      const tokenData = JSON.parse(stored);
      
      // Check if token is expired (with 5 minute buffer to refresh proactively)
      const expiresAt = tokenData.expires_at || 0;
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (Date.now() > (expiresAt - bufferTime)) {
        // Token expired or expiring soon - mark as expired
        if (Date.now() > expiresAt) {
          localStorage.removeItem('google_drive_token');
        }
        return null;
      }

      return tokenData.access_token;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired or expiring soon
   */
  private isTokenExpired(): boolean {
    try {
      const stored = localStorage.getItem('google_drive_token');
      if (!stored) return true;

      const tokenData = JSON.parse(stored);
      const expiresAt = tokenData.expires_at || 0;
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      return Date.now() > (expiresAt - bufferTime);
    } catch {
      return true;
    }
  }

  /**
   * Refresh access token automatically when expired or on 403 error
   * This ensures premium customers never hit authentication issues
   */
  private async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshingToken) {
      // Wait for existing refresh to complete
      while (this.isRefreshingToken) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const token = this.accessToken || this.getStoredToken();
      if (token) return token;
    }

    this.isRefreshingToken = true;
    console.log('🔄 Refreshing Google Drive access token...');

    this.refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        // Request a new access token
        const newToken = await this.requestAccess();
        
        // Ensure token is set on gapi client
        this.setAccessToken(newToken);
        
        console.log('✅ Access token refreshed successfully');
        resolve(newToken);
      } catch (error) {
        console.error('❌ Failed to refresh access token:', error);
        this.isRefreshingToken = false;
        this.refreshTokenPromise = null;
        reject(error);
      } finally {
        this.isRefreshingToken = false;
        this.refreshTokenPromise = null;
      }
    });

    return this.refreshTokenPromise;
  }

  /**
   * Get valid access token, refreshing if necessary
   * This is the main method to use before making API calls
   */
  private async getValidAccessToken(): Promise<string> {
    // Check if we have a valid token
    let token = this.accessToken || this.getStoredToken();
    
    // If token is expired or missing, refresh it
    if (!token || this.isTokenExpired()) {
      token = await this.refreshAccessToken();
    }

    if (!token) {
      throw new Error('Unable to obtain valid access token. Please reconnect to Google Drive.');
    }

    return token;
  }

  /**
   * Check if error is a network error that should be retried
   */
  private isNetworkError(error: any): boolean {
    const errorMessage = error?.message || String(error) || '';
    const errorCode = error?.code || error?.status || '';
    
    return (
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_QUIC') ||
      errorMessage.includes('ERR_CONNECTION') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      errorMessage.includes('ERR_NETWORK_IO_SUSPENDED') ||
      errorMessage.includes('Failed to fetch') ||
      errorCode === 'ECONNRESET' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ENOTFOUND'
    );
  }

  /**
   * Execute an API call with automatic token refresh on 403 errors and retry on network errors
   * This ensures premium customers never hit authentication issues
   */
  private async executeWithTokenRefresh<T>(
    apiCall: (token: string) => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    const maxRetries = 2;
    const maxNetworkRetries = 3;
    
    try {
      const token = await this.getValidAccessToken();
      return await apiCall(token);
    } catch (error: any) {
      const errorCode = error?.result?.error?.code || error?.status || error?.code;
      const errorMessage = error?.result?.error?.message || error?.message || String(error);
      
      // Handle 403 errors with automatic token refresh
      if (errorCode === 403 || errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('blocked')) {
        if (retryCount < maxRetries) {
          console.warn(`⚠️ Got 403 error (attempt ${retryCount + 1}/${maxRetries}), refreshing access token...`);
          await this.refreshAccessToken();
          // Retry with new token
          return this.executeWithTokenRefresh(apiCall, retryCount + 1);
        } else {
          throw new Error('Authentication failed after retry. Please reconnect to Google Drive in Settings.');
        }
      }
      
      // Handle network errors with exponential backoff
      if (this.isNetworkError(error)) {
        const networkRetryCount = retryCount - maxRetries; // Separate counter for network retries
        if (networkRetryCount < maxNetworkRetries) {
          const delay = Math.pow(2, networkRetryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.warn(`⚠️ Network error (${errorMessage}), retrying in ${delay}ms... (attempt ${networkRetryCount + 1}/${maxNetworkRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.executeWithTokenRefresh(apiCall, retryCount + 1);
        } else {
          const errorDetails = {
            message: errorMessage,
            code: errorCode,
            type: 'network',
          };
          console.error('❌ Network error after retries:', JSON.stringify(errorDetails, null, 2));
          throw new Error(`Network error: ${errorMessage}. Please check your internet connection.`);
        }
      }
      
      // Re-throw non-403, non-network errors
      throw error;
    }
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    // Set token on gapi client if available
    if (typeof window !== 'undefined' && window.gapi?.client) {
      window.gapi.client.setToken({ access_token: token });
    }
  }

  /**
   * Revoke access and clear token
   */
  async revokeAccess(): Promise<void> {
    const token = this.accessToken || this.getStoredToken();
    if (!token) return;

    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error revoking token:', error);
    }

    this.accessToken = null;
    localStorage.removeItem('google_drive_token');
  }

  /**
   * Find existing portfolio file (supports folder organization)
   * Searches in specified folder first, then globally if not found
   * Automatically refreshes token on 403 errors for premium customers
   */
  async findPortfolioFile(
    fileName: string,
    folderId?: string
  ): Promise<DriveFileMetadata | null> {
    return this.executeWithTokenRefresh(async (token: string) => {
      // Build query - search by name, optionally in specific folder
      let query = `name='${encodeURIComponent(fileName)}' and trashed=false`;
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      const response = await fetch(
        `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,createdTime,size,parents)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        const error: any = new Error(`Drive API error: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!response.ok) {
        throw new Error(`Drive API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        return {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          createdTime: file.createdTime,
          size: file.size,
          parents: file.parents || [], // Track folder location
        };
      }

      // If not found in specific folder, search globally
      if (folderId) {
        return this.findPortfolioFile(fileName); // Retry without folder constraint
      }

      return null;
    });
  }

  /**
   * Create new portfolio file (supports folder organization)
   */
  /**
   * Create portfolio file
   * Automatically refreshes token on 403 errors for premium customers
   */
  async createPortfolioFile(
    fileName: string,
    data: PortfolioData,
    folderId?: string
  ): Promise<DriveFileMetadata> {
    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });

    return this.executeWithTokenRefresh(async (token: string) => {
      // Create file metadata with appProperties to tag app uploads
      // This allows distinguishing app uploads from manual Drive edits
      const metadata: any = {
        name: fileName,
        mimeType: 'application/json',
        appProperties: {
          origin: 'pocket-app-client',
          appVersion: '1.0.0',
        },
      };

      // Add folder parent if specified
      if (folderId) {
        metadata.parents = [folderId];
      }

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403) {
        const error: any = new Error(`Failed to create file: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create file: ${error}`);
      }

      const file = await response.json();
      return {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        size: file.size,
        parents: file.parents || [],
        version: file.version || file.headRevisionId || null,
        headRevisionId: file.headRevisionId || null,
        lastModifyingUser: file.lastModifyingUser || null,
      };
    });
  }

  /**
   * Update existing portfolio file with optimistic locking
   * Checks for conflicts BEFORE uploading to prevent overwriting Drive edits
   * Automatically refreshes token on 403 errors for premium customers
   */
  async updatePortfolioFile(
    fileId: string,
    data: PortfolioData,
    lastKnownRevisionId?: string | null
  ): Promise<DriveFileMetadata> {
    const fileContent = JSON.stringify(data, null, 2);

    return this.executeWithTokenRefresh(async (token: string) => {
      // 🛡️ OPTIMISTIC LOCK: Get current revision ID if not provided
      let revisionId = lastKnownRevisionId;
      if (!revisionId) {
        try {
          const meta = await this.getFileMetadata(fileId);
          revisionId = meta.headRevisionId || meta.version || null;
        } catch (error) {
          console.warn('⚠️ Could not get revision ID for If-Match header, proceeding without it:', error);
        }
      }

      // Use multipart upload for updating file content
      // Add appProperties to tag app uploads (for future use in distinguishing app vs manual edits)
      const metadata = {
        name: 'pocket_portfolio_db.json',
        mimeType: 'application/json',
        appProperties: {
          origin: 'pocket-app-client',
          appVersion: '1.0.0',
        },
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([fileContent], { type: 'application/json' }));

      // Build headers with If-Match for optimistic concurrency control
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      // 🛑 THE SAFETY LATCH: If-Match header prevents overwriting if file changed on Drive
      // If Drive has a newer version (manual edit), Google will reject with 412 Precondition Failed
      if (revisionId) {
        // Google Drive API v3 uses 'If-Match' with the file's 'headRevisionId' (or etag)
        // This ensures the upload only succeeds if the file hasn't changed since we last saw it
        headers['If-Match'] = revisionId;
        
        
      }

      const response = await fetch(
        `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=multipart`,
        {
          method: 'PATCH',
          headers,
          body: formData,
        }
      );

      // Handle 412 Precondition Failed (file was modified on Drive)
      if (response.status === 412) {
        
        
        // Get current metadata to provide timestamp info for conflict resolution
        let currentMetadata: DriveFileMetadata | null = null;
        try {
          currentMetadata = await this.getFileMetadata(fileId);
        } catch (error) {
          console.warn('⚠️ Could not get current metadata after 412, proceeding with conflict error:', error);
        }
        
        const conflictError: any = new Error('SYNC_CONFLICT: File modified on server. Pull required.');
        conflictError.code = 'CONFLICT';
        conflictError.status = 412;
        conflictError.revisionId = revisionId;
        if (currentMetadata) {
          conflictError.currentRevisionId = currentMetadata.headRevisionId || currentMetadata.version;
          conflictError.driveModifiedTime = currentMetadata.modifiedTime;
        }
        throw conflictError;
      }

      if (response.status === 403) {
        const error: any = new Error(`Failed to update file: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update file: ${error}`);
      }

      const file = await response.json();
      return {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        size: file.size,
        parents: file.parents || [],
        version: file.version || file.headRevisionId || null,
        headRevisionId: file.headRevisionId || null,
        lastModifyingUser: file.lastModifyingUser || null,
      };
    });
  }

  /**
   * Get head revision ID from revisions API (fallback if not in file metadata)
   */
  async getHeadRevisionId(fileId: string): Promise<string | null> {
    const token = this.accessToken || this.getStoredToken();
    if (!token) {
      return null;
    }

    try {
      // Fetch revisions and get the latest (head) revision
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${fileId}/revisions?pageSize=1&fields=revisions(id,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.revisions && data.revisions.length > 0) {
        // Return the most recent revision ID (first in list when sorted by modifiedTime desc)
        return data.revisions[0].id || null;
      }

      return null;
      } catch (error: any) {
        const errorDetails = {
          message: error?.message || String(error),
          code: error?.code || error?.status,
        };
        console.error('❌ Error getting head revision ID:', JSON.stringify(errorDetails, null, 2));
        return null;
      }
  }

  /**
   * Check for conflicts before uploading
   * Returns true if remote version has changed since last known version
   */
  async checkForConflict(fileId: string, lastKnownVersion: string | null): Promise<{
    hasConflict: boolean;
    currentVersion: string | null;
    metadata: DriveFileMetadata | null;
  }> {
    if (!lastKnownVersion) {
      return { hasConflict: false, currentVersion: null, metadata: null };
    }

    try {
      const metadata = await this.getFileMetadata(fileId);
      let currentVersion = metadata.version || metadata.headRevisionId || null;
      
      // FALLBACK: If version fields aren't in metadata, try revisions API
      if (!currentVersion) {
        currentVersion = await this.getHeadRevisionId(fileId);
      }
      
      const hasConflict = currentVersion !== null && currentVersion !== lastKnownVersion;

      return {
        hasConflict,
        currentVersion,
        metadata: metadata, // Always return metadata (even if no conflict) so we can check lastModifyingUser
      };
    } catch (error: any) {
      const errorDetails = {
        message: error?.message || String(error),
        code: error?.code || error?.status,
      };
      console.error('❌ Error checking for conflict:', JSON.stringify(errorDetails, null, 2));
      // On error, assume no conflict to allow upload to proceed
      return { hasConflict: false, currentVersion: null, metadata: null };
    }
  }

  /**
   * Download portfolio file
   * Automatically refreshes token on 403 errors for premium customers
   */
  async downloadPortfolioFile(fileId: string): Promise<PortfolioData> {
    return this.executeWithTokenRefresh(async (token: string) => {
      // CACHE BUSTER: Add timestamp to force fresh network request
      // This prevents browser from serving stale JSON from disk cache
      // Note: Only using query param (not headers) to avoid CORS preflight
      const cacheBuster = Date.now();
      const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media&t=${cacheBuster}`;
      
      
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Removed cache-control headers to avoid CORS preflight
          // Timestamp query param alone is sufficient for cache-busting
        },
      });

      if (response.status === 403) {
        // This will be caught by executeWithTokenRefresh and retried
        const error: any = new Error(`Failed to download file: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get response as text first to handle JSON parse errors gracefully
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        return data as PortfolioData;
      } catch (parseError: any) {
        // JSON is malformed - likely due to manual editing in Drive
        console.error('❌ Failed to parse JSON from Drive file:', parseError);
        console.error('File content (first 500 chars):', text.substring(0, 500));
        
        // Throw a more descriptive error
        const error: any = new Error(
          `Invalid JSON in Drive file. The file may have been manually edited and contains syntax errors. ` +
          `Error: ${parseError.message}. Please fix the JSON in Google Drive and try again.`
        );
        error.code = 'INVALID_JSON';
        error.parseError = parseError.message;
        error.fileContent = text.substring(0, 500); // Include first 500 chars for debugging
        throw error;
      }
    });
  }

  /**
   * Get file metadata (Version-Based Sync)
   * Fetches version, headRevisionId, and lastModifyingUser for conflict detection
   * Uses gapi.client to avoid CORS issues
   * Automatically refreshes token on 403 errors for premium customers
   */
  async getFileMetadata(fileId: string, retryCount: number = 0): Promise<DriveFileMetadata> {
    const maxRetries = 2;
    
    try {
      // Get valid token (will refresh if expired)
      const token = await this.getValidAccessToken();

      // Ensure gapi is loaded and initialized
      if (!this.gapiLoaded) {
        await this.loadGapi();
      }

      // Wait for gapi.client.drive to be available (with timeout)
      let attempts = 0;
      const maxAttempts = 10;
      while (!window.gapi?.client?.drive && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
        // Try to initialize if not already done
        if (!this.gapiLoaded && window.gapi) {
          try {
            if (!API_KEY) {
              console.error('❌ CRITICAL: NEXT_PUBLIC_GOOGLE_API_KEY is missing. Google Drive sync will not work.');
              throw new Error('API Key is missing. Check .env.local and restart dev server.');
            }
            
            await window.gapi.client.init({
              apiKey: API_KEY, // Use the actual API key, not Client ID
              discoveryDocs: DISCOVERY_DOCS,
            });
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for discovery docs
            this.gapiLoaded = true;
            console.log('✅ gapi.client initialized successfully (retry)');
          } catch (error: any) {
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('missing') || !API_KEY) {
              console.error('❌ CRITICAL: NEXT_PUBLIC_GOOGLE_API_KEY is missing. Google Drive sync will not work.');
            } else {
              console.warn('Failed to initialize gapi.client:', error);
            }
          }
        }
      }

      // Set token on gapi client to avoid CORS issues
      if (window.gapi?.client) {
        window.gapi.client.setToken({ access_token: token });
      }

      // Use gapi.client.drive instead of fetch to avoid CORS
      if (window.gapi?.client?.drive) {
        let response;
        try {
          response = await window.gapi.client.drive.files.get({
            fileId,
            fields: 'id,kind,name,version,headRevisionId,modifiedTime,createdTime,size,parents,lastModifyingUser,appProperties',
          });
        } catch (apiError: any) {
          // Check for 403 error (authentication issue)
          const errorCode = apiError?.result?.error?.code || apiError?.status || apiError?.code;
          const errorMessage = apiError?.result?.error?.message || apiError?.message || String(apiError);
          
          if (errorCode === 403 || errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('blocked')) {
            console.warn('⚠️ Got 403 error in getFileMetadata, refreshing access token...');
            
            // Refresh token and retry once
            if (retryCount < maxRetries) {
              await this.refreshAccessToken();
              // Recursively retry with new token
              return this.getFileMetadata(fileId, retryCount + 1);
            } else {
              throw new Error('Failed to get file metadata after token refresh. Please reconnect to Google Drive.');
            }
          }
          throw apiError;
        }

        const file = response.result;
      
        // DEBUG: Log the actual API response to see what fields are available
        console.log('📋 Drive API Response:', {
          id: file.id,
          hasVersion: 'version' in file,
          version: file.version,
          hasHeadRevisionId: 'headRevisionId' in file,
          headRevisionId: file.headRevisionId,
          hasLastModifyingUser: 'lastModifyingUser' in file,
          lastModifyingUser: file.lastModifyingUser,
          allKeys: Object.keys(file),
        });
        
        
        
        // Try to get version from metadata, or fetch from revisions API as fallback
        let version = file.version || file.headRevisionId || null;
        let headRevisionId = file.headRevisionId || null;
        
        // FALLBACK: If version fields aren't in metadata, try revisions API
        if (!version && !headRevisionId) {
          const revisionId = await this.getHeadRevisionId(fileId);
          if (revisionId) {
            version = revisionId;
            headRevisionId = revisionId;
            
          }
        }
        
        return {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          createdTime: file.createdTime,
          size: file.size,
          parents: file.parents || [],
          version,
          headRevisionId,
          lastModifyingUser: file.lastModifyingUser || null,
        };
      } else {
        // FALLBACK: If gapi.client.drive is not available, use fetch (may have CORS issues)
        console.warn('⚠️ gapi.client.drive not available, falling back to fetch (may have CORS issues)');
        const response = await fetch(
          `${DRIVE_API_BASE}/files/${fileId}?fields=id,kind,name,version,headRevisionId,modifiedTime,createdTime,size,parents,lastModifyingUser,appProperties`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }
        );

        // Handle 403 errors with automatic token refresh
        if (response.status === 403) {
          if (retryCount < maxRetries) {
            console.warn('⚠️ Got 403 error in fetch fallback, refreshing access token...');
            await this.refreshAccessToken();
            // Recursively retry with new token
            return this.getFileMetadata(fileId, retryCount + 1);
          } else {
            throw new Error('Failed to get file metadata after token refresh. Please reconnect to Google Drive.');
          }
        }

        if (!response.ok) {
          throw new Error(`Failed to get file metadata: ${response.statusText}`);
        }

        const file = await response.json();
        
        // Try to get version from metadata, or fetch from revisions API as fallback
        let version = file.version || file.headRevisionId || null;
        let headRevisionId = file.headRevisionId || null;
        
        // FALLBACK: If version fields aren't in metadata, try revisions API
        if (!version && !headRevisionId) {
          const revisionId = await this.getHeadRevisionId(fileId);
          if (revisionId) {
            version = revisionId;
            headRevisionId = revisionId;
          }
        }
        
        return {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          createdTime: file.createdTime,
          size: file.size,
          parents: file.parents || [],
          version,
          headRevisionId,
          lastModifyingUser: file.lastModifyingUser || null,
        };
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const errorCode = error?.result?.error?.code || error?.status || error?.code;
      
      // Handle 403 errors with automatic token refresh
      if (errorCode === 403 || errorMessage.includes('403') || errorMessage.includes('permission') || errorMessage.includes('blocked')) {
        if (retryCount < maxRetries) {
          console.warn('⚠️ Got 403 error, refreshing access token and retrying...');
          try {
            await this.refreshAccessToken();
            // Recursively retry with new token
            return this.getFileMetadata(fileId, retryCount + 1);
          } catch (refreshError) {
            console.error('❌ Failed to refresh token:', refreshError);
            throw new Error('Authentication failed. Please reconnect to Google Drive in Settings.');
          }
        } else {
          throw new Error('Authentication failed after retry. Please reconnect to Google Drive in Settings.');
        }
      }
      
      // Handle 502 errors (Google infrastructure issues)
      const is502Error = errorCode === 502 || errorMessage.includes('502') || errorMessage.includes('qA') || errorMessage.includes('Failed to fetch');
      if (is502Error) {
        const friendlyError = new Error('Google Drive API is temporarily unavailable (502 error). This is a Google infrastructure issue. Please try again in a few minutes.');
        console.warn('⚠️', friendlyError.message);
        throw friendlyError;
      }
      
      // Improved error logging with full details
      const errorDetails = {
        message: error?.message || String(error),
        code: errorCode,
        status: error?.status,
        result: error?.result,
        stack: error?.stack,
        name: error?.name,
      };
      console.error('❌ Error getting file metadata:', JSON.stringify(errorDetails, null, 2));
      throw error;
    }
  }

  /**
   * Create or get folder for portfolio files
   * Automatically refreshes token on 403 errors for premium customers
   */
  async getOrCreateFolder(folderName: string): Promise<string> {
    return this.executeWithTokenRefresh(async (token: string) => {
      // Search for existing folder
      const query = `name='${encodeURIComponent(folderName)}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await fetch(
        `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        const error: any = new Error(`Failed to search folder: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          return data.files[0].id; // Return existing folder ID
        }
      }

      // Create new folder
      const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });

      if (createResponse.status === 403) {
        const error: any = new Error(`Failed to create folder: ${createResponse.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!createResponse.ok) {
        throw new Error('Failed to create folder');
      }

      const folder = await createResponse.json();
      return folder.id;
    });
  }

  /**
   * Upload or update Excel file
   */
  /**
   * Upload Excel file
   * Automatically refreshes token on 403 errors for premium customers
   */
  async uploadExcelFile(
    fileId: string | null,
    fileName: string,
    blob: Blob,
    folderId?: string
  ): Promise<DriveFileMetadata> {
    return this.executeWithTokenRefresh(async (token: string) => {
      if (fileId) {
        // Update existing file
        const metadata: any = {
          name: fileName,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);

        const response = await fetch(
          `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=multipart`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.status === 403) {
          const error: any = new Error(`Failed to update Excel file: ${response.statusText}`);
          error.status = 403;
          throw error;
        }

        if (!response.ok) {
          throw new Error(`Failed to update Excel file: ${response.statusText}`);
        }

        const file = await response.json();
        return {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          createdTime: file.createdTime,
          size: file.size,
          parents: file.parents || [],
        };
      } else {
        // Create new file
        const metadata: any = {
          name: fileName,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };

        if (folderId) {
          metadata.parents = [folderId];
        }

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', blob);

        const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 403) {
          const error: any = new Error(`Failed to create Excel file: ${response.statusText}`);
          error.status = 403;
          throw error;
        }

        if (!response.ok) {
          throw new Error(`Failed to create Excel file: ${response.statusText}`);
        }

        const file = await response.json();
        return {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          createdTime: file.createdTime,
          size: file.size,
          parents: file.parents || [],
        };
      }
    });
  }

  /**
   * Get folder name from folder ID
   * Automatically refreshes token on 403 errors for premium customers
   */
  async getFolderName(folderId: string): Promise<string> {
    return this.executeWithTokenRefresh(async (token: string) => {
      const response = await fetch(
        `${DRIVE_API_BASE}/files/${folderId}?fields=name`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        const error: any = new Error(`Failed to get folder name: ${response.statusText}`);
        error.status = 403;
        throw error;
      }

      if (!response.ok) {
        throw new Error(`Failed to get folder name: ${response.statusText}`);
      }

      const folder = await response.json();
      return folder.name;
    });
  }
}

// Global type declarations for Google APIs
declare global {
  interface Window {
    gapi?: any;
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export const driveService = new GoogleDriveService();

