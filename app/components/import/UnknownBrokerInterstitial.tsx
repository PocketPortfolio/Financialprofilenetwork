'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { BrokerId } from '@pocket-portfolio/importer';
import { GLOBAL_BROKER_OPTIONS } from '../../lib/brokers';
import type { BrokerOptionId } from '../../lib/brokers';

function isUniversalImportEnabled(): boolean {
  if (typeof process === 'undefined') return true;
  return process.env.NEXT_PUBLIC_ENABLE_UNIVERSAL_IMPORT !== 'false';
}

interface UnknownBrokerInterstitialProps {
  fileName: string;
  reason?: 'unknown' | 'zero_trades';
  onCancel: () => void;
  onSelectBroker: (brokerId: BrokerId) => void;
  onSmartImport: () => void;
  smartImportState?: {
    status: 'idle' | 'running' | 'success' | 'error';
    summary?: string;
    details?: string[];
  };
}

export default function UnknownBrokerInterstitial({
  fileName,
  reason,
  onCancel,
  onSelectBroker,
  onSmartImport,
  smartImportState,
}: UnknownBrokerInterstitialProps) {
  const showSmartImport = isUniversalImportEnabled();
  const isZeroTrades = reason === 'zero_trades';
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [primaryHover, setPrimaryHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const smartImportDisabled = smartImportState?.status === 'running';
  const compilerTone =
    smartImportState?.status === 'error'
      ? 'error'
      : smartImportState?.status === 'success'
        ? 'success'
        : smartImportState?.status === 'running'
          ? 'running'
          : 'idle';

  const filteredBrokers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GLOBAL_BROKER_OPTIONS;
    return GLOBAL_BROKER_OPTIONS.filter((b) => b.label.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (optionId: BrokerOptionId) => {
    setSearchQuery('');
    setIsOpen(false);
    if (optionId === 'generic') {
      onSmartImport();
    } else {
      onSelectBroker(optionId as BrokerId);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 440 }}>
      <h3 style={{ marginBottom: 8, fontSize: 18 }}>
        {isZeroTrades ? 'No trades found with detected format' : "We don't recognize this format"}
      </h3>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        File: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fileName}</span>
      </div>
      <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: 14 }}>
        {isZeroTrades
          ? `"${fileName}" was detected as a known format but produced no valid trades. Try another broker or Smart Import.`
          : (
            <>
              We didn&apos;t recognize this specific format, but we can still import it.
              <br />
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>Use Smart Import to map your columns automatically.</span>
            </>
          )}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {showSmartImport && (
          <div style={{ marginTop: 4 }}>
            <button
              type="button"
              onClick={onSmartImport}
              disabled={smartImportDisabled}
              onMouseEnter={() => setPrimaryHover(true)}
              onMouseLeave={() => setPrimaryHover(false)}
              style={{
                padding: '14px 20px',
                background: smartImportDisabled
                  ? 'hsl(var(--foreground) / 0.08)'
                  : primaryHover
                    ? 'hsl(var(--accent) / 0.9)'
                    : 'hsl(var(--accent))',
                color: smartImportDisabled ? 'var(--muted)' : 'hsl(var(--accent-foreground))',
                border: 'none',
                borderRadius: 10,
                cursor: smartImportDisabled ? 'not-allowed' : 'pointer',
                width: '100%',
                fontWeight: 700,
                fontSize: 15,
                transition: 'all 0.2s ease',
                transform: !smartImportDisabled && primaryHover ? 'translateY(-1px)' : 'none',
                boxShadow: !smartImportDisabled
                  ? primaryHover
                    ? '0 4px 14px hsl(var(--accent) / 0.35)'
                    : '0 2px 8px hsl(var(--accent) / 0.2)'
                  : 'none',
              }}
            >
              {smartImportState?.status === 'running' ? 'Compiling CSV…' : 'Use Smart Import (Beta)'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>
              Runs locally first. If we can read your file, you’ll see the compile output immediately.
            </p>
            {smartImportState?.status && smartImportState.status !== 'idle' && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border:
                    compilerTone === 'error'
                      ? '1px solid hsl(var(--destructive) / 0.55)'
                      : compilerTone === 'success'
                        ? '1px solid hsl(var(--accent) / 0.45)'
                        : '1px solid var(--border-subtle)',
                  background: 'var(--surface)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text)' }}>Compiler output</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      color:
                        compilerTone === 'error'
                          ? 'hsl(var(--destructive))'
                          : compilerTone === 'success'
                            ? 'var(--accent-warm)'
                            : 'var(--muted)',
                    }}
                  >
                    {compilerTone === 'error'
                      ? 'FAILED'
                      : compilerTone === 'success'
                        ? 'OK'
                        : compilerTone === 'running'
                          ? 'RUNNING'
                          : ''}
                  </div>
                </div>
                {smartImportState.summary && (
                  <div style={{ marginBottom: smartImportState.details?.length ? 6 : 0 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 700 }}>{smartImportState.summary}</span>
                  </div>
                )}
                {!!smartImportState.details?.length && (
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {smartImportState.details.slice(0, 4).map((d, i) => (
                      <li key={`${d}-${i}`}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <label style={{ fontWeight: 600, fontSize: 14 }}>Select your broker</label>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '-4px 0 4px 0' }}>
          Search brokers globally. We have built-in parsers for some; others use Smart Import.
        </p>
        <div ref={containerRef} style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search or choose broker..."
            aria-label="Search or choose broker"
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${isOpen ? 'hsl(var(--accent))' : 'var(--card-border)'}`,
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              width: '100%',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
          {isOpen && (
            <ul
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                margin: 0,
                marginTop: 4,
                padding: 4,
                maxHeight: 220,
                overflowY: 'auto',
                listStyle: 'none',
                background: 'hsl(var(--card))',
                border: '1px solid var(--card-border)',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 50,
              }}
            >
              {filteredBrokers.length === 0 ? (
                <li style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 14 }}>
                  No brokers match &quot;{searchQuery}&quot;
                </li>
              ) : (
                filteredBrokers.map((b) => (
                  <li
                    key={`${b.id}-${b.label}`}
                    role="option"
                    onClick={() => handleSelectOption(b.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectOption(b.id);
                      }
                    }}
                    tabIndex={0}
                    style={{
                      padding: '10px 12px',
                      fontSize: 14,
                      cursor: 'pointer',
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'hsl(var(--accent) / 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {b.label}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          onMouseEnter={() => setCancelHover(true)}
          onMouseLeave={() => setCancelHover(false)}
          style={{
            marginTop: 8,
            padding: '12px 18px',
            background: cancelHover ? 'hsl(var(--foreground) / 0.06)' : 'transparent',
            border: '1px solid var(--card-border)',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            color: 'hsl(var(--foreground))',
            transition: 'all 0.2s ease',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
