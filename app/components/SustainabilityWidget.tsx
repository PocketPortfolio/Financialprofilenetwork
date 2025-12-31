'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SponsorData {
  totalMonthly: number;
  patronCount: number;
  goal?: number;
}

// Default goal if API doesn't provide one
const DEFAULT_MONTHLY_GOAL = 200;

export default function SustainabilityWidget({ 
  className = '',
  context = 'default' // 'export', 'sidebar', 'default'
}: { 
  className?: string;
  context?: 'export' | 'sidebar' | 'default';
}) {
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(DEFAULT_MONTHLY_GOAL);

  useEffect(() => {
    // Fetch from API route (which queries Stripe)
    fetch('/api/sponsors')
      .then(res => res.json())
      .then((data: SponsorData) => {
        setSponsorData(data);
        // Use goal from API if provided, otherwise use default
        if (data.goal) {
          setGoal(data.goal);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sponsor data:', error);
        // Fallback to mock data if API fails
        setSponsorData({ 
          totalMonthly: 0, 
          patronCount: 0,
          goal: DEFAULT_MONTHLY_GOAL
        });
        setGoal(DEFAULT_MONTHLY_GOAL);
        setLoading(false);
      });
  }, []);

  if (loading || !sponsorData) {
    return (
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }} className={className}>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-secondary)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          Loading funding data...
        </div>
      </div>
    );
  }

  const currentGoal = sponsorData.goal || goal;
  const percentage = Math.min(100, Math.round((sponsorData.totalMonthly / currentGoal) * 100));
  const remaining = Math.max(0, currentGoal - sponsorData.totalMonthly);

  const microCopy = context === 'export' 
    ? 'This export saved you time. We are 100% free and user-funded. Help us keep the lights on.'
    : 'Pocket Portfolio is 100% free and user-funded. Help us keep the servers running.';

  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface) 100%)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)'
    }} className={className}>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)'
        }}>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text)'
          }}>
            Server Fund
          </span>
          <span style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--signal)'
          }}>
            {percentage}% Reached
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          background: 'var(--border)',
          borderRadius: 'var(--radius-full)',
          height: '10px',
          marginBottom: 'var(--space-2)',
          overflow: 'hidden'
        }}>
          <div
            style={{
              background: `linear-gradient(90deg, var(--signal) 0%, var(--accent-warm) 100%)`,
              height: '100%',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s ease',
              width: `${percentage}%`
            }}
          />
        </div>
        
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--line-relaxed)'
        }}>
          ${sponsorData.totalMonthly.toFixed(2)}/${currentGoal}/mo • {sponsorData.patronCount} {sponsorData.patronCount === 1 ? 'Patron' : 'Patrons'}
          {remaining > 0 && ` • $${remaining.toFixed(2)} to goal`}
        </p>
      </div>
      
      <p style={{
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text)',
        marginBottom: 'var(--space-3)',
        lineHeight: 'var(--line-relaxed)'
      }}>
        {microCopy}
      </p>
      
      <Link
        href="/sponsor?utm_source=sustainability_widget&utm_medium=patron&utm_campaign=funding"
        className="brand-button brand-button-primary"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none'
        }}
      >
        Become a Patron
      </Link>
    </div>
  );
}
