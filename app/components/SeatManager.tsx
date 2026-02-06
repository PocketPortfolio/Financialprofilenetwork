'use client';

import React, { useState } from 'react';
import type { Tier } from '@/app/lib/utils/syncEntitlements';

export interface SeatAllocation {
  id: string;
  memberEmail: string;
  status: string;
  createdAt: string | null;
  memberUserId: string | null;
}

interface SeatManagerProps {
  tier: Tier;
  usedSeats: number;
  maxSeats: number;
  allocations: SeatAllocation[];
  onInvite: (email: string) => Promise<void>;
  onRevoke: (email: string) => Promise<void>;
  loading?: boolean;
}

export default function SeatManager({
  tier,
  usedSeats,
  maxSeats,
  allocations,
  onInvite,
  onRevoke,
  loading = false,
}: SeatManagerProps) {
  const [email, setEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [revokingEmail, setRevokingEmail] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const inheritedLabel =
    tier === 'corporateSponsor' ? 'Inherited Corporate' : "Inherited Founder's Club";

  const handleInvite = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    setInviteError(null);
    setInviteLoading(true);
    try {
      await onInvite(normalized);
      setEmail('');
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevoke = async (memberEmail: string) => {
    setRevokingEmail(memberEmail);
    try {
      await onRevoke(memberEmail);
    } finally {
      setRevokingEmail(null);
    }
  };

  return (
    <div
      className="rounded-xl border border-orange-500/20 bg-[#111418] p-6 shadow-2xl"
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px 0' }}>
            Sovereign Team Access
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
            Grant your tier benefits to team members.
          </p>
        </div>
        <div
          style={{
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '4px 16px',
            fontSize: '14px',
            fontFamily: 'monospace',
            fontWeight: '700',
            color: '#f59e0b',
          }}
        >
          {usedSeats} / {maxSeats} SEATS USED
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <input
          type="email"
          placeholder="colleague@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          disabled={loading || usedSeats >= maxSeats}
          style={{
            flex: 1,
            minWidth: '200px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 16px',
            color: 'var(--text)',
            fontSize: '14px',
          }}
        />
        <button
          type="button"
          disabled={loading || inviteLoading || usedSeats >= maxSeats}
          onClick={handleInvite}
          style={{
            borderRadius: '8px',
            background: usedSeats >= maxSeats ? 'var(--muted)' : '#f59e0b',
            color: 'black',
            padding: '12px 24px',
            fontWeight: '700',
            fontSize: '14px',
            border: 'none',
            cursor: usedSeats >= maxSeats ? 'not-allowed' : 'pointer',
            opacity: loading || inviteLoading ? 0.7 : 1,
          }}
        >
          {usedSeats >= maxSeats ? 'Limit Reached' : inviteLoading ? 'Adding…' : 'Add Member'}
        </button>
      </div>

      {inviteError && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--danger)' }}>{inviteError}</p>
      )}

      <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>
        * Must be a valid Google Account. Member will receive instant dashboard access.
      </p>

      <div style={{ marginTop: '32px' }}>
        {loading ? (
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Loading members…</div>
        ) : allocations.length === 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>No team members invited yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allocations.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border)',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)' }}>
                      {a.memberEmail}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: a.status === 'active' ? 'var(--success)' : 'var(--muted)',
                      }}
                    >
                      {a.status === 'active' ? `● Active (${inheritedLabel})` : '● Pending'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={revokingEmail === a.memberEmail}
                  onClick={() => handleRevoke(a.memberEmail)}
                  style={{
                    fontSize: '12px',
                    color: 'var(--danger)',
                    background: 'none',
                    border: 'none',
                    cursor: revokingEmail === a.memberEmail ? 'wait' : 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {revokingEmail === a.memberEmail ? 'Revoking…' : 'Revoke Access'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
