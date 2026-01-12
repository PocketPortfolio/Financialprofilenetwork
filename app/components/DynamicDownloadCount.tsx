'use client';

import React, { useState, useEffect } from 'react';

export default function DynamicDownloadCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/npm-stats', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setCount(data.totalDownloads || 0);
        }
      } catch (error) {
        console.error('Error fetching NPM stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every hour
    const interval = setInterval(fetchStats, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <span>7,700+</span>; // Fallback while loading
  }

  if (count === null || count === 0) {
    return <span>7,700+</span>; // Fallback on error
  }

  // Format: "7,742" or "7,700+" if less than 7700
  const formatted = count >= 7700 
    ? count.toLocaleString() 
    : '7,700+';

  return <span>{formatted}</span>;
}


