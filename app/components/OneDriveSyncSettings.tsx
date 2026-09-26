/**
 * OneDrive Sovereign Sync settings — paid seats only (Corporate / Founders).
 * Claim-safe copy: optional OneDrive copy in a folder you own.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOneDrive } from '../hooks/useOneDrive';
import { usePremiumTheme } from '../hooks/usePremiumTheme';
import { useTrades } from '../hooks/useTrades';
import {
  getSyncEntitlements,
  type Tier,
} from '../lib/utils/syncEntitlements';
import InfrastructureUpgradeModal from './InfrastructureUpgradeModal';

interface OneDriveSyncSettingsProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
  /** When Google Drive is connected, show exclusivity notice */
  googleDriveConnected?: boolean;
  /**
   * Prefer settings-page seat tier (API) over theme cache so free Microsoft
   * sign-ins cannot inherit a stale Founders/Corporate localStorage tier.
   */
  seatTier?: Tier | string | null;
}

function asSyncTier(value: Tier | string | null | undefined): Tier {
  if (
    value === 'corporateSponsor' ||
    value === 'foundersClub' ||
    value === 'codeSupporter' ||
    value === 'featureVoter'
  ) {
    return value;
  }
  return null;
}

export default function OneDriveSyncSettings({
  onConnect,
  onDisconnect,
  googleDriveConnected = false,
  seatTier = null,
}: OneDriveSyncSettingsProps) {
  const { syncState, connect, disconnect, syncFromOneDrive, isConfigured } = useOneDrive();
  const { tier: themeTier, isLoading: tierLoading } = usePremiumTheme();
  const { trades } = useTrades();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const effectiveTier = asSyncTier(seatTier) ?? asSyncTier(themeTier);
  const entitlements = getSyncEntitlements(effectiveTier);
  const hasSyncAccess = entitlements.allowed;
  const seatsUsed = syncState.isConnected || googleDriveConnected ? 1 : 0;

  const handleConnect = async () => {
    if (!hasSyncAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (!isConfigured) {
      setError(
        'OneDrive is not configured yet (Platform: set NEXT_PUBLIC_MICROSOFT_CLIENT_ID and Azure app registration).'
      );
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      await connect(trades, true);
      onConnect?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to OneDrive';
      // Full-page redirect to Microsoft — do not treat as failure
      if (!msg.includes('Redirecting to Microsoft')) {
        setError(msg);
      }
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
      setError(err instanceof Error ? err.message : 'Failed to disconnect OneDrive');
    }
  };

  const handleResolvePull = async () => {
    try {
      await syncFromOneDrive();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull from OneDrive');
    }
  };

  const otherCloudActive = googleDriveConnected && !syncState.isConnected;

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
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text)',
          }}
        >
          OneDrive Sovereign Sync
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          Optional OneDrive Sovereign Sync to a folder you own (paid). Connects a
          browser-to-cloud file replica under your control. Identity consent stays
          separate from this file access. One active cloud at a time.
        </p>

        {otherCloudActive && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--accent-warm)',
              borderRadius: 8,
              fontSize: '0.875rem',
              color: 'var(--text)',
            }}
          >
            Google Drive is your active Sovereign Sync cloud. Connecting OneDrive
            will disconnect Drive auto-sync (files stay in your Google account).
          </div>
        )}

        {syncState.isConnected ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: '1rem',
                padding: 12,
                background: 'var(--surface-elevated)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: 'var(--signal)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  OneDrive Sovereign Sync Active
                  {hasSyncAccess && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      Using {seatsUsed} of {entitlements.seats}{' '}
                      {entitlements.seats === 1 ? 'Seat' : 'Seats'}
                    </span>
                  )}
                </div>
                {syncState.lastSyncTime && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Last synced: {new Date(syncState.lastSyncTime).toLocaleString()}
                  </div>
                )}
                <div style={{ fontSize: '0.875rem', marginTop: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Folder: </span>
                  {syncState.folderWebUrl ? (
                    <a
                      href={syncState.folderWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--accent-warm)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {syncState.folderName || 'Pocket Portfolio'}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                      {syncState.folderName || 'Pocket Portfolio'}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-secondary)', marginLeft: 6, fontSize: '0.75rem' }}>
                    {syncState.folderWebUrl
                      ? '(open in OneDrive)'
                      : '(Apps → Pocket Portfolio in OneDrive)'}
                  </span>
                </div>
                {(syncState.jsonFileMetadata?.webUrl ||
                  syncState.excelFileMetadata?.webUrl) && (
                  <div style={{ fontSize: '0.875rem', marginTop: 6, display: 'flex', gap: 12 }}>
                    {syncState.jsonFileMetadata?.webUrl && (
                      <a
                        href={syncState.jsonFileMetadata.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
                      >
                        Open JSON replica
                      </a>
                    )}
                    {syncState.excelFileMetadata?.webUrl && (
                      <a
                        href={syncState.excelFileMetadata.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
                      >
                        Open Excel view
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {syncState.conflictDetected && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>
                  Sync conflict — OneDrive file changed
                </div>
                <button
                  type="button"
                  onClick={() => void handleResolvePull()}
                  className="brand-button"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Pull from OneDrive
                </button>
              </div>
            )}

            {(error || syncState.error) && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--danger-muted)',
                  borderRadius: 6,
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                }}
              >
                {error || syncState.error}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => void handleResolvePull()}
                disabled={syncState.isSyncing}
                className="brand-button"
                style={{
                  padding: 'var(--space-3) var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  opacity: syncState.isSyncing ? 0.6 : 1,
                  cursor: syncState.isSyncing ? 'not-allowed' : 'pointer',
                }}
              >
                Pull from OneDrive
              </button>
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={syncState.isSyncing}
                className="brand-button brand-button-secondary"
                style={{
                  padding: 'var(--space-3) var(--space-5)',
                  fontSize: 'var(--font-size-sm)',
                  opacity: syncState.isSyncing ? 0.6 : 1,
                  cursor: syncState.isSyncing ? 'not-allowed' : 'pointer',
                }}
              >
                Disconnect OneDrive
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              Pull applies the OneDrive JSON to this browser (and your signed-in trade
              store). Disconnect clears this browser session only — the JSON replica stays
              in OneDrive.
            </p>
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
                    fontWeight: 600,
                    color: 'var(--text-warm)',
                    marginBottom: 4,
                  }}
                >
                  <span>Premium Feature</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Microsoft sign-in is free. OneDrive Sovereign Sync is paid — upgrade to{' '}
                  <strong>Corporate Ecosystem</strong> or <strong>Founder&apos;s Club</strong>.
                </div>
                <Link
                  href="/sponsor"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--accent-warm)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  View plans →
                </Link>
              </div>
            )}

            {(error || syncState.error) && (
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--danger-muted)',
                  borderRadius: 6,
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                }}
              >
                {error || syncState.error}
              </div>
            )}
            <button
              type="button"
              onClick={() => void handleConnect()}
              disabled={isConnecting || syncState.isSyncing || tierLoading || !hasSyncAccess}
              className="brand-button"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                background: 'var(--accent-warm)',
                color: '#0a0a0a',
                opacity: isConnecting || tierLoading || !hasSyncAccess ? 0.6 : 1,
                cursor:
                  isConnecting || tierLoading || !hasSyncAccess ? 'not-allowed' : 'pointer',
              }}
              title={
                !hasSyncAccess
                  ? 'Upgrade to Corporate or Founder to unlock OneDrive Sovereign Sync'
                  : undefined
              }
            >
              {isConnecting
                ? 'Connecting…'
                : hasSyncAccess
                  ? 'Connect OneDrive'
                  : 'Unlock Sovereign Sync'}
            </button>
            {!hasSyncAccess && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                Free Microsoft identity does not unlock OneDrive sync. Same seat gate as
                Google Drive.
              </p>
            )}
          </div>
        )}
      </section>

      <InfrastructureUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        cloud="onedrive"
      />
    </>
  );
}
