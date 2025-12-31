/**
 * Google Drive Sync Types
 * Types for Sovereign Sync feature
 */

export interface DriveFileMetadata {
  id: string;
  name: string;
  modifiedTime: string;
  createdTime: string;
  size?: string;
  parents?: string[]; // Folder IDs where file is located
  version?: string; // File version (atomic integer)
  headRevisionId?: string; // Head revision ID (alternative version identifier)
  lastModifyingUser?: {
    displayName?: string;
    emailAddress?: string;
    kind?: string;
    me?: boolean; // true if modified by the authenticated user
    permissionId?: string;
    photoLink?: string;
  };
}

export interface DriveSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null; // Kept for backward compatibility, but version is primary
  localVersion: string | null; // Local version (last known version we synced)
  remoteVersion: string | null; // Remote version (current version on Drive)
  fileId: string | null;
  excelFileId: string | null; // Excel file ID for Google Sheets viewing
  folderId: string | null; // Folder ID where files are stored
  folderName: string | null; // Folder name for display
  jsonFileMetadata: DriveFileMetadata | null; // JSON file metadata
  excelFileMetadata: DriveFileMetadata | null; // Excel file metadata
  error: string | null;
  conflictDetected: boolean; // True if a conflict was detected during upload
  conflictData: {
    localVersion: string;
    remoteVersion: string;
    remoteData?: any; // Remote data for conflict resolution
  } | null;
  lastContentCheckTime: number | null; // Timestamp of last content-based check (for detecting manual Drive edits)
}

export interface PortfolioData {
  trades: any[];
  metadata: {
    createdAt: string;
    lastUpdated: string;
    version: string;
    tradeCount: number;
    dataSize: number;
  };
}

export interface DriveSyncConfig {
  fileName: string;
  mimeType: string;
  encryptBeforeSync: boolean;
}

