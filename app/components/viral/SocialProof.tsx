'use client';

import React, { useState, useEffect } from 'react';

interface SocialProofProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function SocialProof({ className = '', variant = 'compact' }: SocialProofProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPortfolios: 0,
    recentActivity: [] as Array<{ action: string; timestamp: Date }>
  });

  useEffect(() => {
    // Simulate loading stats (in production, fetch from API)
    // For now, use placeholder values
    setStats({
      totalUsers: 2000, // Placeholder - would come from API
      totalPortfolios: 1000, // Placeholder
      recentActivity: [
        { action: 'New portfolio created', timestamp: new Date(Date.now() - 5 * 60000) },
        { action: 'Trades imported', timestamp: new Date(Date.now() - 15 * 60000) },
        { action: 'Portfolio shared', timestamp: new Date(Date.now() - 30 * 60000) }
      ]
    });
  }, []);

  if (variant === 'compact') {
    return (
      <div className={`social-proof-compact ${className}`} style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>👥</span>
          <span>
            <strong style={{ color: 'var(--text)', fontWeight: '600' }}>
              {stats.totalUsers.toLocaleString()}
            </strong> users
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <span>
            <strong style={{ color: 'var(--text)', fontWeight: '600' }}>
              {stats.totalPortfolios.toLocaleString()}+
            </strong> portfolios
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>⭐</span>
          <span>Open Source</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`social-proof-full brand-card brand-spine ${className}`} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 28px)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ 
        fontSize: 'clamp(18px, 3vw, var(--font-size-lg))', 
        fontWeight: '600', 
        marginBottom: 'clamp(16px, 3vw, 20px)',
        color: 'var(--text)'
      }}>
        Join the Community
      </h3>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(16px, 4vw, 40px)', 
        marginBottom: '24px',
        padding: '0',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', flex: '1', minWidth: 0 }}>
          <div style={{ 
            fontSize: 'clamp(24px, 5vw, var(--font-size-2xl))', 
            fontWeight: 'bold', 
            color: 'var(--signal)', 
            marginBottom: '4px' 
          }}>
            {stats.totalUsers.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: 'clamp(10px, 2vw, var(--font-size-xs))', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Active Users
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: '1', minWidth: 0 }}>
          <div style={{ 
            fontSize: 'clamp(24px, 5vw, var(--font-size-2xl))', 
            fontWeight: 'bold', 
            color: 'var(--signal)', 
            marginBottom: '4px' 
          }}>
            {stats.totalPortfolios.toLocaleString()}+
          </div>
          <div style={{ 
            fontSize: 'clamp(10px, 2vw, var(--font-size-xs))', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Portfolios
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: '1', minWidth: 0 }}>
          <div style={{ 
            fontSize: 'clamp(24px, 5vw, var(--font-size-2xl))', 
            fontWeight: 'bold', 
            color: 'var(--signal)', 
            marginBottom: '4px' 
          }}>
            100%
          </div>
          <div style={{ 
            fontSize: 'clamp(10px, 2vw, var(--font-size-xs))', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Free
          </div>
        </div>
      </div>
      {stats.recentActivity.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: 'clamp(12px, 2.5vw, var(--font-size-sm))', 
            fontWeight: '600', 
            marginBottom: '12px', 
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Recent Activity
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                fontSize: 'clamp(11px, 2vw, var(--font-size-xs))', 
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-snug)'
              }}>
                • {activity.action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

