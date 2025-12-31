'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import { loadLocalTrades } from '../lib/store/localPortfolioStore';

interface SyncUpgradeCTAProps {
  className?: string;
}

export default function SyncUpgradeCTA({ className = '' }: SyncUpgradeCTAProps) {
  const { isAuthenticated, user, signInWithGoogle } = useAuth();
  const { trades } = useTrades();
  
  // Only show if user is not authenticated and has local trades
  const hasLocalTrades = !isAuthenticated && trades.length > 0;
  
  if (!hasLocalTrades) {
    return null;
  }

  const handleSignUp = async () => {
    try {
      await signInWithGoogle();
      // After signup, trades will be migrated automatically via useTrades hook
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div 
      className={`sync-upgrade-cta ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
        border: '2px solid var(--border-warm)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '8px'
          }}>
            💾 Save & Sync Your Portfolio
          </h3>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.5',
            margin: 0
          }}>
            Sign up to sync your portfolio across devices and never lose your data. Your current portfolio will be automatically saved.
          </p>
        </div>
        <button
          onClick={handleSignUp}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: 'var(--accent-warm)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );
}









