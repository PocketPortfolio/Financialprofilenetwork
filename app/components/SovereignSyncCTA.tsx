'use client';

import React from 'react';

interface SovereignSyncCTAProps {
  brokerName: string;
}

export default function SovereignSyncCTA({ brokerName }: SovereignSyncCTAProps) {
  return (
    <section style={{
      marginBottom: '32px',
      background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
      border: '2px solid var(--border-warm)',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#ffffff'
      }}>
        Tired of Wrestling with CSVs?
      </h2>
      <p style={{
        fontSize: '18px',
        lineHeight: '1.6',
        color: 'rgba(255, 255, 255, 0.95)',
        marginBottom: '24px',
        maxWidth: '600px',
        margin: '0 auto 24px'
      }}>
        Stop manual exports. Sync your <strong>{brokerName}</strong> data directly to Google Drive with Sovereign Sync.
      </p>
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <a
          href="/features/google-drive-sync?utm_source=import_page&utm_medium=sovereign_sync_cta&utm_campaign=broker_import"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#ffffff',
            color: 'var(--accent-warm)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          Learn About Sovereign Sync →
        </a>
        <a
          href="/dashboard?utm_source=import_page&utm_medium=convert_csv_cta&utm_campaign=broker_import"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: '2px solid #ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Convert CSV to JSON Now →
        </a>
      </div>
    </section>
  );
}

