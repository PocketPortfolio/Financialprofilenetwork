/**
 * OPERATION VELOCITY: Sprint 3 - Open Source Flex
 * System Status footer component showing real-time API latency
 */

'use client';

import { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // Measure API latency
    const measureLatency = async () => {
      const start = performance.now();
      try {
        // Ping a lightweight endpoint
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-store' 
        });
        const end = performance.now();
        
        if (response.ok) {
          setLatency(Math.round(end - start));
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    // Initial measurement
    measureLatency();

    // Update every 30 seconds
    const interval = setInterval(measureLatency, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      paddingTop: '16px',
      marginTop: '32px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span>System Status:</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: status === 'online' ? '#16a34a' : '#dc2626'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: status === 'online' ? '#16a34a' : '#dc2626',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></span>
              {status === 'online' ? 'Online' : 'Offline'}
            </span>
            {latency !== null && status === 'online' && (
              <span>
                Market Data: <span style={{
                  fontFamily: 'monospace',
                  fontWeight: '600'
                }}>{latency}ms</span>
              </span>
            )}
          </div>
          <div>
            <a
              href="/static/why-we-are-fast"
              style={{
                color: 'var(--accent-warm)',
                textDecoration: 'none',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.opacity = '1';
              }}
            >
              Why we are fast →
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
