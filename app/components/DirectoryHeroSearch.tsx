'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface DirectoryHeroSearchProps {
  headline: string;
  placeholder: string;
  allItems: string[];
  onFilter?: (filteredItems: string[]) => void;
  linkPrefix?: string;
  linkSuffix?: string;
  autoFocus?: boolean;
}

export default function DirectoryHeroSearch({
  headline,
  placeholder,
  allItems,
  onFilter,
  linkPrefix = '/s/',
  linkSuffix = '',
  autoFocus = true
}: DirectoryHeroSearchProps) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<string[]>(allItems);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus on desktop
  useEffect(() => {
    if (autoFocus && typeof window !== 'undefined' && window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Filter items based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredItems(allItems);
      if (onFilter) onFilter(allItems);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = allItems.filter(item => 
      item.toLowerCase().includes(searchTerm)
    );
    
    setFilteredItems(filtered);
    if (onFilter) onFilter(filtered);
  }, [query, allItems, onFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && filteredItems.length > 0) {
      const firstMatch = filteredItems[0];
      router.push(`${linkPrefix}${firstMatch.toLowerCase()}${linkSuffix}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && filteredItems.length > 0) {
      e.preventDefault();
      const firstMatch = filteredItems[0];
      router.push(`${linkPrefix}${firstMatch.toLowerCase()}${linkSuffix}`);
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '48px',
      padding: '0 16px'
    }}>
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: '700',
        marginBottom: '16px',
        color: 'var(--text)',
        lineHeight: '1.2'
      }}>
        {headline}
      </h1>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: '12px',
          padding: '4px',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-warm)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
        }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ 
              color: 'var(--text-secondary)', 
              marginLeft: '16px',
              flexShrink: 0
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              padding: '16px',
              outline: 'none',
              fontWeight: '400'
            }}
          />
        </div>
        
        {query.trim() && (
          <p style={{
            marginTop: '12px',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            {filteredItems.length > 0 
              ? `Found ${filteredItems.length.toLocaleString()} result${filteredItems.length !== 1 ? 's' : ''}`
              : 'No results found'
            }
          </p>
        )}
      </form>
    </div>
  );
}

