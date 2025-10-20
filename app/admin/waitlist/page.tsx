'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { AdminWaitlistEntry } from '../../lib/waitlist/types';

export default function AdminWaitlistPage() {
  // Development-only guard
  if (process.env.NODE_ENV === 'production') {
    // In production, this should be protected by admin authentication
    // For now, we'll restrict access entirely
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Admin access is not available in production</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }
  const [entries, setEntries] = useState<AdminWaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadEntries = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const waitlistRef = collection(db, 'waitlist');
      let q = query(
        waitlistRef,
        orderBy('created_at', 'desc'),
        limit(50)
      );

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const newEntries: AdminWaitlistEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        email_normalized: doc.data().email_normalized,
        name: doc.data().name,
        region: doc.data().region,
        role: doc.data().role,
        status: doc.data().status,
        source: doc.data().source,
        created_at: doc.data().created_at
      }));

      if (reset) {
        setEntries(newEntries);
      } else {
        setEntries(prev => [...prev, ...newEntries]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === 50);
    } catch (err) {
      console.error('Failed to load waitlist entries:', err);
      setError('Failed to load waitlist entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries(true);
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.email_normalized.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.name && entry.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.region && entry.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'subscribed': return { color: '#059669', backgroundColor: '#dcfce7' };
      case 'pending': return { color: '#d97706', backgroundColor: '#fef3c7' };
      case 'unconfirmed': return { color: '#ea580c', backgroundColor: '#fed7aa' };
      case 'blocked': return { color: '#dc2626', backgroundColor: '#fecaca' };
      default: return { color: '#6b7280', backgroundColor: '#f3f4f6' };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            Waitlist Admin
          </h1>
          <p style={{
            color: 'var(--muted)',
            fontSize: '16px',
            margin: 0
          }}>
            Development-only access to waitlist entries
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand)' }}>
              {entries.length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Total Entries
            </div>
          </div>
          
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--pos)' }}>
              {entries.filter(e => e.status === 'subscribed').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Subscribed
            </div>
          </div>
          
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {entries.filter(e => e.status === 'unconfirmed').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Unconfirmed
            </div>
          </div>
          
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--neg)' }}>
              {entries.filter(e => e.status === 'blocked').length}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Blocked
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by email, name, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: 'var(--neg)'
          }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--chrome)',
                  borderBottom: '1px solid var(--card-border)'
                }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Region
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Role
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Source
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--muted)'
                    }}>
                      Loading waitlist entries...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--muted)'
                    }}>
                      {searchTerm ? 'No entries match your search.' : 'No waitlist entries found.'}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} style={{
                      borderBottom: '1px solid var(--card-border)'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)',
                        fontFamily: 'monospace'
                      }}>
                        {entry.email_normalized}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)'
                      }}>
                        {entry.name || '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)'
                      }}>
                        {entry.region || '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)'
                      }}>
                        {entry.role || '-'}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...getStatusColor(entry.status)
                        }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)'
                      }}>
                        {entry.source}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        color: 'var(--text)'
                      }}>
                        {formatDate(entry.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <button
              onClick={() => loadEntries(false)}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--muted)',
            margin: 0
          }}>
            🔒 This admin interface is only available in development mode.
            In production, this should be protected by admin authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
