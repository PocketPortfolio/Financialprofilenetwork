'use client';

import React, { useState, useEffect } from 'react';
import { bearerFetch } from '@/app/lib/auth/bearerFetch';

interface AuditLog {
  id: string;
  action: string;
  aiReasoning: string | null;
  metadata: any;
  createdAt: string;
  lead: {
    id: string;
    email: string;
    companyName: string;
  } | null;
}

interface ActionFeedProps {
  getIdToken?: () => Promise<string>;
}

export function ActionFeed({ getIdToken }: ActionFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    try {
      const response = getIdToken
        ? await bearerFetch('/api/agent/audit-feed?limit=20', undefined, getIdToken)
        : await fetch('/api/agent/audit-feed?limit=20');
      if (!response.ok) return;
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load action feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [getIdToken]);

  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      'EMAIL_SENT': '📧 Sent email',
      'EMAIL_RECEIVED': '📥 Received reply',
      'RESEARCH_DONE': '🔍 Completed research',
      'LEAD_SCORED': '📊 Scored lead',
      'STATUS_CHANGED': '🔄 Updated status',
      'COMPLIANCE_CHECK': '✅ Compliance check',
      'RATE_LIMIT_HIT': '⏸️ Rate limit reached',
      'KILL_SWITCH_ACTIVATED': '🛑 Emergency stop',
    };
    return actionMap[action] || action;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="brand-card" style={{ padding: 'var(--space-4)' }}>
        <h3 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
          Pilot Activity
        </h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="brand-card" style={{ padding: 'var(--space-4)', maxHeight: '600px', overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--text)', fontSize: 'var(--font-size-md)' }}>
        🤖 Pilot Activity
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-4)' }}>
            No recent activity
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text)', fontWeight: 'var(--font-medium)' }}>
                  {formatAction(log.action)}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {formatTime(log.createdAt)}
                </span>
              </div>
              {log.lead && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                  {log.lead.companyName} ({log.lead.email})
                </div>
              )}
              {log.aiReasoning && (
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--text-secondary)',
                  marginTop: 'var(--space-2)',
                  fontStyle: 'italic',
                  lineHeight: 'var(--line-relaxed)',
                }}>
                  {log.aiReasoning}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
