'use client';

import React, { useState } from 'react';

interface JsonApiNpmSnippetProps {
  symbol: string;
}

export default function JsonApiNpmSnippet({ symbol }: JsonApiNpmSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`npx pocket-portfolio --import ${symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '24px' }}>💻</span>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text)',
          margin: 0
        }}>
          Import via CLI
        </h3>
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginBottom: '16px',
        lineHeight: '1.6'
      }}>
        Don't scrape. Use our open-source importer to normalize this dataset directly into your local database.
      </p>
      <div style={{
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--border-subtle)',
        marginBottom: '12px'
      }}>
        <code style={{
          color: '#34d399',
          fontFamily: 'monospace',
          fontSize: '14px',
          flex: 1
        }}>
          npx pocket-portfolio --import {symbol}
        </code>
        <button
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
            marginLeft: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--accent-warm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

