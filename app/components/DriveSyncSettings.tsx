/**
 * Drive Sync Settings Component
 * Settings page section for Google Drive sync
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useTrades } from '../hooks/useTrades';
import { driveService } from '../lib/google-drive/driveService';
import { getSyncEntitlements } from '../lib/utils/syncEntitlements';
import { getFoundersClubSpotsRemaining } from '../lib/utils/foundersClub';
import InfrastructureUpgradeModal from './InfrastructureUpgradeModal';
import Link from 'next/link';

interface DriveSyncSettingsProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function DriveSyncSettings({ onConnect, onDisconnect }: DriveSyncSettingsProps) {
  const { syncState, connect, disconnect } = useGoogleDrive();
  
  
  const { tier, isLoading: tierLoading } = usePremiumTheme();
  const { trades } = useTrades(); // Get current trades to sync
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>('Pocket Portfolio');
  const [syncExcel, setSyncExcel] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get sync entitlements based on tier
  const entitlements = getSyncEntitlements(tier);
  const hasSyncAccess = entitlements.allowed;
  
  // Track seat usage (for now, assume 1 seat per connected sync)
  const seatsUsed = syncState.isConnected ? 1 : 0;
  const seatsRemaining = entitlements.seats - seatsUsed;

  const handleConnect = async () => {
    // Check if user has sync access (Corporate or Founder tier)
    if (!hasSyncAccess) {
      // Show Infrastructure Upgrade modal instead of redirecting
      setShowUpgradeModal(true);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Pass current trades to ensure Firebase data is synced
      await connect(folderName || undefined, syncExcel, trades);
      onConnect?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Google Drive');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await disconnect();
      onDisconnect?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Google Drive');
    }
  };

  return (
    <>
      <section
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--text)',
          }}
        >
          Data Sovereignty & Sync
        </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              Connect your Google Drive to enable automatic sync across devices. Your portfolio data
              will be stored in your personal Drive, maintaining full control and privacy.
            </p>

            {!syncState.isConnected && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'var(--surface-elevated)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Folder Name (optional)
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Pocket Portfolio"
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text)',
                    background: 'var(--bg)',
                  }}
                />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem',
                    marginBottom: 0,
                  }}
                >
                  Files will be organized in this folder. You can move files later and sync will still work.
                </p>
              </div>
            )}

            {!syncState.isConnected && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="checkbox"
                  id="sync-excel"
                  checked={syncExcel}
                  onChange={(e) => setSyncExcel(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <label
                  htmlFor="sync-excel"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  Also sync Excel file (<code style={{ fontSize: '0.75rem' }}>pocket_view.xlsx</code>) for viewing in Google Sheets (read-only)
                </label>
              </div>
            )}

        {syncState.isConnected ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '1rem',
                padding: '12px',
                background: 'var(--surface-elevated)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--signal)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                    Sovereign Sync Active
                  </div>
                  {hasSyncAccess && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                      }}
                    >
                      Using {seatsUsed} of {entitlements.seats} {entitlements.seats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  )}
                </div>
                    {syncState.lastSyncTime && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Last synced: {new Date(syncState.lastSyncTime).toLocaleString()}
                      </div>
                    )}
                    {syncState.folderId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        📁 Files stored in folder
                      </div>
                    )}
                    {syncState.excelFileId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        📊 Excel view available in Google Sheets
                      </div>
                    )}
                  </div>
                </div>

            {/* Critical Warning Alert */}
            <div
              style={{
                marginTop: '1rem',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#dc2626',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: '700', marginBottom: '4px' }}>
                <span>⚠️</span>
                <span>Critical</span>
              </div>
              <div style={{ fontSize: '0.8125rem', lineHeight: '1.5' }}>
                Do not open <code style={{ fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code> with Google Sheets or Excel. It will convert the file and break your sync. Use a code editor (VS Code, Sublime) or a JSON-safe editor.
              </div>
            </div>

            {/* Advanced Feature Warning */}
            <div
              style={{
                marginTop: '1rem',
                padding: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid var(--accent-warm)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--text-warm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: '600', marginBottom: '4px' }}>
                <span>ℹ️</span>
                <span>Advanced Feature</span>
              </div>
              <div style={{ fontSize: '0.8125rem', lineHeight: '1.5' }}>
                This syncs a <code style={{ fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code> file. Please use a text editor (VS Code, Notepad++) to edit. Saving as CSV/Excel will break the sync.
              </div>
            </div>

            {syncState.isSyncing && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--warm-bg)',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-warm)',
                }}
              >
                Syncing...
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--danger-muted)',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleDisconnect}
              disabled={syncState.isSyncing}
              className="brand-button brand-button-secondary"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                opacity: syncState.isSyncing ? 0.6 : 1,
                cursor: syncState.isSyncing ? 'not-allowed' : 'pointer',
              }}
            >
              Disconnect Google Drive
            </button>

            {/* Drive Files Metadata Section */}
            {(syncState.jsonFileMetadata || syncState.excelFileMetadata) && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--surface-elevated)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: 'var(--text)',
                }}
              >
                📁 Drive Files
              </h3>
              
              {syncState.folderName && syncState.folderId && (
                <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--text)' }}>Folder:</strong>{' '}
                  <a
                    href={`https://drive.google.com/drive/folders/${syncState.folderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#4285F4',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {syncState.folderName}
                  </a>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    (Click to open in Drive)
                  </span>
                </div>
              )}
              
              {syncState.jsonFileMetadata && (
                <div
                  style={{
                    marginBottom: '0.5rem',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    if (syncState.jsonFileMetadata?.id) {
                      window.open(`https://drive.google.com/file/d/${syncState.jsonFileMetadata.id}/view`, '_blank');
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg)';
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📄 {syncState.jsonFileMetadata.name}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                      (Click to open in Drive)
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Modified: {new Date(syncState.jsonFileMetadata.modifiedTime).toLocaleString()}
                    {syncState.jsonFileMetadata.size && (
                      <>
                        {' • '}
                        Size: {syncState.jsonFileMetadata.size} bytes
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Developer Tools Section */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--surface-elevated)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: 'var(--text)',
                  }}
                >
                  🛠️ Developer Tools
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <a
                    href="/templates/seed_portfolio.json"
                    download="seed_portfolio.json"
                    style={{
                      color: '#4285F4',
                      textDecoration: 'none',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    📥 Download Seed JSON
                  </a>
                  <Link
                    href="/templates/SCHEMA_README.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#4285F4',
                      textDecoration: 'none',
                      fontWeight: '500',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    📋 View Schema Docs
                  </Link>
                </div>
              </div>
              
              {syncState.excelFileMetadata && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    if (syncState.excelFileMetadata?.id) {
                      window.open(`https://drive.google.com/file/d/${syncState.excelFileMetadata.id}/view`, '_blank');
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg)';
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 {syncState.excelFileMetadata.name}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                      (Click to open in Drive)
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Modified: {new Date(syncState.excelFileMetadata.modifiedTime).toLocaleString()}
                    {syncState.excelFileMetadata.size && (
                      <>
                        {' • '}
                        Size: {syncState.excelFileMetadata.size} bytes
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          <div>
            {!hasSyncAccess && (
              <div
                style={{
                  padding: '12px',
                  background: 'var(--warm-bg)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    color: 'var(--text-warm)',
                    marginBottom: '4px',
                  }}
                >
                  <span>🔒</span>
                  <span>Premium Feature</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Upgrade to <strong>Corporate Sponsor</strong> or <strong>UK Founder's Club</strong> to unlock Sovereign Sync.
                </div>
                <Link
                  href="/sponsor"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--accent-warm)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  View Pricing →
                </Link>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--danger-muted)',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting || tierLoading || !hasSyncAccess}
              className="brand-button brand-button-primary"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-semibold)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isConnecting || tierLoading || !hasSyncAccess ? 0.6 : 1,
                cursor: isConnecting || tierLoading || !hasSyncAccess ? 'not-allowed' : 'pointer',
                position: 'relative',
              }}
              title={!hasSyncAccess ? 'Upgrade to Corporate or UK Founder to unlock Sovereign Sync' : undefined}
            >
              {isConnecting ? (
                <>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Connect Google Drive</span>
                </>
              )}
            </button>
            {!hasSyncAccess && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>🔒</span>
                <span>Locked - Upgrade required</span>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: '1.5rem',
            padding: '12px',
            background: 'var(--surface-elevated)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}
        >
          <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
            How it works:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Your portfolio data is stored in a JSON file called <code style={{ fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_portfolio_db.json</code> in your Drive</li>
            <li>Edit the JSON file directly using a text editor (VS Code, Notepad++, etc.) for full control</li>
            <li>Optionally, an Excel file (<code style={{ fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>pocket_view.xlsx</code>) is synced for viewing in Google Sheets (read-only)</li>
            <li>Files are organized in a folder (default: "Pocket Portfolio") - you can move files and sync will still work</li>
            <li>Changes are automatically synced every 5 seconds</li>
            <li>When you open the app on another device, it pulls the latest data from Drive</li>
            <li>Your data remains private - we only access files created by this app</li>
          </ul>
        </div>
      </section>

      {/* Infrastructure Upgrade Modal */}
      <InfrastructureUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        spotsRemaining={getFoundersClubSpotsRemaining()}
      />
    </>
  );
}

