/**
 * React Hook for Google Drive Sync
 * Manages Drive connection state and sync operations
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { driveService } from '../lib/google-drive/driveService';
import type { DriveSyncState, PortfolioData, DriveFileMetadata } from '../lib/google-drive/types';
import { exportLocalPortfolio } from '../lib/store/localPortfolioStore';
import { loadLocalTrades, saveLocalTrades } from '../lib/store/localPortfolioStore';
import { generateExcelFromPortfolio } from '../lib/google-drive/excelExport';
import type { Trade } from '../services/tradeService';
import { useAuth } from './useAuth';
import { TradeService } from '../services/tradeService';

const PORTFOLIO_FILE_NAME = 'pocket_portfolio_db.json';
const EXCEL_FILE_NAME = 'pocket_view.xlsx';
const DEFAULT_FOLDER_NAME = 'Pocket Portfolio';
const SYNC_DEBOUNCE_MS = 1000; // 1 second for near real-time sync
const POLL_INTERVAL_MS = 1000; // Check Drive every 1 second for real-time sync

export function useGoogleDrive() {
  const { user, isAuthenticated } = useAuth();
  const [syncState, setSyncState] = useState<DriveSyncState>({
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    localVersion: null, // Last known version we synced
    remoteVersion: null, // Current version on Drive
    fileId: null,
    excelFileId: null,
    folderId: null,
    folderName: null,
    jsonFileMetadata: null,
    excelFileMetadata: null,
    error: null,
    conflictDetected: false,
    conflictData: null,
    lastContentCheckTime: null, // Timestamp of last content-based check
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const pollingSetupRef = useRef<string | null>(null);
  const syncStateRef = useRef(syncState);
  const startPollingRef = useRef<(() => void) | null>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);
  const lastDriveSyncTimeRef = useRef<number>(0); // Track when we last synced FROM Drive
  const lastUploadTimeRef = useRef<number>(0); // Track when we last uploaded TO Drive (to prevent polling from pulling immediately after)
  const csvImportInProgressRef = useRef<number>(0); // Track when CSV import started (timestamp) - prevents polling from pulling during import
  const deletionInProgressRef = useRef<number>(0); // Track when deletion started (timestamp) - prevents polling from pulling during deletion sync
  const editLockRef = useRef<number>(0); // Track when user last edited (timestamp) - pause polling during active editing
  const recentSyncsRef = useRef<Set<string>>(new Set()); // Track recent syncs to prevent duplicates
  const consecutiveErrorsRef = useRef<number>(0); // Track consecutive errors for backoff
  const currentPollIntervalRef = useRef<number>(POLL_INTERVAL_MS); // Current polling interval (may increase on errors)
  const lastEmptyDriveSkipRef = useRef<number>(0); // Track when we last skipped due to empty Drive (prevents sync loop)
  
  // Keep ref in sync with state
  useEffect(() => {
    syncStateRef.current = syncState;
  }, [syncState]);

  /**
   * Initialize Drive service and check connection status
   */
  useEffect(() => {
    const initialize = async () => {
      if (isInitializedRef.current) return;
      
      try {
        await driveService.initialize();
        const token = driveService.getStoredToken();
        
        if (token) {
          driveService.setAccessToken(token);
          const fileId = localStorage.getItem('google_drive_file_id');
          const excelFileId = localStorage.getItem('google_drive_excel_file_id');
          const folderId = localStorage.getItem('google_drive_folder_id');
          
          if (fileId) {
            // Get file metadata and folder name
            try {
              const metadata = await driveService.getFileMetadata(fileId);
              const currentFolderId = metadata.parents?.[0] || folderId;
              let folderName: string | null = null;
              
              if (currentFolderId) {
                try {
                  folderName = await driveService.getFolderName(currentFolderId);
                } catch (error) {
                  console.warn('Failed to get folder name:', error);
                }
              }
              
              // Get Excel file metadata if exists
              let excelMetadata = null;
              if (excelFileId) {
                try {
                  excelMetadata = await driveService.getFileMetadata(excelFileId);
                } catch (error) {
                  console.warn('Failed to get Excel file metadata:', error);
                }
              }
              
              // VERSION-BASED SYNC: Initialize versions when reconnecting
              // Prioritize headRevisionId for better manual edit detection
              const initialVersion = metadata.headRevisionId || metadata.version || null;
              setSyncState(prev => ({
                ...prev,
                isConnected: true,
                fileId,
                excelFileId,
                folderId: currentFolderId,
                folderName,
                lastSyncTime: metadata.modifiedTime, // Keep for backward compatibility
                localVersion: initialVersion, // Initialize localVersion
                remoteVersion: initialVersion, // Initialize remoteVersion
                jsonFileMetadata: metadata,
                excelFileMetadata: excelMetadata,
              }));
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              const is502Error = errorMessage.includes('502') || errorMessage.includes('temporarily unavailable');
              
              if (is502Error) {
                console.warn('⚠️ Google Drive API temporarily unavailable. Will retry automatically.');
                // Don't set error state for temporary Google API issues
              } else {
                // Improved error logging with full details
                const errorDetails = {
                  message: error instanceof Error ? error.message : String(error),
                  code: (error as any)?.code || (error as any)?.status || (error as any)?.result?.error?.code,
                  stack: error instanceof Error ? error.stack : undefined,
                  name: error instanceof Error ? error.name : undefined,
                };
                console.error('❌ Error getting file metadata:', JSON.stringify(errorDetails, null, 2));
              }
              
              setSyncState(prev => ({
                ...prev,
                isConnected: true,
                fileId,
                excelFileId,
                folderId,
                error: is502Error ? 'Google Drive API temporarily unavailable. Please try again in a few minutes.' : null,
              }));
            }
          }
        }
        
        isInitializedRef.current = true;
      } catch (error) {
        // Handle network errors gracefully (502, 503, etc. from Google API)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isNetworkError = errorMessage.includes('502') || errorMessage.includes('503') || errorMessage.includes('network');
        
        if (isNetworkError) {
          console.warn('⚠️ Google Drive API temporarily unavailable (network error). Will retry on next connection attempt.');
          // Don't set error state for temporary network issues - allow retry
        } else {
          console.error('Error initializing Drive service:', error);
          setSyncState(prev => ({
            ...prev,
            error: errorMessage.length > 50 ? 'Failed to initialize Drive service' : errorMessage,
          }));
        }
      }
    };

    initialize();
  }, []);

  /**
   * Connect to Google Drive
   * @param folderName Optional folder name to organize files (default: "Pocket Portfolio")
   * @param syncExcel Whether to also sync Excel file for Google Sheets viewing
   * @param trades Optional trades array (from Firebase or state). If not provided, loads from localStorage.
   */
  const connect = useCallback(async (
    folderName?: string,
    syncExcel: boolean = true,
    trades?: Trade[]
  ): Promise<void> => {
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const token = await driveService.requestAccess();
      driveService.setAccessToken(token);

      // Get or create folder if specified
      // CRITICAL: Check for existing folder first to avoid creating duplicates
      let folderId: string | undefined;
      if (folderName) {
        // Check if folder name changed - if so, create new folder
        const storedFolderId = localStorage.getItem('google_drive_folder_id');
        const storedFolderName = localStorage.getItem('google_drive_folder_name');
        
        if (storedFolderId && storedFolderName === folderName) {
          // Verify folder still exists before reusing
          try {
            await driveService.getFileMetadata(storedFolderId);
            folderId = storedFolderId; // Use existing folder
            
          } catch (error) {
            // Folder doesn't exist, create new one
            folderId = await driveService.getOrCreateFolder(folderName);
            localStorage.setItem('google_drive_folder_id', folderId);
            localStorage.setItem('google_drive_folder_name', folderName);
            
          }
        } else {
          // Folder name changed or no stored folder - create/get new folder
          folderId = await driveService.getOrCreateFolder(folderName);
          localStorage.setItem('google_drive_folder_id', folderId);
          localStorage.setItem('google_drive_folder_name', folderName);
          
        }
      } else {
        // Check for existing folder preference
        folderId = localStorage.getItem('google_drive_folder_id') || undefined;
        if (folderId) {
          // Verify folder still exists
          try {
            await driveService.getFileMetadata(folderId);
            
          } catch (error) {
            // Folder doesn't exist, create default
            folderId = await driveService.getOrCreateFolder(DEFAULT_FOLDER_NAME);
            localStorage.setItem('google_drive_folder_id', folderId);
            localStorage.setItem('google_drive_folder_name', DEFAULT_FOLDER_NAME);
            
          }
        } else {
          // Create default folder
          folderId = await driveService.getOrCreateFolder(DEFAULT_FOLDER_NAME);
          localStorage.setItem('google_drive_folder_id', folderId);
          localStorage.setItem('google_drive_folder_name', DEFAULT_FOLDER_NAME);
          
        }
      }

      // Find or create portfolio file (searches in folder first, then globally)
      let file = await driveService.findPortfolioFile(PORTFOLIO_FILE_NAME, folderId);
      
      if (!file) {
        // Create new file with current portfolio data
        const portfolioData = exportLocalPortfolio(trades).data;
        // Track sync session start
        if (typeof window !== 'undefined') {
          import('../lib/analytics/events').then(({ trackSyncSessionStart }) => {
            trackSyncSessionStart();
          });
        }
        file = await driveService.createPortfolioFile(PORTFOLIO_FILE_NAME, portfolioData, folderId);
      } else {
        // File found - check if it was moved to a different folder
        if (file.parents && file.parents.length > 0) {
          const currentFolderId = file.parents[0];
          if (folderId && currentFolderId !== folderId) {
            // File was moved - update our tracking
            folderId = currentFolderId;
            localStorage.setItem('google_drive_folder_id', folderId);
          } else if (!folderId) {
            // We don't have a folder preference, use the file's current location
            folderId = currentFolderId;
            localStorage.setItem('google_drive_folder_id', folderId);
          }
        }
        
        // Check if Drive has newer data
        const localData = exportLocalPortfolio(trades).data;
        const driveData = await driveService.downloadPortfolioFile(file.id);
        
        const driveTime = new Date(file.modifiedTime).getTime();
        const localTime = new Date(localData.metadata.lastUpdated).getTime();
        
        if (driveTime > localTime) {
          // Drive is newer - pull from Drive
          // Track sync session start
          if (typeof window !== 'undefined') {
            import('../lib/analytics/events').then(({ trackSyncSessionStart }) => {
              trackSyncSessionStart();
            });
          }
          await syncFromDrive(file.id);
        } else {
          // Local is newer - push to Drive
          // Track sync session start
          if (typeof window !== 'undefined') {
            import('../lib/analytics/events').then(({ trackSyncSessionStart }) => {
              trackSyncSessionStart();
            });
          }
          await syncToDrive(file.id, trades);
        }
      }

      // Sync Excel file if enabled
      let excelFile: DriveFileMetadata | null = null;
      if (syncExcel) {
        try {
          const portfolioData = exportLocalPortfolio(trades).data;
          const excelBlob = generateExcelFromPortfolio(portfolioData);
          const existingExcelId = localStorage.getItem('google_drive_excel_file_id');
          
          excelFile = await driveService.uploadExcelFile(
            existingExcelId,
            EXCEL_FILE_NAME,
            excelBlob,
            folderId
          );
          
          localStorage.setItem('google_drive_excel_file_id', excelFile.id);
        } catch (error) {
          console.warn('Failed to sync Excel file (non-critical):', error);
          // Don't fail the entire connection if Excel sync fails
        }
      }

      localStorage.setItem('google_drive_file_id', file.id);
      
      // Get folder name and file metadata
      let resolvedFolderName: string | null = null;
      if (folderId) {
        try {
          resolvedFolderName = await driveService.getFolderName(folderId);
        } catch (error) {
          console.warn('Failed to get folder name:', error);
          resolvedFolderName = resolvedFolderName || DEFAULT_FOLDER_NAME;
        }
      }
      
      // Get file metadata for display
      const jsonMetadata = await driveService.getFileMetadata(file.id);
      let excelMetadata = null;
      if (excelFile) {
        excelMetadata = await driveService.getFileMetadata(excelFile.id);
      }
      
      // VERSION-BASED SYNC: Initialize versions when connecting
      // Prioritize headRevisionId for better manual edit detection
      const initialVersion = jsonMetadata.headRevisionId || jsonMetadata.version || null;
      setSyncState({
        isConnected: true,
        isSyncing: false,
        lastSyncTime: file.modifiedTime, // Keep for backward compatibility
        localVersion: initialVersion, // Initialize localVersion to current Drive version
        remoteVersion: initialVersion, // Initialize remoteVersion to current Drive version
        fileId: file.id,
        excelFileId: excelFile?.id || null,
        folderId: folderId || null,
        folderName: resolvedFolderName || folderName || DEFAULT_FOLDER_NAME,
        lastContentCheckTime: null, // Initialize content check time
        jsonFileMetadata: jsonMetadata,
        excelFileMetadata: excelMetadata,
        error: null,
        conflictDetected: false,
        conflictData: null,
      });
      
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const is502Error = errorMessage.includes('502') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('qA');
      
      if (is502Error) {
        console.warn('⚠️ Google Drive API temporarily unavailable (502 error). This is a Google infrastructure issue. Please try again in a few minutes.');
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          error: 'Google Drive API temporarily unavailable. Please try again in a few minutes.',
        }));
      } else {
        console.error('Error connecting to Drive:', error);
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          error: errorMessage.length > 100 ? 'Failed to connect to Google Drive' : errorMessage,
        }));
      }
      throw error;
    }
  }, []);

  /**
   * Disconnect from Google Drive
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await driveService.revokeAccess();
      localStorage.removeItem('google_drive_file_id');
      localStorage.removeItem('google_drive_excel_file_id');
      // Keep folder ID for next connection
      
      setSyncState({
        isConnected: false,
        isSyncing: false,
        lastSyncTime: null,
        localVersion: null,
        remoteVersion: null,
        fileId: null,
        excelFileId: null,
        folderId: syncState.folderId, // Preserve folder preference
        lastContentCheckTime: null, // Reset content check time on disconnect
        folderName: syncState.folderName, // Preserve folder name
        jsonFileMetadata: null,
        excelFileMetadata: null,
        error: null,
        conflictDetected: false,
        conflictData: null,
      });
    } catch (error) {
      console.error('Error disconnecting from Drive:', error);
      setSyncState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect',
      }));
    }
  }, [syncState.folderId]);

  /**
   * Sync portfolio data to Drive (debounced)
   * @param fileId Optional file ID (uses stored ID if not provided)
   * @param trades Optional trades array (from Firebase or state). If not provided, loads from localStorage.
   */
  // Use ref for user to avoid stale closures
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const syncToDrive = useCallback(async (fileId?: string, trades?: Trade[], skipPreUploadCheck?: boolean): Promise<void> => {
    
    // Use ref to get latest state to avoid stale closures
    const state = syncStateRef.current;
    const targetFileId = fileId || state.fileId;
    if (!targetFileId || !state.isConnected) {
      
      return;
    }

    // CRITICAL: Set upload time IMMEDIATELY (before any checks) to prevent polling from pulling
    // This ensures polling sees the ref is set even if we skip the sync or during debounce
    // We set it here so polling knows we're about to sync, even if we skip due to recent Drive sync
    const uploadTime = Date.now();
    lastUploadTimeRef.current = uploadTime;
    

    // IMPORTANT: Check if we recently synced from Drive (within last 5 seconds)
    // This prevents immediate overwrite of Drive edits, but allows syncing after a short delay
    // This makes the sync collaborative - we respect Drive edits but can still sync our changes
    // EXCEPTION: If skipPreUploadCheck is true, we're intentionally syncing (e.g., after deletion), so proceed
    const RECENT_SYNC_WINDOW_MS = 5000; // 5 seconds
    const timeSinceLastDriveSync = Date.now() - lastDriveSyncTimeRef.current;
    
    if (!skipPreUploadCheck && timeSinceLastDriveSync < RECENT_SYNC_WINDOW_MS) {
      console.log('⏸️ Skipping sync to Drive - recently synced from Drive (respecting Drive edits, will retry shortly)');
      // Note: We keep lastUploadTimeRef set even if we skip, so polling knows we tried to sync
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // CRITICAL: Capture skipPreUploadCheck in closure for debounced callback
    // This ensures the flag is preserved even after the debounce delay
    const capturedSkipPreUploadCheck = skipPreUploadCheck;

    // Debounce sync
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        // Get latest state again inside timeout
        const currentState = syncStateRef.current;
        if (!currentState.isConnected || !currentState.fileId) {
          return;
        }

        // Double-check we didn't just sync from Drive during debounce (reduced to 5 seconds for more collaborative sync)
        // EXCEPTION: If skipPreUploadCheck is true, we're intentionally syncing, so proceed
        const timeSinceLastSync = Date.now() - lastDriveSyncTimeRef.current;
        if (!skipPreUploadCheck && timeSinceLastSync < RECENT_SYNC_WINDOW_MS) {
          console.log('⏸️ Skipping sync to Drive - Drive was updated during debounce (will retry shortly)');
          return;
        }

        setSyncState(prev => ({ ...prev, isSyncing: true, error: null, conflictDetected: false, conflictData: null }));
        
        // REMOVED: Old conflict check - replaced with optimistic locking in updatePortfolioFile()
        // Optimistic locking checks revision ID BEFORE upload, preventing overwrites
        
        // Use provided trades (from Firebase/state) or fall back to localStorage
        const portfolioData = exportLocalPortfolio(trades).data;
        
        // CRITICAL: If we're syncing a deletion (empty or significantly fewer trades), mark deletion in progress
        // This prevents polling from pulling stale trades back
        const driveDataBeforeUpload = await driveService.downloadPortfolioFile(currentState.fileId).catch(() => null);
        const isDeletion = portfolioData.trades.length === 0 || (driveDataBeforeUpload && portfolioData.trades.length < driveDataBeforeUpload.trades.length);
        if (isDeletion) {
          deletionInProgressRef.current = Date.now();
          
        }
        
        // CRITICAL: Check what's currently in Drive before uploading
        if (driveDataBeforeUpload) {
          
          
          // NEW: Content-based conflict detection before upload
          // If Drive content differs from local (different trade IDs), and we haven't synced from Drive recently,
          // it might be a manual edit. Pull from Drive first to avoid overwriting.
          // CRITICAL: Also check for deletions if Drive has MORE trades than local (manual addition in Drive)
          
          // Check if we should pull first:
          // 1. Normal case: Not a deletion, local has trades, Drive content differs
          // 2. Deletion case: Local is empty/fewer, but Drive has MORE trades (manual addition in Drive)
          // Skip pre-upload check if explicitly requested (e.g., when intentionally syncing empty state after deletion)
          // CRITICAL: skipPreUploadCheck must be checked FIRST to prevent any pre-upload checks
          // Use captured value from closure to ensure it's not lost in debounce
          const shouldCheckContent = !capturedSkipPreUploadCheck && userRef.current?.uid && driveDataBeforeUpload.trades && 
            ((!isDeletion && portfolioData.trades.length > 0) || 
             (isDeletion && driveDataBeforeUpload.trades.length > portfolioData.trades.length));
          
          if (shouldCheckContent) {
            const driveTradeIds = new Set(driveDataBeforeUpload.trades.map((t: any) => t.id).filter(Boolean));
            const localTradeIds = new Set(portfolioData.trades.map(t => t.id).filter(Boolean));
            const driveHasFewerTrades = driveDataBeforeUpload.trades.length < portfolioData.trades.length;
            const driveHasMoreTrades = driveDataBeforeUpload.trades.length > portfolioData.trades.length;
            const tradeCountsDiffer = driveDataBeforeUpload.trades.length !== portfolioData.trades.length;
            
            // Check if trade IDs differ (even if counts match, IDs might differ due to manual edits)
            const tradesDiffer = tradeCountsDiffer ||
              driveTradeIds.size !== localTradeIds.size ||
              [...driveTradeIds].some(id => !localTradeIds.has(id)) ||
              [...localTradeIds].some(id => !driveTradeIds.has(id));
            
            // If content differs (counts or IDs), and we haven't synced recently, pull first
            // CRITICAL: For deletions where Drive has MORE trades, always pull (regardless of time window)
            // This prevents overwriting manual additions in Drive when syncing empty state
            // EXCEPTION: If skipPreUploadCheck is true, NEVER pull - we're intentionally syncing empty state
            const timeSinceLastDriveSync = Date.now() - lastDriveSyncTimeRef.current;
            const isDeletionWithMoreTradesInDrive = isDeletion && driveHasMoreTrades;
            // CRITICAL: Never pull from Drive during deletion - we're intentionally syncing empty state
            // The pre-upload check should be skipped during deletion to prevent syncFromDrive from recreating trades
            const isDeletionInProgress = deletionInProgressRef.current > 0;
            const DELETION_GRACE_PERIOD_MS = 120000; // 120 seconds grace period
            const deletionStartTime = deletionInProgressRef.current;
            const timeSinceDeletion = deletionStartTime > 0 ? Date.now() - deletionStartTime : Infinity;
            const isDeletionRecent = deletionStartTime > 0 && timeSinceDeletion < DELETION_GRACE_PERIOD_MS;
            // CRITICAL: If deletion was recent AND Drive has trades BUT local is empty, don't pull - we just synced empty state
            // This prevents syncFromDrive from recreating trades after deletion
            const isPostDeletionState = isDeletionRecent && driveDataBeforeUpload.trades.length > 0 && portfolioData.trades.length === 0;
            // Simplified logic: Always pull if Drive has more trades during deletion, otherwise check time window (2 seconds)
            // BUT: If skipPreUploadCheck is true OR deletion is in progress OR we're in post-deletion state, never pull (we're intentionally overwriting Drive)
            const shouldPullFirst = !capturedSkipPreUploadCheck && !isDeletionInProgress && !isPostDeletionState && tradesDiffer && (isDeletionWithMoreTradesInDrive || timeSinceLastDriveSync > 2000);
            
            
            
            if (shouldPullFirst) {
              const reason = isDeletion && driveHasMoreTrades 
                ? 'Drive has more trades than local (manual addition detected)'
                : 'Drive content differs from local (manual edit detected)';
              console.log(`🔄 ${reason} - pulling from Drive first to avoid overwriting`, {
                driveTradeCount: driveDataBeforeUpload.trades.length,
                localTradeCount: portfolioData.trades.length,
                timeSinceLastDriveSync,
                isDeletion,
              });
              
              
              
              // Pull from Drive first to get the manual deletion
              await syncFromDrive();
              
              // Mark that we just synced from Drive
              lastDriveSyncTimeRef.current = Date.now();
              
              // Update state after sync
              const updatedMetadata = await driveService.getFileMetadata(currentState.fileId);
              const newVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
              setSyncState(prev => ({
                ...prev,
                localVersion: newVersion,
                remoteVersion: newVersion,
                lastSyncTime: new Date().toISOString(), // Use current time to track when we last synced
                jsonFileMetadata: updatedMetadata,
                isSyncing: false,
              }));
              
              // After pulling, the local state will be updated by refreshTrades()
              // The auto-sync will then sync the merged state if needed
              return; // Exit - don't upload yet, let the pull complete first
            }
          }
        }
        
        
        // ☢️ CLIENT-SIDE HEALING: Filter out healed trades before uploading to Drive
        let healedTradeIds: string[] = [];
        try {
          healedTradeIds = JSON.parse(localStorage.getItem('healedTradeIds') || '[]');
        } catch (e) {
          console.warn('Failed to load healed trade IDs:', e);
        }
        
        // CRITICAL: Filter out trades that failed to update to prevent overwriting Drive edits
        // When an update fails, Firebase has stale data, but Drive has the correct data
        // We must NOT upload the stale Firebase data back to Drive
        let failedUpdateTradeIds: string[] = [];
        try {
          failedUpdateTradeIds = JSON.parse(localStorage.getItem('failedUpdateTradeIds') || '[]');
        } catch (e) {
          console.warn('Failed to load failed update trade IDs:', e);
        }
        
        const healedSet = new Set(healedTradeIds);
        const failedUpdateSet = new Set(failedUpdateTradeIds);
        
        // Filter out both healed trades AND trades that failed to update
        const filteredTrades = portfolioData.trades.filter(trade => 
          !healedSet.has(trade.id) && !failedUpdateSet.has(trade.id)
        );
        
        const healedCount = portfolioData.trades.filter(t => healedSet.has(t.id)).length;
        const failedUpdateCount = portfolioData.trades.filter(t => failedUpdateSet.has(t.id)).length;
        
        if (filteredTrades.length !== portfolioData.trades.length) {
          console.log(`☢️ [FILTERING] Filtered out ${portfolioData.trades.length - filteredTrades.length} trades before syncing to Drive (${healedCount} healed, ${failedUpdateCount} failed updates)`);
          
          
          
          if (failedUpdateCount > 0) {
            console.warn(`⚠️ [PRESERVING DRIVE EDITS] Excluding ${failedUpdateCount} trades that failed to update - preserving Drive edits instead of overwriting with stale Firebase data`);
          }
        }
        
        // Use filtered trades for upload
        const filteredPortfolioData: PortfolioData = {
          ...portfolioData,
          trades: filteredTrades,
          metadata: {
            ...portfolioData.metadata,
            tradeCount: filteredTrades.length,
          }
        };
        
        /**
         * 🛡️ SAFEGUARD: Ensure metadata.tradeCount always matches trades.length before upload
         * This prevents writing incorrect metadata to Drive, which would cause sync issues.
         * This is a critical validation that must never be removed.
         * 
         * WHY: If we write incorrect metadata, the next sync will detect a mismatch and correct it,
         * but this creates unnecessary sync cycles and potential race conditions.
         */
        if (filteredPortfolioData.metadata.tradeCount !== filteredTrades.length) {
          console.error('🚨 [METADATA VALIDATION ERROR] Metadata mismatch before upload!', {
            metadataTradeCount: filteredPortfolioData.metadata.tradeCount,
            actualTradeCount: filteredTrades.length,
            expected: filteredTrades.length
          });
          // Force correction - this should never happen, but if it does, fix it
          filteredPortfolioData.metadata.tradeCount = filteredTrades.length;
        }
        
        // 🚨 FINAL ASSERTION: Verify metadata is correct before upload
        if (filteredPortfolioData.metadata.tradeCount !== filteredTrades.length) {
          throw new Error(`Critical: Metadata validation failed before upload. Expected ${filteredTrades.length}, got ${filteredPortfolioData.metadata.tradeCount}`);
        }
        
        
        
        // DEBUG: Log trade IDs being synced to Drive
        const tradesWithIds = filteredTrades.filter(t => t.id);
        const tradesWithoutIds = filteredTrades.filter(t => !t.id);
        console.log('📤 Syncing to Drive:', {
          total: filteredTrades.length,
          withIds: tradesWithIds.length,
          withoutIds: tradesWithoutIds.length,
          sampleIds: tradesWithIds.slice(0, 3).map(t => ({ id: t.id, ticker: t.ticker })),
          healedTradesFiltered: portfolioData.trades.length - filteredTrades.length,
          metadataTradeCount: filteredPortfolioData.metadata.tradeCount,
        });
        
        // CRITICAL: Set upload time BEFORE upload to prevent polling from pulling during upload
        // This ensures polling skips even if it checks during the upload process
        // NOTE: We already set this at the start of syncToDrive, but we update it here to ensure
        // it's set right before the actual upload (in case of delays)
        const uploadTimeBeforeUpload = Date.now();
        lastUploadTimeRef.current = uploadTimeBeforeUpload;
        
        
        // 🛡️ OPTIMISTIC LOCKING: Get current revision ID BEFORE uploading
        // This allows updatePortfolioFile to check for conflicts
        // Also track when we started this sync attempt (for "first edit wins" logic)
        const localEditStartTime = Date.now(); // When we started preparing to upload
        let lastKnownRevisionId: string | null = currentState.localVersion || null;
        try {
          // Get the most current revision ID from Drive
          const currentMetadata = await driveService.getFileMetadata(currentState.fileId);
          lastKnownRevisionId = currentMetadata.headRevisionId || currentMetadata.version || currentState.localVersion || null;
          
          
        } catch (error) {
          console.warn('⚠️ Could not get current revision ID, proceeding without conflict check:', error);
        }
        
        let uploadedFile: DriveFileMetadata | null = null;
        
        try {
          
          
          uploadedFile = await driveService.updatePortfolioFile(
            currentState.fileId, 
            filteredPortfolioData, // Use filtered data (healed trades excluded)
            lastKnownRevisionId // Pass revision ID for optimistic locking
          );
          
          
        } catch (error: any) {
          // Handle conflict error (412 Precondition Failed) - "FIRST EDIT WINS" logic
          if (error.code === 'CONFLICT' || error.status === 412) {
            const errorDriveModifiedTime = error.driveModifiedTime ? new Date(error.driveModifiedTime).getTime() : 0;
            const localEditTime = localEditStartTime; // When we started preparing this upload
            
            // FIRST EDIT WINS: Compare timestamps to determine source of truth
            const driveEditWasFirst = errorDriveModifiedTime > 0 && errorDriveModifiedTime < localEditTime;
            
            
            
            if (driveEditWasFirst) {
              // Drive edit happened first - Drive is source of truth, pull from Drive
              console.log('🔄 Conflict: Drive edit was first (source of truth). Pulling from Drive...');
              
              
              
              // Pull changes from Drive (Drive is source of truth)
              await syncFromDrive();
              
              console.log('✅ Pulled Drive changes (Drive was first edit). Local changes discarded.');
              
              // Mark that we just synced from Drive to prevent immediate overwrite
              lastDriveSyncTimeRef.current = Date.now();
              
              // Reset syncing state
              setSyncState(prev => ({ ...prev, isSyncing: false }));
              
              return; // Don't throw - we handled the conflict (pulled from Drive)
            } else {
              // Local edit happened first - Local is source of truth, proceed with upload
              console.log('🔄 Conflict: Local edit was first (source of truth). Retrying upload without conflict check...');
              
              
              
              // Local edit was first - retry upload without conflict check (will overwrite Drive)
              uploadedFile = await driveService.updatePortfolioFile(
                currentState.fileId, 
                filteredPortfolioData, // Use filtered data (healed trades excluded)
                null // Skip conflict check - local edit was first
              );
              
              
              
              // Continue with normal post-upload flow (update version, etc.)
              // Fall through to the code after the try-catch
            }
          } else {
            // Not a conflict error - re-throw
            throw error;
          }
        }
        
        // Only proceed with normal post-upload flow if upload succeeded
        if (!uploadedFile) {
          return; // Already handled (pulled from Drive) or error occurred
        }
        
        // 🔥 CRITICAL: Update upload time AFTER successful upload completes
        // This extends the polling block to cover the full upload duration
        // This prevents polling from running during slow Drive API responses
        lastUploadTimeRef.current = Date.now();
        
        const file = uploadedFile;
        
        // VERSION-BASED SYNC: Get metadata IMMEDIATELY after upload to get the new version
        const updatedMetadata = await driveService.getFileMetadata(currentState.fileId);
        // Prioritize headRevisionId for better manual edit detection
        const newVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
        const newLastSyncTime = updatedMetadata.modifiedTime;
        const oldLocalVersion = syncStateRef.current.localVersion;
        
        // Update ref IMMEDIATELY with new version to prevent polling from pulling back our own changes
        const oldRefVersion = syncStateRef.current.localVersion;
        syncStateRef.current = {
          ...syncStateRef.current,
          localVersion: newVersion, // Update localVersion to match what we just uploaded
          remoteVersion: newVersion,
          lastSyncTime: newLastSyncTime,
        };
        
        
        
        // Also sync Excel file if enabled
        if (currentState.excelFileId || localStorage.getItem('google_drive_excel_file_id')) {
          try {
            const excelBlob = generateExcelFromPortfolio(portfolioData);
            const excelFile = await driveService.uploadExcelFile(
              currentState.excelFileId || localStorage.getItem('google_drive_excel_file_id'),
              EXCEL_FILE_NAME,
              excelBlob,
              currentState.folderId || undefined
            );
            
            localStorage.setItem('google_drive_excel_file_id', excelFile.id);
            setSyncState(prev => ({
              ...prev,
              excelFileId: excelFile.id,
              excelFileMetadata: excelFile,
            }));
          } catch (excelError) {
            console.warn('Failed to sync Excel file (non-critical):', excelError);
            // Don't fail the entire sync if Excel fails
          }
        }
        
        // Update state (version and lastSyncTime are already updated in ref above)
        const prevStateVersion = syncStateRef.current.localVersion; // Get before setSyncState
        setSyncState(prev => {
          const newState = {
            ...prev,
            isSyncing: false,
            localVersion: newVersion, // Update localVersion to match what we just uploaded
            remoteVersion: newVersion,
            lastSyncTime: newLastSyncTime, // Keep for backward compatibility
            jsonFileMetadata: updatedMetadata,
          };
          
          
          
          return newState;
        });
        
        
        
        // Clear deletion flag after sync completes (Drive now has the correct data)
        if (isDeletion) {
          // Keep flag for the full grace period (120 seconds) to ensure syncFromDrive doesn't recreate trades
          // This gives enough time for Drive to propagate the empty state and for any pending syncs to complete
          setTimeout(() => {
            deletionInProgressRef.current = 0;
            
          }, 120000); // 120 seconds (full grace period) after sync completes
        }
        
        console.log('✅ Synced to Drive successfully');
      } catch (error) {
        console.error('Error syncing to Drive:', error);
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Sync failed',
        }));
      }
    }, SYNC_DEBOUNCE_MS);
  }, []); // Empty deps - use refs for state to avoid stale closures

  /**
   * Sync portfolio data from Drive
   * @param fileId Optional file ID (uses stored ID if not provided)
   * @param onTradesUpdated Optional callback to notify when trades are updated (for Firebase users)
   */
  const syncFromDrive = useCallback(async (
    fileId?: string,
    onTradesUpdated?: (trades: Trade[]) => void
  ): Promise<void> => {
    // CRITICAL: Block syncFromDrive if deletion is in progress to prevent recreating trades
    // This allows syncToDrive to complete syncing empty state before syncFromDrive can run
    const DELETION_GRACE_PERIOD_MS = 120000; // 120 seconds grace period
    const deletionStartTime = deletionInProgressRef.current;
    const timeSinceDeletion = deletionStartTime > 0 ? Date.now() - deletionStartTime : Infinity;
    const isDeletionInProgress = deletionStartTime > 0 && timeSinceDeletion < DELETION_GRACE_PERIOD_MS;
    
    if (isDeletionInProgress) {
      console.warn('🚫 Blocking syncFromDrive - deletion in progress', { deletionStartTime, timeSinceDeletion });
      
      return; // Block syncFromDrive until deletion completes
    }
    
    const state = syncStateRef.current;
    const targetFileId = fileId || state.fileId;
    
      
    
    if (!targetFileId || !state.isConnected) {
      
      return;
    }

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const driveData = await driveService.downloadPortfolioFile(targetFileId);
      
      /**
       * 🛡️ CRITICAL FIX: Metadata Validation & Auto-Correction
       * 
       * PROBLEM: When users manually edit the Drive JSON file (e.g., delete trades),
       * they often forget to update the `metadata.tradeCount` field. This causes:
       * - Sync logic to make incorrect decisions based on stale counts
       * - Infinite sync loops when counts don't match
       * - Data inconsistency between Drive and Firebase
       * 
       * SOLUTION: Always validate that `metadata.tradeCount` matches `trades.length`.
       * If they don't match, automatically correct the metadata to match reality.
       * We trust the array (source of truth) over the metadata number.
       * 
       * WHY THIS CANNOT BE REMOVED:
       * - This fix prevents sync failures from manual Drive edits
       * - Without this, the app will break when users manually edit the file
       * - This is a "defensive programming" pattern required for user-editable files
       * 
       * TESTED: ✅ Confirmed working in production (Dec 2025)
       * EVIDENCE: Logs show "⚠️ [METADATA FIX] Correcting count from X to Y"
       * 
       * DO NOT REMOVE OR MODIFY WITHOUT:
       * 1. Understanding the manual edit scenario
       * 2. Testing with manually edited Drive files
       * 3. Verifying sync still works after manual edits
       */
      
      
      if (driveData.metadata && driveData.trades && Array.isArray(driveData.trades)) {
        const actualTradeCount = driveData.trades.length;
        const metadataTradeCount = driveData.metadata.tradeCount;
        
        
        
        // 🚨 SAFEGUARD: Assert that validation always runs
        if (typeof actualTradeCount !== 'number' || actualTradeCount < 0) {
          console.error('🚨 [METADATA VALIDATION ERROR] Invalid actualTradeCount:', actualTradeCount);
          throw new Error('Metadata validation failed: invalid trade count');
        }
        
        if (metadataTradeCount !== actualTradeCount) {
          console.warn(`⚠️ [METADATA FIX] Correcting count from ${metadataTradeCount} to ${actualTradeCount}`);
          
          // Correct the metadata to match reality (trust the array, not the number)
          driveData.metadata.tradeCount = actualTradeCount;
          
          // 🚨 SAFEGUARD: Verify correction was applied
          if (driveData.metadata.tradeCount !== actualTradeCount) {
            console.error('🚨 [METADATA VALIDATION ERROR] Correction failed!', {
              expected: actualTradeCount,
              actual: driveData.metadata.tradeCount
            });
            throw new Error('Metadata correction failed');
          }
          
          // 🔥 CRITICAL: Persist corrected metadata to Drive immediately
          // This prevents the metadata mismatch from persisting across sync cycles
          try {
            const currentMetadata = await driveService.getFileMetadata(targetFileId);
            const revisionId = currentMetadata.headRevisionId || currentMetadata.version || null;
            await driveService.updatePortfolioFile(targetFileId, driveData, revisionId);
            console.log(`✅ [METADATA PERSISTED] Corrected metadata (${metadataTradeCount} → ${actualTradeCount}) persisted to Drive`);
          } catch (error: any) {
            console.error('⚠️ [METADATA PERSIST ERROR] Failed to persist corrected metadata:', error);
            // Don't throw - continue with sync even if persistence fails
          }
        } else {
          
        }
      } else {
        
      }
      
      
      
      // CRITICAL LOG: If Drive has 0 trades, log it prominently
      if (driveData.trades?.length === 0) {
        console.warn('⚠️ Drive file contains 0 trades - will skip deletion to prevent data loss');
        console.warn('⚠️ Firebase trades will be uploaded to Drive via syncToDrive instead');
        
        
      }
      
      // Import trades from Drive
      if (driveData.trades && Array.isArray(driveData.trades)) {
        // DEBUG: Log trade IDs to diagnose sync issues
        const tradesWithIds = driveData.trades.filter(t => t.id);
        const tradesWithoutIds = driveData.trades.filter(t => !t.id);
        console.log('📥 Downloaded from Drive:', {
          total: driveData.trades.length,
          withIds: tradesWithIds.length,
          withoutIds: tradesWithoutIds.length,
          sampleIds: tradesWithIds.slice(0, 3).map(t => ({ id: t.id, ticker: t.ticker })),
          sampleWithoutIds: tradesWithoutIds.slice(0, 3).map(t => ({ ticker: t.ticker, date: t.date })),
        });
        
        // Save to localStorage (for unauthenticated users and backup)
        const result = saveLocalTrades(driveData.trades);
        if (!result.success) {
          throw new Error(result.error || 'Failed to save trades from Drive');
        }
        
        console.log('✅ Synced', driveData.trades.length, 'trades from Drive');
        
        
        // Mark that we just synced from Drive (BEFORE updating Firebase)
        // This prevents auto-sync from immediately overwriting Drive edits
        lastDriveSyncTimeRef.current = Date.now();
        
        
        // Track sync results for event dispatch
        let syncResults = {
          tradesUpdated: 0,
          tradesCreated: 0,
          tradesDeleted: 0,
        };
        
        // CRITICAL: Track failed updates separately to prevent overwriting Drive edits
        // Declare outside the if block so it's accessible when dispatching the event
        const failedUpdateIds = new Set<string>();
        
        // For authenticated users, update Firebase to match Drive BEFORE triggering events
        // This ensures refreshTrades() loads the correct data
        // CRITICAL: Preserve trade IDs to allow edits (quantity, dates, etc.) to update existing trades
        if (isAuthenticated && user) {
          try {
            console.log('🔄 Updating Firebase to match Drive...');
            
            
            // Get existing trades to match by ID
            // 🔥 CRITICAL: Force server fetch to prevent stale cache from causing trades to reappear
            // After syncing from Drive, we need fresh server data, not cached data
            const existingTrades = await TradeService.getTrades(user.uid, true); // forceServerFetch = true
            
            
            const existingTradesMap = new Map(existingTrades.map(t => [t.id, t]));
            
            
            
            // CRITICAL: If Firebase has 0 trades (after deletion) but Drive has trades,
            // check if a deletion was recently performed. If so, sync empty state to Drive first
            // instead of recreating trades from Drive.
            // EXTENDED grace period to 120 seconds to handle slow syncs and network delays
            const DELETION_GRACE_PERIOD_MS = 120000; // 120 seconds grace period after deletion (extended from 10s to handle slow syncs)
            const deletionStartTime = deletionInProgressRef.current;
            const currentTime = Date.now();
            const timeSinceDeletion = currentTime - deletionStartTime;
            // Also check if deletion flag is set OR if we just synced empty state to Drive
            const isDeletionRecent = deletionStartTime > 0 && timeSinceDeletion < DELETION_GRACE_PERIOD_MS;
            
            // FALLBACK: If deletion flag is 0 but Firebase has 0 trades and Drive has trades,
            // check if we recently synced empty state to Drive (within grace period)
            // This handles cases where deletion flag was cleared or deletion happened in previous session
            const lastSyncTime = syncStateRef.current.lastSyncTime;
            const timeSinceLastSync = lastSyncTime ? currentTime - new Date(lastSyncTime).getTime() : Infinity;
            const recentlySyncedEmptyState = existingTrades.length === 0 && 
                                           lastSyncTime && 
                                           timeSinceLastSync < DELETION_GRACE_PERIOD_MS &&
                                           syncStateRef.current.jsonFileMetadata?.size && 
                                           parseInt(syncStateRef.current.jsonFileMetadata.size) < 100; // Empty state is small (< 100 bytes)
            
            
            
            // ALWAYS log deletion check for debugging (even if conditions don't match)
            const deletionCheckData = {
              existingTradesCount: existingTrades.length,
              driveTradesCount: driveData.trades.length,
              deletionInProgressRef: deletionInProgressRef.current,
              timeSinceDeletion,
              isDeletionRecent,
              recentlySyncedEmptyState,
              lastSyncTime,
              timeSinceLastSync,
              gracePeriodMs: DELETION_GRACE_PERIOD_MS,
              willCheck: existingTrades.length === 0 && driveData.trades.length > 0 && (isDeletionRecent || recentlySyncedEmptyState),
              condition1: existingTrades.length === 0,
              condition2: driveData.trades.length > 0,
              condition3: isDeletionRecent || recentlySyncedEmptyState,
            };
            console.log('🔍 [DELETION CHECK]', deletionCheckData);
            
            
            // CRITICAL: If Firebase has 0 trades but Drive has trades, check if deletion was recent
            // This prevents trades from being recreated after deletion, regardless of deletion flag state
            // Use localStorage flag to persist deletion state across page reloads
            if (existingTrades.length === 0 && driveData.trades.length > 0) {
              const deletionTimestamp = localStorage.getItem('pp_deletion_in_progress');
              const DELETION_GRACE_PERIOD_MS = 120000; // 2 minutes grace period
              
              if (deletionTimestamp) {
                const timeSinceDeletion = Date.now() - parseInt(deletionTimestamp);
                const justDeleted = timeSinceDeletion < DELETION_GRACE_PERIOD_MS;
                
                if (justDeleted) {
                  console.warn('🛡️ Blocking Re-Import: Deletion was recent. Overwriting Drive with Empty State.');
                  
                  
                  // Sync empty state to Drive first
                  await syncToDrive(targetFileId, [], true); // skipPreUploadCheck = true
                  
                  // Clear localStorage flag after successful sync
                  localStorage.removeItem('pp_deletion_in_progress');
                  
                  // Don't create trades from Drive - we just synced empty state
                  return;
                } else {
                  // Grace period expired, clear stale flag
                  localStorage.removeItem('pp_deletion_in_progress');
                  console.log('⚠️ Deletion flag expired, allowing Drive import (grace period exceeded)');
                }
              } else {
                // No deletion flag - this is likely a first load or legitimate Drive edit
                // CRITICAL: Don't overwrite Drive edits! If there's no deletion flag, trust Drive
                // This handles cases where:
                // 1. User just imported trades via CSV (Firebase empty, Drive has trades)
                // 2. User edited trades in Drive (Firebase might be temporarily empty during sync)
                // 3. First load after connecting Drive
                console.log('ℹ️ Firebase has 0 trades but Drive has trades - no deletion flag, trusting Drive and importing trades');
                
                
                // Continue with normal sync - import trades from Drive
                // Don't return early, let the sync proceed normally
              }
            }
            
            // Enhanced sync analysis logging
            const driveTradeIds = driveData.trades.map(t => t.id).filter(Boolean);
            const existingTradeIds = Array.from(existingTradesMap.keys());
            const matchingIds = driveTradeIds.filter(id => existingTradeIds.includes(id));
            
            console.log('📊 Sync analysis:', {
              driveTrades: driveData.trades.length,
              existingTrades: existingTrades.length,
              driveTradesWithIds: driveTradeIds.length,
              matchingIds: matchingIds.length,
              driveTradeIds: driveTradeIds.slice(0, 5),
              existingTradeIds: existingTradeIds.slice(0, 5),
              matchingIdsSample: matchingIds.slice(0, 3),
            });
            
            // Separate trades into updates and new trades
            const tradesToUpdate: Array<{ id: string; data: Partial<Trade> }> = [];
            // Type for trades to create: all Trade fields except uid/createdAt/updatedAt/id, with optional id
            type TradeToCreate = Omit<Trade, 'uid' | 'createdAt' | 'updatedAt' | 'id'> & { id?: string };
            const tradesToCreate: TradeToCreate[] = [];
            const matchedIds = new Set<string>(); // Track which existing trades we've matched
            
            // Helper function to create a match key for content-based matching
            // CRITICAL: Normalize formats to match polling logic for consistency
            const getMatchKey = (trade: any) => {
              // Normalize date to ISO string (handle both Date objects and ISO strings)
              const normalizedDate = trade.date instanceof Date 
                ? trade.date.toISOString() 
                : (typeof trade.date === 'string' ? new Date(trade.date).toISOString() : String(trade.date));
              // Normalize price to number (handle both number and string)
              const normalizedPrice = typeof trade.price === 'number' ? trade.price : parseFloat(String(trade.price)) || 0;
              // Normalize qty to number
              const normalizedQty = typeof trade.qty === 'number' ? trade.qty : (typeof trade.quantity === 'number' ? trade.quantity : parseFloat(String(trade.qty || trade.quantity || 0)) || 0);
              return `${String(trade.ticker || '').toUpperCase()}-${normalizedDate}-${String(trade.type || '').toUpperCase()}-${normalizedPrice}-${normalizedQty}`;
            };
            
            // CRITICAL: Create a "stable" match key that doesn't include qty/price
            // This allows us to find trades even when qty/price are edited in Drive
            // We match by ticker+date+type only, then check if qty/price changed
            const getStableMatchKey = (trade: any) => {
              const normalizedDate = trade.date instanceof Date 
                ? trade.date.toISOString() 
                : (typeof trade.date === 'string' ? new Date(trade.date).toISOString() : String(trade.date));
              return `${String(trade.ticker || '').toUpperCase()}-${normalizedDate}-${String(trade.type || '').toUpperCase()}`;
            };
            
            // Create a map of existing trades by stable key (ticker+date+type only)
            const existingTradesByStableKey = new Map<string, Trade>();
            for (const trade of existingTrades) {
              const stableKey = getStableMatchKey(trade);
              if (!existingTradesByStableKey.has(stableKey)) {
                existingTradesByStableKey.set(stableKey, trade);
              }
            }
            
            // Also create a map by full content key for exact matches (when qty/price haven't changed)
            const existingTradesByContent = new Map<string, Trade>();
            for (const trade of existingTrades) {
              const key = getMatchKey(trade);
              if (!existingTradesByContent.has(key)) {
                existingTradesByContent.set(key, trade);
              }
            }
            
            for (const driveTrade of driveData.trades) {
              let matchedTrade: Trade | undefined;
              
              // First, try to match by ID
              if (driveTrade.id && existingTradesMap.has(driveTrade.id)) {
                matchedTrade = existingTradesMap.get(driveTrade.id)!;
                
              } else {
                // Fallback: Try to match by stable key first (ticker+date+type only)
                // This allows us to find trades even when qty/price are edited in Drive
                const stableKey = getStableMatchKey(driveTrade);
                matchedTrade = existingTradesByStableKey.get(stableKey);
                
                if (matchedTrade && !matchedIds.has(matchedTrade.id)) {
                  console.log(`🔗 Matched trade by stable key (ticker+date+type): ${driveTrade.ticker} on ${driveTrade.date} -> Firebase ID: ${matchedTrade.id}`);
                  
                } else if (!matchedTrade) {
                  // Try exact content match as last resort (when qty/price haven't changed)
                  const contentKey = getMatchKey(driveTrade);
                  matchedTrade = existingTradesByContent.get(contentKey);
                  
                  if (matchedTrade && !matchedIds.has(matchedTrade.id)) {
                    console.log(`🔗 Matched trade by exact content (not ID): ${driveTrade.ticker} on ${driveTrade.date} -> Firebase ID: ${matchedTrade.id}`);
                    
                  } else {
                    
                  }
                }
              }
              
              if (matchedTrade && !matchedIds.has(matchedTrade.id)) {
                // Check if the trade belongs to the current user (uid must match)
                if (matchedTrade.uid && matchedTrade.uid !== user.uid) {
                  // Trade belongs to a different user - skip update and create new trade instead
                  console.warn(`⚠️ Skipping update for trade ${matchedTrade.id} - belongs to different user (${matchedTrade.uid} vs ${user.uid})`);
                  
                  
                  
                  // Create new trade instead (don't add to matchedIds so it gets created)
                  // CRITICAL: Preserve Drive trade ID if it exists to prevent duplicates
                  if (driveTrade.id) {
                    tradesToCreate.push({
                      id: driveTrade.id, // Preserve Drive ID
                      date: driveTrade.date,
                      ticker: driveTrade.ticker,
                      type: driveTrade.type,
                      currency: driveTrade.currency,
                      qty: driveTrade.qty,
                      price: driveTrade.price,
                      mock: driveTrade.mock || false,
                    });
                  } else {
                    tradesToCreate.push({
                      date: driveTrade.date,
                      ticker: driveTrade.ticker,
                      type: driveTrade.type,
                      currency: driveTrade.currency,
                      qty: driveTrade.qty,
                      price: driveTrade.price,
                      mock: driveTrade.mock || false,
                    });
                  }
                } else {
                  // Update existing trade - preserve the ID to allow edits
                  matchedIds.add(matchedTrade.id);
                  
                  
                  
                  // Check if any fields actually changed before adding to update list
                  const hasChanges = 
                    matchedTrade.date !== driveTrade.date ||
                    matchedTrade.ticker !== driveTrade.ticker ||
                    matchedTrade.type !== driveTrade.type ||
                    matchedTrade.currency !== driveTrade.currency ||
                    Math.abs((matchedTrade.qty || 0) - (driveTrade.qty || driveTrade.quantity || 0)) > 0.0001 ||
                    Math.abs((matchedTrade.price || 0) - (driveTrade.price || 0)) > 0.0001 ||
                    matchedTrade.mock !== (driveTrade.mock || false);
                  
                  // 🔥 CRITICAL: Prevent overwriting newer Firebase data with older Drive data
                  // If Firebase trade was updated recently (within last 10 seconds), skip Drive update
                  // This prevents Drive from overwriting user edits that haven't synced to Drive yet
                  const RECENT_EDIT_GRACE_PERIOD_MS = 10000; // 10 seconds
                  const firebaseUpdatedAt = matchedTrade.updatedAt;
                  let firebaseUpdateTime = 0;
                  
                  if (firebaseUpdatedAt) {
                    // Handle both Timestamp objects and plain objects with seconds/nanoseconds
                    if (firebaseUpdatedAt.toDate) {
                      firebaseUpdateTime = firebaseUpdatedAt.toDate().getTime();
                    } else if (firebaseUpdatedAt.seconds) {
                      firebaseUpdateTime = firebaseUpdatedAt.seconds * 1000 + (firebaseUpdatedAt.nanoseconds || 0) / 1000000;
                    }
                  }
                  
                  const timeSinceFirebaseUpdate = firebaseUpdateTime > 0 ? Date.now() - firebaseUpdateTime : Infinity;
                  const isRecentFirebaseEdit = timeSinceFirebaseUpdate < RECENT_EDIT_GRACE_PERIOD_MS;
                  
                  // Also check Drive's lastUpdated timestamp if available
                  const driveLastUpdated = driveData.metadata?.lastUpdated;
                  let driveUpdateTime = 0;
                  if (driveLastUpdated) {
                    driveUpdateTime = new Date(driveLastUpdated).getTime();
                  }
                  
                  // Only update if:
                  // 1. Fields have changed AND
                  // 2. Either Drive is newer (driveUpdateTime > firebaseUpdateTime) OR Firebase edit is not recent (not within grace period)
                  const shouldUpdate = hasChanges && (
                    (driveUpdateTime > firebaseUpdateTime && firebaseUpdateTime > 0) || // Drive is newer (and we have Firebase timestamp)
                    (!isRecentFirebaseEdit) // Firebase edit is old enough (not a recent user edit)
                  );
                  
                  if (shouldUpdate) {
                    tradesToUpdate.push({
                      id: matchedTrade.id,
                      data: {
                        date: driveTrade.date,
                        ticker: driveTrade.ticker,
                        type: driveTrade.type,
                        currency: driveTrade.currency,
                        qty: driveTrade.qty,
                        price: driveTrade.price,
                        mock: driveTrade.mock || false,
                      }
                    });
                  } else if (hasChanges && isRecentFirebaseEdit) {
                    // Skip update - Firebase has a recent edit that hasn't synced to Drive yet
                    console.log(`⏸️ Skipping Drive update for trade ${matchedTrade.id} (${matchedTrade.ticker}) - Firebase has recent edit (${Math.round(timeSinceFirebaseUpdate / 1000)}s ago), preserving user changes`);
                  } else {
                    
                  }
                }
              } else {
                // Create new trade (no match found)
                // CRITICAL: Preserve Drive trade ID if it exists to prevent duplicates
                // If Drive trade has an ID, use setDoc with that ID instead of generating a new one
                if (driveTrade.id) {
                  // Trade has a Drive ID - preserve it to prevent duplicates when syncing back to Drive
                  tradesToCreate.push({
                    id: driveTrade.id, // Preserve Drive ID
                    date: driveTrade.date,
                    ticker: driveTrade.ticker,
                    type: driveTrade.type,
                    currency: driveTrade.currency,
                    qty: driveTrade.qty,
                    price: driveTrade.price,
                    mock: driveTrade.mock || false,
                  });
                } else {
                  // Trade has no ID (e.g., from CSV import) - let Firebase generate one
                  tradesToCreate.push({
                    date: driveTrade.date,
                    ticker: driveTrade.ticker,
                    type: driveTrade.type,
                    currency: driveTrade.currency,
                    qty: driveTrade.qty,
                    price: driveTrade.price,
                    mock: driveTrade.mock || false,
                  });
                }
              }
            }
            
            // Delete trades that are in Firebase but not in Drive
            // CRITICAL: Use stable key matching (not just ID matching) to handle CSV imports without IDs
            // IMPORTANT: Also exclude trades that were matched by content (they're in matchedIds)
            // Also ensure we only delete trades that belong to the current user (uid must match)
            const driveTradeIdsSet = new Set(driveData.trades.map(t => t.id).filter(Boolean));
            
            // CRITICAL: Also create a set of stable keys from Drive trades for deletion detection
            // This handles cases where Drive trades don't have IDs (CSV imports)
            const driveTradeStableKeysSet = new Set<string>();
            for (const driveTrade of driveData.trades) {
              const stableKey = getStableMatchKey(driveTrade);
              driveTradeStableKeysSet.add(stableKey);
            }
            
            const tradesToDelete = existingTrades
              .filter(t => {
                // Only delete trades that:
                // 1. Are not in Drive by ID (not in driveTradeIdsSet) AND not in Drive by stable key (not in driveTradeStableKeysSet)
                // 2. Were not matched by content (not in matchedIds)
                // 3. Belong to the current user (uid matches)
                const tradeStableKey = getStableMatchKey(t);
                const notInDriveById = !driveTradeIdsSet.has(t.id);
                const notInDriveByStableKey = !driveTradeStableKeysSet.has(tradeStableKey);
                const notInDrive = notInDriveById && notInDriveByStableKey; // Must be missing from both ID and stable key sets
                const notMatched = !matchedIds.has(t.id);
                const belongsToUser = t.uid === user.uid;
                const shouldDelete = notInDrive && notMatched && belongsToUser;
                
                
                
                return shouldDelete;
              })
              .map(t => t.id);
            
            
            
            // 🔥 CRITICAL FIX: If Drive has 0 trades but Firebase has trades, DON'T delete Firebase trades
            // Instead, skip deletion and let syncToDrive upload Firebase trades to Drive
            // This prevents users from losing trades when Drive file is empty/corrupted/new
            // Only delete trades if Drive explicitly has fewer trades (not 0, but a specific subset)
            if (driveData.trades.length === 0 && existingTrades.length > 0) {
              console.warn('⚠️ Drive has 0 trades but Firebase has trades - skipping deletion to prevent data loss');
              console.warn('⚠️ This will allow syncToDrive to upload Firebase trades to Drive');
              
              // Mark that we just skipped due to empty Drive (prevents polling loop)
              lastEmptyDriveSkipRef.current = Date.now();
              
              // Clear tradesToDelete to prevent deletion
              // This allows syncToDrive to upload Firebase trades to Drive instead
              tradesToDelete.length = 0;
              
              // Don't create or update anything from empty Drive
              // Just skip this sync and let syncToDrive handle uploading Firebase trades
              console.log('✅ Skipping syncFromDrive deletion - will upload Firebase trades to Drive via syncToDrive');
              
              // Still update sync state and dispatch event, but with 0 changes
              window.dispatchEvent(new CustomEvent('drive-sync-complete', { 
                detail: { 
                  tradeCount: existingTrades.length, // Keep existing trades count
                  tradesUpdated: 0,
                  tradesCreated: 0,
                  tradesDeleted: 0,
                  failedUpdates: 0,
                  skippedDueToEmptyDrive: true, // Flag to indicate we skipped due to empty Drive
                } 
              }));
              
              // Update sync state and return early
              const metadata = await driveService.getFileMetadata(targetFileId);
              const syncedVersion = metadata.headRevisionId || metadata.version || null;
              const currentSyncTime = new Date().toISOString();
              
              syncStateRef.current = {
                ...syncStateRef.current,
                lastSyncTime: currentSyncTime,
                localVersion: syncedVersion,
                remoteVersion: syncedVersion,
                isSyncing: false,
                error: null,
              };
              
              setSyncState(prev => ({
                ...prev,
                lastSyncTime: currentSyncTime,
                localVersion: syncedVersion,
                remoteVersion: syncedVersion,
                isSyncing: false,
                error: null,
              }));
              
              return; // Exit early - don't delete Firebase trades
            }
            
            // Delete removed trades
            // Use Promise.allSettled to handle permission errors gracefully
            // Some trades might not have the correct uid field, causing Firestore permission errors
            let successfulDeletions = 0; // Initialize to 0 in case no deletions are needed
            let skippedDeletions = 0; // Initialize to 0
            let failedDeletions: PromiseSettledResult<boolean>[] = []; // Initialize to empty array
            // Track healed trades (trades that failed with permission-denied - treat as deleted locally)
            const healedTradeIds = new Set<string>();
            // Note: failedUpdateIds is declared outside this block for use in event dispatch
            
            if (tradesToDelete.length > 0) {
              const deletionResults = await Promise.allSettled(
                tradesToDelete.map(id => {
                  // Find the trade in existingTrades to get its uid (to avoid getDoc permission errors)
                  const tradeToDelete = existingTrades.find(t => t.id === id);
                  const existingUid = tradeToDelete?.uid;
                  
                  
                  
                  return TradeService.deleteTrade(user.uid, id, existingUid);
                })
              );
              
              // Count actual deletions (returned true) vs skipped (returned false)
              successfulDeletions = deletionResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
              skippedDeletions = deletionResults.filter(r => r.status === 'fulfilled' && r.value === false).length;
              failedDeletions = deletionResults.filter(r => r.status === 'rejected');
              
              // ☢️ CLIENT-SIDE HEALING: Track skipped deletions as "healed" (permission-denied = treat as deleted locally)
              deletionResults.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value === false) {
                  // Trade was skipped (permission-denied) - treat as "healed" (deleted locally)
                  const tradeId = tradesToDelete[index];
                  healedTradeIds.add(tradeId);
                  
                  
                }
              });
              
              if (skippedDeletions > 0) {
                console.warn(`⚠️ ${skippedDeletions} trades were skipped (permission denied - they may be orphaned or belong to a different user)`);
              }
              if (failedDeletions.length > 0) {
                console.warn('⚠️ Some trades could not be deleted (unexpected error):', failedDeletions.length);
                const orphanedTradeIds: string[] = [];
                failedDeletions.forEach((result, index) => {
                  if (result.status === 'rejected') {
                    const tradeId = tradesToDelete[index];
                    const errorMessage = result.reason?.message || result.reason?.code || 'Permission denied';
                    const errorCode = result.reason?.code;
                    const errorName = result.reason?.name;
                    const errorStack = result.reason?.stack;
                    
                    console.warn(`  - Trade ${tradeId}: ${errorMessage}`, {
                      code: errorCode,
                      name: errorName,
                      message: errorMessage,
                      stack: errorStack,
                    });
                    
                    // ☢️ CLIENT-SIDE HEALING: Track failed deletions with permission-denied as "healed"
                    if (errorCode === 'permission-denied') {
                      healedTradeIds.add(tradeId);
                      orphanedTradeIds.push(tradeId);
                      
                      
                    }
                    
                    
                  }
                });
                
                // Store orphaned trade IDs in localStorage to exclude them from future syncs
                if (orphanedTradeIds.length > 0) {
                  try {
                    const existingOrphaned = JSON.parse(localStorage.getItem('orphanedTradeIds') || '[]');
                    const combinedOrphaned = [...new Set([...existingOrphaned, ...orphanedTradeIds])];
                    localStorage.setItem('orphanedTradeIds', JSON.stringify(combinedOrphaned));
                    console.warn(`⚠️ Marked ${orphanedTradeIds.length} trades as orphaned (will be excluded from future syncs)`);
                    
                  } catch (e) {
                    console.error('Failed to store orphaned trade IDs:', e);
                  }
                }
              }
              
              if (successfulDeletions > 0) {
                console.log('✅ Deleted', successfulDeletions, 'trades not in Drive');
              }
              
              
            } else {
              
            }
            
            // Update existing trades (this allows edits to quantity, dates, etc. to work)
            if (tradesToUpdate.length > 0) {
              
              
              const updateResults = await Promise.allSettled(
                tradesToUpdate.map(({ id, data }) => {
                  // Find the matched trade to get its uid (to avoid getDoc permission errors)
                  const matchedTrade = existingTradesMap.get(id) || Array.from(existingTradesMap.values()).find(t => {
                    // Fallback: find by content if ID doesn't match
                    const getMatchKey = (trade: Trade) => `${trade.ticker}-${trade.date}-${trade.type}-${trade.price}-${trade.qty || 0}`;
                    return getMatchKey(t) === getMatchKey(data as any);
                  });
                  
                  const existingUid = matchedTrade?.uid;
                  
                  
                  return TradeService.updateTrade(user.uid, id, data, existingUid);
                })
              );
              
              const successfulUpdates = updateResults.filter(r => r.status === 'fulfilled').length;
              const failedUpdates = updateResults.filter(r => r.status === 'rejected');
              
              // ☢️ CLIENT-SIDE HEALING: Track failed updates with permission-denied as "healed"
              // Note: failedUpdateIds is declared outside this block for use in event dispatch
              if (failedUpdates.length > 0) {
                console.warn('⚠️ Some trades could not be updated:', failedUpdates.length);
                failedUpdates.forEach((result, index) => {
                  if (result.status === 'rejected') {
                    const tradeId = tradesToUpdate[index].id;
                    const error = result.reason;
                    const errorDetails = {
                      message: error?.message || String(error),
                      code: error?.code || error?.status,
                      name: error?.name,
                    };
                    console.warn(`  - Trade ${tradeId}:`, errorDetails);
                    
                    // Track failed updates with permission-denied as "healed" (for UI filtering)
                    if (errorDetails.code === 'permission-denied') {
                      healedTradeIds.add(tradeId);
                      
                      
                    }
                    
                    // CRITICAL: Track ALL failed updates (not just permission-denied) to prevent overwriting Drive edits
                    // When an update fails, Firebase has stale data, but Drive has the correct data
                    // We must NOT upload the stale Firebase data back to Drive
                    failedUpdateIds.add(tradeId);
                    
                    
                  }
                });
              }
              
              if (successfulUpdates > 0) {
                console.log('✅ Updated', successfulUpdates, 'existing trades from Drive');
              }
              
            }
            
            // Create new trades
            if (tradesToCreate.length > 0) {
              await TradeService.importTrades(user.uid, tradesToCreate);
              console.log('✅ Created', tradesToCreate.length, 'new trades from Drive');
              
            }
            
            // ☢️ CLIENT-SIDE HEALING: Store healed trades in localStorage to exclude from future syncs
            if (healedTradeIds.size > 0) {
              try {
                const existingHealed = JSON.parse(localStorage.getItem('healedTradeIds') || '[]');
                const combinedHealed = [...new Set([...existingHealed, ...Array.from(healedTradeIds)])];
                localStorage.setItem('healedTradeIds', JSON.stringify(combinedHealed));
                console.log(`☢️ [HEALING] Marked ${healedTradeIds.size} trades as healed (permission-denied - treating as deleted locally)`);
                
                
              } catch (e) {
                console.error('Failed to store healed trade IDs:', e);
              }
            }
            
            // CRITICAL: Store failed update IDs to prevent overwriting Drive edits
            // When an update fails, Firebase has stale data, but Drive has the correct data
            // We must NOT upload the stale Firebase data back to Drive, or it will overwrite the Drive edit
            if (failedUpdateIds.size > 0) {
              try {
                const existingFailed = JSON.parse(localStorage.getItem('failedUpdateTradeIds') || '[]');
                const combinedFailed = [...new Set([...existingFailed, ...Array.from(failedUpdateIds)])];
                localStorage.setItem('failedUpdateTradeIds', JSON.stringify(combinedFailed));
                console.warn(`⚠️ [FAILED UPDATES] Marked ${failedUpdateIds.size} trades as failed to update - will NOT upload stale Firebase state to Drive (preserving Drive edits)`);
                
                
              } catch (e) {
                console.error('Failed to store failed update trade IDs:', e);
              }
            }
            
            // Update sync results
            syncResults.tradesUpdated = tradesToUpdate.length;
            syncResults.tradesCreated = tradesToCreate.length;
            syncResults.tradesDeleted = successfulDeletions; // Use actual successful deletions count, not total attempted
            
            if (tradesToUpdate.length === 0 && tradesToCreate.length === 0 && tradesToDelete.length === 0) {
              console.log('✅ No changes needed (Firebase matches Drive)');
            } else {
              const skippedDeletionsCount = tradesToDelete.length - successfulDeletions - failedDeletions.length;
              if (skippedDeletionsCount > 0) {
                console.warn(`⚠️ Note: ${skippedDeletionsCount} trades were skipped (permission denied - they may be orphaned or belong to a different user). These trades will not appear in the UI since getTrades() filters by uid.`);
              }
              const deletionStatus = skippedDeletionsCount > 0 ? `, ${skippedDeletionsCount} skipped` : (failedDeletions.length > 0 ? `, ${failedDeletions.length} failed` : '');
              console.log('✅ Updated Firebase with', driveData.trades.length, 'trades from Drive (', tradesToUpdate.length, 'updated,', tradesToCreate.length, 'created,', successfulDeletions, 'deleted' + deletionStatus + ')');
            }
          } catch (firebaseError) {
            console.error('❌ Error updating Firebase from Drive:', firebaseError);
            // Don't throw - localStorage is already updated
            // But we should still prevent auto-sync to avoid overwriting
          }
        }
        
        // Notify callback if provided (for additional updates)
        if (onTradesUpdated) {
          onTradesUpdated(driveData.trades);
        }
        
        // Trigger a page reload or state refresh to reflect changes
        // Firebase is now updated, so refreshTrades() will load correct data
        console.log('📢 Dispatching drive-sync-complete event with', driveData.trades.length, 'trades', syncResults);
        
        window.dispatchEvent(new CustomEvent('drive-sync-complete', { 
          detail: { 
            tradeCount: driveData.trades.length,
            tradesUpdated: syncResults.tradesUpdated,
            tradesCreated: syncResults.tradesCreated,
            tradesDeleted: syncResults.tradesDeleted,
            failedUpdates: failedUpdateIds.size, // Track failed updates for debugging
          } 
        }));
      }
      
      // VERSION-BASED SYNC: Update file metadata after sync to get the version
      const metadata = await driveService.getFileMetadata(targetFileId);
      // Prioritize headRevisionId for better manual edit detection
      const syncedVersion = metadata.headRevisionId || metadata.version || null;
      
      // CRITICAL: Use current time for lastSyncTime to track when we last synced (for staleness checks)
      // metadata.modifiedTime is the Drive file's modified time, which may be old
      // We need to track when WE synced, not when Drive was last modified
      const currentSyncTime = new Date().toISOString();
      
      // CRITICAL: Update ref immediately with new version to prevent polling from pulling again
      syncStateRef.current = {
        ...syncStateRef.current,
        localVersion: syncedVersion, // Update localVersion to match what we just synced
        remoteVersion: syncedVersion,
        lastSyncTime: currentSyncTime, // Use current time to track when we last synced
        lastContentCheckTime: Date.now(), // Update content check time
      };
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        localVersion: syncedVersion, // Update localVersion to match what we just synced
        remoteVersion: syncedVersion,
        lastSyncTime: currentSyncTime, // Use current time to track when we last synced
        lastContentCheckTime: Date.now(), // Update content check time
        jsonFileMetadata: metadata,
      }));
      
      
      
      
    } catch (error: any) {
      console.error('Error syncing from Drive:', error);
      
      // Handle JSON parse errors specially - DO NOT overwrite local data
      if (error?.code === 'INVALID_JSON') {
        console.error('❌ Drive file contains invalid JSON. Sync paused to prevent data loss.');
        
        // CRITICAL: Do NOT overwrite local data when JSON is invalid
        // Set error state but keep local data intact
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          error: `❌ Sync Paused: Drive file contains invalid JSON. Please check for syntax errors (trailing commas, missing quotes, etc.) in Google Drive. Your local data is safe and unchanged.`,
          conflictDetected: true, // Mark as conflict to prevent auto-sync
        }));

        // Dispatch custom event for toast notification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync-error', {
            detail: {
              type: 'invalid_json',
              message: '❌ Sync Paused: Drive file contains invalid JSON. Please check for syntax errors.',
              action: 'fix_json'
            }
          }));
        }
      } else {
        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          error: error instanceof Error ? error.message : 'Sync failed',
        }));
      }
    }
  }, [isAuthenticated, user]);

  /**
   * Check for updates on Drive (called on app load)
   */
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (!syncState.isConnected || !syncState.fileId) {
      return;
    }

    try {
      const metadata = await driveService.getFileMetadata(syncState.fileId);
      const driveTime = new Date(metadata.modifiedTime).getTime();
      const lastSyncTime = syncState.lastSyncTime 
        ? new Date(syncState.lastSyncTime).getTime() 
        : 0;

      if (driveTime > lastSyncTime) {
        // Drive has newer data - pull it
        await syncFromDrive();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [syncState.isConnected, syncState.fileId, syncState.lastSyncTime, syncFromDrive]);

  /**
   * Start polling Drive for changes (real-time sync)
   */
  const startPolling = useCallback(() => {
    // Guard: Don't start if already polling
    if (pollIntervalRef.current) {
      console.log('⏸️ Polling already active, skipping duplicate start');
      return;
    }

    // Clear any existing timeout (we use setTimeout recursively, not setInterval)
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current as any);
      pollIntervalRef.current = null;
    }

    // Only poll if connected
    const currentState = syncStateRef.current;
    if (!currentState.isConnected || !currentState.fileId) {
      return;
    }

    console.log('🔄 Starting Drive polling for real-time sync (VERSION-BASED)...');
    
    
    
    // VERSION-BASED POLLING: Poll every 2 seconds for real-time sync
    // Using POLL_INTERVAL_MS (2 seconds) for responsive real-time sync
    // Version comparison is efficient and can handle frequent polling
    // Reset error count and interval on successful start
    consecutiveErrorsRef.current = 0;
    currentPollIntervalRef.current = POLL_INTERVAL_MS;
    
    const pollFunction = async () => {
      try {
        // Get latest state from ref
        const state = syncStateRef.current;
        
        
        
        if (!state.isConnected || !state.fileId) {
          
          return;
        }

        // CRITICAL: Check edit lock - pause polling if user is actively editing (within last 10 seconds)
        const timeSinceLastEdit = editLockRef.current > 0 ? Date.now() - editLockRef.current : Infinity;
        const shouldSkipDueToEditLock = timeSinceLastEdit < 10000; // 10 second window after last edit
        
        if (shouldSkipDueToEditLock) {
          
          return; // Skip this polling cycle
        }

        // CRITICAL: Skip pulling if CSV import is in progress (within last 20 seconds)
        const timeSinceCsvImport = csvImportInProgressRef.current > 0 ? Date.now() - csvImportInProgressRef.current : Infinity;
        const shouldSkipDueToCsvImport = timeSinceCsvImport < 20000;
        
        // CRITICAL: Skip pulling if deletion is in progress (within last 120 seconds)
        // Match the deletion grace period in syncFromDrive to prevent pulling back deleted trades
        // Increased from 30s to 120s to ensure deletion sync completes before polling resumes
        const timeSinceDeletion = deletionInProgressRef.current > 0 ? Date.now() - deletionInProgressRef.current : Infinity;
        const shouldSkipDueToDeletion = timeSinceDeletion < 120000; // 120 seconds (match syncFromDrive grace period)
        
        // CRITICAL: Skip polling if we recently skipped due to empty Drive (prevents sync loop)
        // This gives syncToDrive time to upload Firebase trades to Drive
        const timeSinceEmptyDriveSkip = lastEmptyDriveSkipRef.current > 0 ? Date.now() - lastEmptyDriveSkipRef.current : Infinity;
        const shouldSkipDueToEmptyDrive = timeSinceEmptyDriveSkip < 60000; // 60 second cooldown after skipping

        if (shouldSkipDueToCsvImport || shouldSkipDueToDeletion || shouldSkipDueToEmptyDrive) {
          
          return; // Skip this polling cycle
        }
        
        // CRITICAL: Skip pulling if upload is in progress or just completed (within last 30 seconds)
        // Increased from 10s to 30s to account for slow Drive API responses
        // This prevents polling from overwriting user edits that were just synced to Drive
        const timeSinceLastUpload = lastUploadTimeRef.current > 0 ? Date.now() - lastUploadTimeRef.current : Infinity;
        const shouldSkipDueToUpload = timeSinceLastUpload < 30000; // 30 second window after upload (increased from 10s)
        
        if (shouldSkipDueToUpload) {
          
          return; // Skip this polling cycle
        }
        
        

        // VERSION-BASED SYNC: Fetch metadata with version/headRevisionId
        let metadata;
        try {
          metadata = await driveService.getFileMetadata(state.fileId);
          
        } catch (metadataError: any) {
          // Improved error logging with full details
          const errorDetails = {
            message: metadataError?.message || String(metadataError),
            code: metadataError?.code || metadataError?.status || metadataError?.result?.error?.code,
            stack: metadataError?.stack,
            name: metadataError?.name,
            fileId: state.fileId,
          };
          console.error('❌ Error fetching Drive metadata in polling:', JSON.stringify(errorDetails, null, 2));
          
          return; // Skip this polling cycle if metadata fetch fails
        }
        
        // CRITICAL: Check headRevisionId FIRST, before setting remoteVersion
        // This ensures we detect changes even if version field is stale
        // CRITICAL FIX: Use ref instead of state to get the latest version (state is stale in closure)
        let localVersion = syncStateRef.current.localVersion;
        
        // CRITICAL: If headRevisionId changed, pull immediately (even before version comparison)
        // This handles cases where Drive API returns different headRevisionId but same version
        
        
        if (metadata.headRevisionId && metadata.headRevisionId !== localVersion) {
          console.log('🔄 headRevisionId changed - pulling from Drive (Drive was edited)', {
            localVersion,
            metadataHeadRevisionId: metadata.headRevisionId,
            metadataVersion: metadata.version,
          });
          
          
          
          await syncFromDrive();
          
          // CRITICAL: Mark that we just synced from Drive to prevent auto-sync overwrite
          lastDriveSyncTimeRef.current = Date.now();
          
          // Update state after sync
          const updatedMetadata = await driveService.getFileMetadata(state.fileId);
          const newVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
          const currentSyncTime = new Date().toISOString(); // Use current time to track when we last synced
          setSyncState(prev => ({
            ...prev,
            localVersion: newVersion,
            remoteVersion: newVersion,
            lastSyncTime: currentSyncTime, // Use current time to track when we last synced
            lastContentCheckTime: Date.now(), // Update content check time
            jsonFileMetadata: updatedMetadata,
          }));
          
          return; // Pulled from Drive - exit early
        }
        
        // CRITICAL: Prioritize headRevisionId over version for manual Drive edits
        // headRevisionId changes on EVERY edit (manual or API), while version might not
        // This ensures manual Drive edits are detected even if version doesn't increment
        let remoteVersion = metadata.headRevisionId || metadata.version || null;
        
        
        
        // CRITICAL: If localVersion is null (not initialized), initialize it now
        // This handles cases where the app reconnected but versions weren't set
        if (localVersion === null && remoteVersion !== null) {
          console.log('⚠️ Local version was null, initializing from Drive:', remoteVersion);
          
          localVersion = remoteVersion;
          // Update state immediately
          setSyncState(prev => ({
            ...prev,
            localVersion: remoteVersion,
            remoteVersion,
            jsonFileMetadata: metadata,
          }));
        }
        
        
        
        // FALLBACK: If version still not available, try revisions API
        if (!remoteVersion) {
          remoteVersion = await driveService.getHeadRevisionId(state.fileId);
          
        }
        
        

        // CRITICAL FIX (Google Partner Engineering): Removed modifiedByMe check
        // The "Identity Trap": modifiedByMe returns true for BOTH app uploads AND manual Drive edits
        // We cannot distinguish source by user identity. Rely on version comparison only.
        // If remoteVersion > localVersion, ALWAYS pull (regardless of who modified it)
        // Our own uploads are protected by version state: after upload, localVersion = remoteVersion,
        // so the next poll will see versions match and skip (no pull needed)
        
        
        
        // VERSION COMPARISON LOGIC:
        // - Remote > Local: PULL (Drive has update)
        // - Remote == Local: Check modifiedTime/fileSize/content - if different, PULL (Drive was edited)
        // - Remote < Local: PUSH (We have unsaved changes - handled in syncToDrive)
        // - Remote is null: Fallback to timestamp comparison
        // NOTE: headRevisionId check already done above (early check before remoteVersion assignment)
        
        if (remoteVersion === null) {
          // FALLBACK: If version fields aren't available, use timestamp comparison
          // This handles cases where Drive API doesn't return version/headRevisionId
          const driveTime = new Date(metadata.modifiedTime).getTime();
          // Use jsonFileMetadata.modifiedTime (Drive's modified time when we last synced) for comparison
          // NOT lastSyncTime (which is when we last synced, not Drive's modified time)
          const lastSyncDriveTime = state.jsonFileMetadata?.modifiedTime
            ? new Date(state.jsonFileMetadata.modifiedTime).getTime()
            : (state.lastSyncTime ? new Date(state.lastSyncTime).getTime() : 0);
          
          
          
          // CRITICAL: Use a smaller threshold (100ms) to detect even small timestamp changes
          // This ensures manual Drive edits are detected even if timestamps are close
          if (driveTime > lastSyncDriveTime + 100) {
            // Drive is newer - pull changes
            console.log('🔄 Drive has newer data (timestamp fallback), pulling changes...');
            
            
            
            await syncFromDrive();
            
            // Update state after sync
            const updatedMetadata = await driveService.getFileMetadata(state.fileId);
            const currentSyncTime = new Date().toISOString(); // Use current time for staleness checks
            setSyncState(prev => ({
              ...prev,
              lastSyncTime: currentSyncTime, // Use current time to track when we last synced
              lastContentCheckTime: Date.now(), // Update content check time
              jsonFileMetadata: updatedMetadata,
            }));
          }
          return; // Skip version-based logic
        }

        // DEBUG: Log version check BEFORE comparison to see what's happening
        // HYPOTHESIS E: Check if state vs ref mismatch
        const refLocalVersion = syncStateRef.current.localVersion;
        const stateLocalVersion = state.localVersion;
        const versionMismatch = refLocalVersion !== stateLocalVersion;
        
        console.log('🔍 Polling version check:', {
          localVersion,
          remoteVersion,
          versionsMatch: localVersion === remoteVersion,
          localVersionType: typeof localVersion,
          remoteVersionType: typeof remoteVersion,
          metadataVersion: metadata.version,
          metadataHeadRevisionId: metadata.headRevisionId,
          modifiedTime: metadata.modifiedTime,
          refLocalVersion,
          stateLocalVersion,
          versionMismatch,
        });
        
        

        if (remoteVersion === localVersion) {
          // Versions match - but check modifiedTime to detect manual Drive edits
          // CRITICAL: Drive's modifiedTime is more reliable than version for detecting manual edits
          // If Drive's modifiedTime is newer than our lastSyncTime, Drive was edited (even if versions match)
          const driveModifiedTime = metadata.modifiedTime ? new Date(metadata.modifiedTime).getTime() : 0;
          const lastSyncTime = state.lastSyncTime ? new Date(state.lastSyncTime).getTime() : 0;
          // CRITICAL: Use smaller threshold (100ms) to detect Drive edits even when timestamps are very close
          // Also check if Drive's modifiedTime is different (not just newer) to catch edits that happened at the same time
          const driveWasModifiedAfterLastSync = driveModifiedTime > lastSyncTime + 100; // 100ms threshold
          const driveModifiedTimeIsDifferent = driveModifiedTime !== lastSyncTime && driveModifiedTime > 0 && lastSyncTime > 0;
          
          // NEW: Also check file size - if size changed, file was definitely edited
          // This catches cases where version and modifiedTime don't change but content did
          const fileSizeChanged = metadata.size && state.jsonFileMetadata?.size && 
                                  metadata.size !== state.jsonFileMetadata.size;
          
          
          
          if (driveWasModifiedAfterLastSync || driveModifiedTimeIsDifferent || fileSizeChanged) {
            // Drive was modified after our last sync - pull changes even though versions match
            // This handles cases where version doesn't increment on manual edits, or race conditions
            console.log('🔄 Versions match but Drive was modified - pulling changes (first edit wins)...', {
              driveModifiedTime,
              lastSyncTime,
              timeDiff: driveModifiedTime - lastSyncTime,
              driveWasModifiedAfterLastSync,
              driveModifiedTimeIsDifferent,
              fileSizeChanged,
              currentSize: metadata.size,
              previousSize: state.jsonFileMetadata?.size
            });
            
            
            
            // Pull changes from Drive (Drive edit was first)
            await syncFromDrive();
            
            // CRITICAL: Mark that we just synced from Drive to prevent auto-sync overwrite
            lastDriveSyncTimeRef.current = Date.now();
            
            // Update state after sync
            const updatedMetadata = await driveService.getFileMetadata(state.fileId);
            // Prioritize headRevisionId for better manual edit detection
            const newVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
            const currentSyncTime = new Date().toISOString(); // Use current time to track when we last synced
            setSyncState(prev => ({
              ...prev,
              localVersion: newVersion,
              remoteVersion: newVersion,
              lastSyncTime: currentSyncTime, // Use current time to track when we last synced
              lastContentCheckTime: Date.now(), // Update content check time
              jsonFileMetadata: updatedMetadata,
            }));
            
            return; // Pulled from Drive
          }
          
          // NEW: Content-based detection fallback
          // If all metadata checks pass but we haven't checked content recently,
          // download and compare actual file content to detect manual Drive edits
          // that don't update metadata (headRevisionId, modifiedTime, size)
          const timeSinceLastContentCheck = Date.now() - (state.lastContentCheckTime || 0);
          const CONTENT_CHECK_INTERVAL_MS = 3000; // Check content every 3 seconds (reduced from 5 for faster detection)
          
          // CRITICAL: Also check content if modifiedTime is old but we haven't synced in a while
          // This handles cases where metadata is stale but file was actually edited
          // Use ref for more accurate timing (state may be stale)
          const lastSyncTimeToUse = syncStateRef.current.lastSyncTime || state.lastSyncTime;
          const timeSinceLastSync = lastSyncTimeToUse ? Date.now() - new Date(lastSyncTimeToUse).getTime() : Infinity;
          const STALE_SYNC_THRESHOLD_MS = 30000; // 30 seconds - if we haven't synced in 30 seconds, force content check (reduced from 60s)
          const shouldForceContentCheck = timeSinceLastSync > STALE_SYNC_THRESHOLD_MS;
          
          // CRITICAL: Always check content if metadata shows no change but significant time has passed
          // This ensures we catch manual Drive edits even when metadata is stale
          const shouldCheckContent = (timeSinceLastContentCheck > CONTENT_CHECK_INTERVAL_MS) || shouldForceContentCheck;
          
          // CRITICAL: If all metadata checks passed but we haven't synced recently, ALWAYS check content
          // This is the most reliable way to detect manual Drive edits when metadata is stale
          // REDUCED to 5 seconds to catch edits faster
          const shouldAlwaysCheckContent = !driveWasModifiedAfterLastSync && !driveModifiedTimeIsDifferent && !fileSizeChanged && timeSinceLastSync > 5000; // 5 seconds (reduced from 10s)
          
          // CRITICAL: If metadata shows no change but we haven't checked content recently, ALWAYS check
          // This ensures we catch manual Drive edits even when Google Drive API returns stale metadata
          const shouldCheckContentRegardless = !driveWasModifiedAfterLastSync && !driveModifiedTimeIsDifferent && !fileSizeChanged && timeSinceLastContentCheck > 2000; // Check every 2 seconds if metadata shows no change
          
          
          
          if ((shouldCheckContent || shouldAlwaysCheckContent || shouldCheckContentRegardless) && !driveWasModifiedAfterLastSync && !driveModifiedTimeIsDifferent && !fileSizeChanged && user?.uid) {
            try {
              // Download file content from Drive
              const driveData = await driveService.downloadPortfolioFile(state.fileId);
              
              // Get current local trades from Firebase
              // 🔥 CRITICAL: Force server fetch to prevent stale cache
              const currentTrades = await TradeService.getTrades(user.uid, true); // forceServerFetch = true
              
              // Compare trade counts and content (not just IDs, since Drive uses CSV IDs while Firebase uses generated IDs)
              // CRITICAL: Use stable keys (ticker+date+type) to find matching trades, then compare qty/price
              // This allows us to detect edits even when qty/price change
              const getStableMatchKey = (trade: any) => {
                const normalizedDate = trade.date instanceof Date 
                  ? trade.date.toISOString() 
                  : (typeof trade.date === 'string' ? new Date(trade.date).toISOString() : String(trade.date));
                return `${String(trade.ticker || '').toUpperCase()}-${normalizedDate}-${String(trade.type || '').toUpperCase()}`;
              };
              
              // Create maps of trades by stable key for comparison
              const driveTradesByStableKey = new Map<string, any>();
              for (const trade of driveData.trades) {
                const key = getStableMatchKey(trade);
                if (!driveTradesByStableKey.has(key)) {
                  driveTradesByStableKey.set(key, trade);
                }
              }
              
              const localTradesByStableKey = new Map<string, any>();
              for (const trade of currentTrades) {
                const key = getStableMatchKey(trade);
                if (!localTradesByStableKey.has(key)) {
                  localTradesByStableKey.set(key, trade);
                }
              }
              
              // Check if counts differ
              const countDiffers = driveData.trades.length !== currentTrades.length;
              
              // Check if any trade has different qty/price (even if stable key matches)
              let contentDiffers = false;
              const diffDetails: Array<{stableKey: string, ticker: string, driveQty: number, localQty: number, drivePrice: number, localPrice: number, qtyDiff: number, priceDiff: number}> = [];
              const comparisonDetails: Array<{stableKey: string, ticker: string, driveQty: number, localQty: number, drivePrice: number, localPrice: number, qtyDiff: number, priceDiff: number, differs: boolean}> = [];
              
              for (const [stableKey, driveTrade] of driveTradesByStableKey.entries()) {
                const localTrade = localTradesByStableKey.get(stableKey);
                if (!localTrade) {
                  contentDiffers = true; // Trade exists in Drive but not in Firebase
                  diffDetails.push({stableKey, ticker: driveTrade.ticker || '', driveQty: driveTrade.qty || driveTrade.quantity || 0, localQty: 0, drivePrice: typeof driveTrade.price === 'number' ? driveTrade.price : parseFloat(String(driveTrade.price)) || 0, localPrice: 0, qtyDiff: Infinity, priceDiff: Infinity});
                  break;
                }
                // Compare qty and price
                const driveQty = driveTrade.qty || driveTrade.quantity || 0;
                const localQty = localTrade.qty || 0;
                const drivePrice = typeof driveTrade.price === 'number' ? driveTrade.price : parseFloat(String(driveTrade.price || '0')) || 0;
                const localPrice = typeof localTrade.price === 'number' ? localTrade.price : parseFloat(String(localTrade.price || '0')) || 0;
                const qtyDiff = Math.abs(driveQty - localQty);
                const priceDiff = Math.abs(drivePrice - localPrice);
                const differs = qtyDiff > 0.0001 || priceDiff > 0.0001;
                
                comparisonDetails.push({stableKey, ticker: driveTrade.ticker || '', driveQty, localQty, drivePrice, localPrice, qtyDiff, priceDiff, differs});
                
                if (differs) {
                  contentDiffers = true;
                  diffDetails.push({stableKey, ticker: driveTrade.ticker || '', driveQty, localQty, drivePrice, localPrice, qtyDiff, priceDiff});
                  // Don't break - collect all differences for logging
                }
              }
              
              
              
              // Also check if any local trade doesn't exist in Drive
              if (!contentDiffers) {
                for (const [stableKey, localTrade] of localTradesByStableKey.entries()) {
                  if (!driveTradesByStableKey.has(stableKey)) {
                    contentDiffers = true;
                    break;
                  }
                }
              }
              
              const finalTradesDiffer = countDiffers || contentDiffers;
              
              
              
              if (finalTradesDiffer) {
                console.log('🔄 Content-based detection: Drive content differs from local (manual edit detected)', {
                  driveTradeCount: driveData.trades.length,
                  localTradeCount: currentTrades.length,
                  countDiffers,
                  contentDiffers,
                  diffDetailsCount: diffDetails.length,
                  diffDetails: diffDetails.slice(0, 3),
                });
                
                
                
                // Pull changes from Drive
                await syncFromDrive();
                
                // CRITICAL: Mark that we just synced from Drive to prevent auto-sync overwrite
                lastDriveSyncTimeRef.current = Date.now();
                
                // Update state after sync
                const updatedMetadata = await driveService.getFileMetadata(state.fileId);
                // Prioritize headRevisionId for better manual edit detection
                const newVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
                const currentSyncTime = new Date().toISOString(); // Use current time to track when we last synced
                setSyncState(prev => ({
                  ...prev,
                  localVersion: newVersion,
                  remoteVersion: newVersion,
                  lastSyncTime: currentSyncTime, // Use current time to track when we last synced
                  jsonFileMetadata: updatedMetadata,
                  lastContentCheckTime: Date.now(),
                }));
                
                return; // Pulled from Drive
              }
              
              // No differences found - update lastContentCheckTime
              setSyncState(prev => ({
                ...prev,
                remoteVersion,
                jsonFileMetadata: metadata,
                lastContentCheckTime: Date.now(),
              }));
            } catch (error: any) {
              console.error('Error in content-based check:', error);
              
              // Continue with normal flow even if content check fails
            }
          }
          
          // Versions match and Drive wasn't modified - no changes
          setSyncState(prev => ({
            ...prev,
            remoteVersion,
            jsonFileMetadata: metadata,
          }));
          return; // IDLE - no changes
        }

        // Remote version is different - check if it's newer
        // CRITICAL: Revision IDs are strings (like "abc123"), not numbers
        // We can't compare them numerically, so we check if they're different
        // If remote version is different from local, it means Drive was modified
        const versionsAreDifferent = localVersion !== remoteVersion;
        // HYPOTHESIS B: Fix isRemoteNewer to handle null localVersion correctly
        // CRITICAL: If versions are different, assume remote is newer (Drive was edited)
        // We can't compare revision IDs numerically, so any difference means Drive changed
        const isRemoteNewer = (localVersion === null && remoteVersion !== null) || 
                              (versionsAreDifferent && remoteVersion !== null && localVersion !== null);
        
        
        
        // CRITICAL: Detect if Drive was modified externally (not by us)
        // If remoteVersion > localVersion AND modifiedByMe is false, Drive was edited externally
        // In this case, we should pull AND block auto-sync for longer to prevent overwriting
        const wasModifiedExternally = isRemoteNewer && metadata.lastModifyingUser?.me === false;
        
        // DEBUG: Log version comparison to diagnose why changes aren't detected
        console.log('🔍 Polling check:', {
          localVersion,
          remoteVersion,
          versionsAreDifferent,
          isRemoteNewer,
          isRecentDeletion: timeSinceDeletion < 30000,
          willPull: isRemoteNewer && timeSinceDeletion >= 30000,
        });
        
        
        
        
        
        // CRITICAL: Also check if deletion is in progress - don't pull if we just deleted
        // Reuse timeSinceDeletion from above (already calculated)
        const isRecentDeletion = timeSinceDeletion < 30000; // 30 seconds
        
        
        
        // CRITICAL: Don't pull if we just deleted trades (even if version changed)
        if (isRecentDeletion) {
          console.log('⏸️ Skipping Drive pull - deletion in progress (prevents pulling back deleted trades)');
          
          // Update version to match remote, but don't pull data
          setSyncState(prev => ({
            ...prev,
            remoteVersion,
            jsonFileMetadata: metadata,
          }));
          return;
        }

        // Only pull if remote is actually newer (not just different)
        if (!isRemoteNewer) {
          // Remote is older or same - this shouldn't happen, but log it
          
          // Update remoteVersion in state but don't pull
          setSyncState(prev => ({
            ...prev,
            remoteVersion,
            jsonFileMetadata: metadata,
          }));
          return;
        }
        
        

        // Remote version is newer and not our own upload - PULL IMMEDIATELY
        // Deduplication: Check if we're already syncing this version
        const syncKey = `${state.fileId}-${remoteVersion}`;
        const isDuplicateSync = recentSyncsRef.current.has(syncKey);
        
        
        
        if (isDuplicateSync) {
          console.log(`⏸️ Skipping duplicate sync for version ${remoteVersion} (already in progress)`);
          
          return;
        }
        
        // Mark this sync as in progress
        recentSyncsRef.current.add(syncKey);
        // Clean up after 10 seconds (increased to handle slower syncs)
        setTimeout(() => {
          recentSyncsRef.current.delete(syncKey);
        }, 10000);
        
        console.log(`🔄 Drive version changed: Local v${localVersion} → Remote v${remoteVersion}, pulling changes...`);
        
        
        
        
        
        try {
          await syncFromDrive();
          
          // CRITICAL: If Drive was modified externally, extend the auto-sync block
          // This prevents auto-sync from overwriting external edits immediately after pulling
          if (wasModifiedExternally) {
            // Extend the block to 15 seconds for external modifications
            lastDriveSyncTimeRef.current = Date.now();
            
          }
          
          
        } catch (syncError: any) {
          
          console.error('Error in syncFromDrive during polling:', syncError);
          throw syncError; // Re-throw to be caught by outer try-catch
        }
        
        // Update state with new version after sync
        const updatedMetadata = await driveService.getFileMetadata(state.fileId);
        // Prioritize headRevisionId for better manual edit detection
        const newRemoteVersion = updatedMetadata.headRevisionId || updatedMetadata.version || null;
        setSyncState(prev => ({
          ...prev,
          localVersion: newRemoteVersion, // Update localVersion to match what we just synced
          remoteVersion: newRemoteVersion,
          jsonFileMetadata: updatedMetadata,
        }));
      } catch (error: any) {
        // Improved error logging
        const errorDetails = {
          message: error?.message || String(error),
          code: error?.code || error?.status || error?.result?.error?.code,
          stack: error?.stack,
          name: error?.name,
        };
        console.error('❌ Error polling Drive:', JSON.stringify(errorDetails, null, 2));
        
        // Track consecutive errors for backoff
        consecutiveErrorsRef.current++;
        const MAX_CONSECUTIVE_ERRORS = 3;
        
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          // Increase polling interval on repeated errors (exponential backoff)
          const backoffMultiplier = Math.min(Math.pow(2, consecutiveErrorsRef.current - MAX_CONSECUTIVE_ERRORS), 8); // Max 8x
          currentPollIntervalRef.current = POLL_INTERVAL_MS * backoffMultiplier;
          console.warn(`⚠️ Multiple polling errors (${consecutiveErrorsRef.current}), backing off to ${currentPollIntervalRef.current}ms`);
          // Note: The recursive setTimeout pattern will automatically use the new interval
        }
        
        // Don't stop polling on error, just log it and back off
      }
      
      // Schedule next poll with current interval (supports dynamic backoff)
      if (pollIntervalRef.current) {
        clearTimeout(pollIntervalRef.current as any);
      }
      pollIntervalRef.current = setTimeout(pollFunction, currentPollIntervalRef.current) as any;
    };
    
    // Start polling immediately, then schedule next poll
    pollFunction();
  }, [syncFromDrive]);

  /**
   * Stop polling Drive
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current as any);
      pollIntervalRef.current = null;
      console.log('⏹️ Stopped Drive polling');
    }
  }, []);

  // Store callbacks in refs to prevent dependency issues
  useEffect(() => {
    startPollingRef.current = startPolling;
    stopPollingRef.current = stopPolling;
  }, [startPolling, stopPolling]);

  // Start/stop polling based on connection status
  useEffect(() => {
    const currentKey = syncState.isConnected && syncState.fileId 
      ? `${syncState.isConnected}-${syncState.fileId}` 
      : null;
    
    // Only restart polling if connection status or fileId actually changed
    if (pollingSetupRef.current === currentKey) {
      return;
    }
    
    // Stop previous polling if it exists
    if (pollingSetupRef.current !== null) {
      stopPolling();
    }
    
    pollingSetupRef.current = currentKey;
    
    if (syncState.isConnected && syncState.fileId) {
      console.log('🔄 Setting up polling for fileId:', syncState.fileId);
      if (startPollingRef.current) {
        startPollingRef.current();
      }
    } else {
      console.log('⏹️ Stopping polling - not connected or no fileId');
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
      pollingSetupRef.current = null;
    }

    return () => {
      // Only cleanup if we're actually changing to a different state
      if (pollingSetupRef.current !== currentKey) {
        stopPolling();
      }
    };
  }, [syncState.isConnected, syncState.fileId]); // Remove startPolling/stopPolling from deps to prevent restarts

  // Cleanup timeout and polling on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      stopPolling();
    };
  }, [stopPolling]);

  /**
   * Check if we recently synced from Drive (to prevent overwriting Drive edits)
   * Returns true if we synced from Drive within the last 15 seconds
   */
  const recentlySyncedFromDrive = useCallback((): boolean => {
    const timeSinceLastSync = Date.now() - lastDriveSyncTimeRef.current;
    // Increased to 15 seconds to prevent overwriting Drive edits after refreshTrades() completes
    // This gives enough time for refreshTrades() to complete and state to update before auto-sync runs
    const isRecent = timeSinceLastSync < 15000; // 15 seconds
    
    return isRecent;
  }, []);

  /**
   * Mark that we just completed syncing from Drive (called after refreshTrades completes)
   * This extends the auto-sync block to prevent overwriting Drive changes
   */
  const markDriveSyncComplete = useCallback((): void => {
    lastDriveSyncTimeRef.current = Date.now();
    
  }, []);

  return {
    syncState,
    connect,
    disconnect,
    syncToDrive,
    syncFromDrive,
    checkForUpdates,
    recentlySyncedFromDrive,
    markDriveSyncComplete,
    markCsvImportStart: () => {
      csvImportInProgressRef.current = Date.now();
      
    },
    clearCsvImportFlag: () => {
      csvImportInProgressRef.current = 0;
      
    },
    markDeletionStart: () => {
      deletionInProgressRef.current = Date.now();
      // CRITICAL: Persist deletion state in localStorage to survive page reloads
      localStorage.setItem('pp_deletion_in_progress', Date.now().toString());
      
    },
    markEditLock: () => {
      editLockRef.current = Date.now();
      
    },
  };
}

