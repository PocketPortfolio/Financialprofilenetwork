'use client';

import React, { useState, useEffect } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  headerContent?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  persistState?: boolean;
  storageKey?: string;
}

export default function Accordion({
  title,
  children,
  defaultExpanded = true,
  headerContent,
  className = '',
  icon,
  persistState = false,
  storageKey,
}: AccordionProps) {
  // Get initial state from localStorage if persistState is enabled
  const getInitialState = () => {
    if (persistState && storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`accordion-${storageKey}`);
      return saved ? JSON.parse(saved) : defaultExpanded;
    }
    return defaultExpanded;
  };

  const [isExpanded, setIsExpanded] = useState(getInitialState);

  // Save to localStorage when state changes
  useEffect(() => {
    if (persistState && storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`accordion-${storageKey}`, JSON.stringify(isExpanded));
    }
  }, [isExpanded, persistState, storageKey]);

  return (
    <div
      className={className}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '100%', // Constrain to parent width
        boxSizing: 'border-box',
      }}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          {icon && <span>{icon}</span>}
          <h3
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text)',
              margin: 0,
            }}
          >
            {title}
          </h3>
          {headerContent && <div style={{ marginLeft: 'auto' }}>{headerContent}</div>}
        </div>
        
        {/* Expand/Collapse Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            flexShrink: 0,
            marginLeft: 'var(--space-2)',
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Content - Collapsible */}
      <div
        style={{
          maxHeight: isExpanded ? '10000px' : '0',
          overflow: 'hidden',
          overflowX: 'visible', // Allow horizontal scrolling for child elements
          transition: 'max-height 0.3s ease, padding 0.3s ease',
          padding: isExpanded ? '0 var(--space-4) var(--space-4) var(--space-4)' : '0 var(--space-4)',
          width: '100%',
          maxWidth: '100%', // Constrain to parent width
          boxSizing: 'border-box', // Include padding in width calculation
        }}
      >
        {isExpanded && children}
      </div>
    </div>
  );
}

