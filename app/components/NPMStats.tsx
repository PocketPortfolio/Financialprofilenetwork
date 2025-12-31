'use client';

import React, { useState, useEffect } from 'react';

interface NPMStatsData {
  totalDownloads: number;
  previousWeekDownloads: number;
  change: number;
  isIncrease: boolean;
  hasValidComparison?: boolean;
  lastUpdated?: string;
  error?: boolean;
}

export default function NPMStats() {
  const [stats, setStats] = useState<NPMStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Add cache-busting query parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/npm-stats?t=${cacheBuster}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          console.log('NPM Stats:', data); // Debug log
          setStats(data);
        } else {
          setStats({
            totalDownloads: 0,
            previousWeekDownloads: 0,
            change: 0,
            isIncrease: false,
            error: true,
          });
        }
      } catch (error) {
        console.error('Error fetching NPM stats:', error);
        setStats({
          totalDownloads: 0,
          previousWeekDownloads: 0,
          change: 0,
          isIncrease: false,
          error: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border-warm)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        Loading downloads...
      </div>
    );
  }

  if (!stats || stats.error) {
    return null; // Fail silently
  }

  // Determine arrow and color based on change
  // Only show trend if we have valid comparison data
  const hasValidComparison = stats.hasValidComparison !== false;
  
  let changeColor = '#6b7280'; // Neutral gray
  let arrowIcon = null;
  let showPercentage = false;
  
  if (hasValidComparison) {
    if (stats.change > 0.1) {
      // Increase - green
      changeColor = '#10b981';
      arrowIcon = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3L12 7H9V13H7V7H4L8 3Z" fill={changeColor} />
        </svg>
      );
      showPercentage = true;
    } else if (stats.change < -0.1) {
      // Decrease - red
      changeColor = '#ef4444';
      arrowIcon = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 13L4 9H7V3H9V9H12L8 13Z" fill={changeColor} />
        </svg>
      );
      showPercentage = true;
    } else if (Math.abs(stats.change) <= 0.1) {
      // Neutral - no significant change
      changeColor = '#6b7280';
      arrowIcon = (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8H13" stroke={changeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
      showPercentage = false; // Don't show 0.0% for neutral
    }
  }
  // If no valid comparison, don't show arrow or percentage

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border-warm)',
      borderRadius: '8px',
      fontSize: '14px',
      color: 'var(--text)',
      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
    }}>
      <span style={{ fontWeight: '600' }}>
        {stats.totalDownloads.toLocaleString()}
      </span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        weekly downloads
      </span>
      {arrowIcon && hasValidComparison && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: changeColor,
          fontWeight: '500',
          fontSize: '12px'
        }}>
          {arrowIcon}
          {showPercentage && Math.abs(stats.change) > 0.01 && (
            <span>{Math.abs(stats.change).toFixed(1)}%</span>
          )}
        </div>
      )}
    </div>
  );
}

