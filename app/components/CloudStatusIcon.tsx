/**
 * Cloud Status Icon — shows Sovereign Sync when Drive or OneDrive is connected.
 */

'use client';

import React from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { useOneDrive } from '../hooks/useOneDrive';

interface CloudStatusIconProps {
  className?: string;
}

export default function CloudStatusIcon({ className = '' }: CloudStatusIconProps) {
  const { syncState: drive } = useGoogleDrive();
  const { syncState: oneDrive } = useOneDrive();

  const connected = drive.isConnected || oneDrive.isConnected;
  const syncing = drive.isSyncing || oneDrive.isSyncing;
  const lastSync = drive.isConnected
    ? drive.lastSyncTime
    : oneDrive.isConnected
      ? oneDrive.lastSyncTime
      : null;
  const label = drive.isConnected
    ? 'Google Drive'
    : oneDrive.isConnected
      ? 'OneDrive'
      : null;

  if (!connected) {
    return (
      <div
        className={className}
        title="Sync Disabled. Data lives on this device only."
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.5 }}
        >
          <path
            d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            fill="currentColor"
          />
          <line
            x1="2"
            y1="2"
            x2="22"
            y2="22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={className}
      title={`Sovereign Sync Active (${label}). Last synced: ${lastSync ? new Date(lastSync).toLocaleString() : 'Never'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'help',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          fill="currentColor"
        />
      </svg>
      {syncing && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent-warm)',
          }}
        />
      )}
    </div>
  );
}
