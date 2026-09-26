/**
 * OneDrive Sovereign Sync types — mirror DriveSyncState shape for Settings UI parity.
 */

export interface OneDriveFileMetadata {
  id: string;
  name: string;
  lastModifiedDateTime: string;
  size?: number;
  eTag?: string;
  webUrl?: string;
}

export interface OneDriveSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  localEtag: string | null;
  remoteEtag: string | null;
  fileId: string | null;
  excelFileId: string | null;
  folderName: string | null;
  /** Graph webUrl for special/approot — open in OneDrive. */
  folderWebUrl: string | null;
  jsonFileMetadata: OneDriveFileMetadata | null;
  excelFileMetadata: OneDriveFileMetadata | null;
  error: string | null;
  conflictDetected: boolean;
  conflictData: {
    localEtag: string;
    remoteEtag: string;
  } | null;
  deltaLink: string | null;
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
  notes?: unknown;
}
