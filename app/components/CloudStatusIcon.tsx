/**
 * Cloud Status Icon Component
 * Displays sync status in dashboard header
 */

'use client';

import React from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

interface CloudStatusIconProps {
  className?: string;
}

export default function CloudStatusIcon({ className = '' }: CloudStatusIconProps) {
  const { syncState } = useGoogleDrive();

  if (!syncState.isConnected) {
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
      title={`Sovereign Sync Active. Last synced: ${syncState.lastSyncTime ? new Date(syncState.lastSyncTime).toLocaleString() : 'Never'}`}
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
      {syncState.isSyncing && (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--signal)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}
      {!syncState.isSyncing && syncState.lastSyncTime && (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--signal)',
          }}
        />
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}







