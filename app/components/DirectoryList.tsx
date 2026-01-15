'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

interface DirectoryListProps {
  items: string[];
  linkPrefix?: string;
  linkSuffix?: string;
  displayMode?: 'grid' | 'grouped';
}

export default function DirectoryList({ 
  items, 
  linkPrefix = '/s/', 
  linkSuffix = '',
  displayMode = 'grouped'
}: DirectoryListProps) {
  const grouped = useMemo(() => {
    if (displayMode === 'grid') return null;
    
    const groups: Record<string, string[]> = {};
    items.forEach(item => {
      const firstLetter = item[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(item);
    });
    return groups;
  }, [items, displayMode]);

  if (displayMode === 'grid') {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {items.map(ticker => (
          <Link
            key={ticker}
            href={`${linkPrefix}${ticker.toLowerCase()}${linkSuffix}`}
            style={{
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              display: 'block',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.background = 'var(--surface-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {ticker.toUpperCase()}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
      gap: '32px' 
    }}>
      {Object.keys(grouped || {}).sort().map(letter => (
        <div key={letter}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: 'var(--accent-warm)' 
          }}>
            {letter}
          </h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
          }}>
            {grouped![letter].map(ticker => (
              <li key={ticker}>
                <Link
                  href={`${linkPrefix}${ticker.toLowerCase()}${linkSuffix}`}
                  style={{
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-warm)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {ticker.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

