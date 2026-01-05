'use client';

import React, { useState, useEffect } from 'react';

interface NPMStatsData {
  totalDownloads: number;
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
            error: true,
          });
        }
      } catch (error) {
        console.error('Error fetching NPM stats:', error);
        setStats({
          totalDownloads: 0,
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
        Total downloads
      </span>
    </div>
  );
}

