/**
 * Encrypted Sync Service Types
 * 
 * NOTE: This is a design/stub implementation.
 * Do not enable in production until fully implemented and tested.
 */

export interface EncryptionKey {
  key: Uint8Array;
  salt: Uint8Array;
}

export interface EncryptedData {
  userId: string;
  encryptedPayload: string;
  nonce: string;
  salt: string;
  version: number;
  timestamp: string;
}

export interface ConflictInfo {
  localVersion: number;
  remoteVersion: number;
  lastModified: string;
}

export interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge';
  mergedData?: EncryptedData;
}

export interface SyncService {
  initialize(userId: string, masterKey: Uint8Array): Promise<void>;
  upload(data: EncryptedData): Promise<void>;
  download(): Promise<EncryptedData | null>;
  checkConflicts(): Promise<ConflictInfo[]>;
  resolveConflicts(resolution: ConflictResolution): Promise<void>;
}









