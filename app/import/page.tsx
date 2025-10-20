'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import SEOHead from '../components/SEOHead';
import MobileHeader from '../components/nav/MobileHeader';
import CSVImporter from '../components/CSVImporter';

interface Trade {
  id: string;
  date: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  currency: string;
  qty: number;
  price: number;
  mock: boolean;
}

export default function ImportPage() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();
  const { importTrades } = useTrades();
  const [importHistory, setImportHistory] = useState<Array<{
    id: string;
    broker: string;
    tradesCount: number;
    date: string;
    status: 'success' | 'error';
  }>>([]);

  const handleCSVImport = async (trades: Trade[]) => {
    try {
      await importTrades(trades);
      
      // Add to import history
      const newImport = {
        id: Date.now().toString(),
        broker: 'Auto-detected',
        tradesCount: trades.length,
        date: new Date().toLocaleString(),
        status: 'success' as const
      };
      
      setImportHistory(prev => [newImport, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show success message
      alert(`Successfully imported ${trades.length} trades!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check your CSV format.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <SEOHead 
          title="Import Trades - Pocket Portfolio"
          description="Import your trades from any broker with our universal CSV importer"
        />
        <MobileHeader title="Import" />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to import trades</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Import your trades from any broker with our universal CSV importer
            </p>
            <button
              onClick={signInWithGoogle}
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <SEOHead 
        title="Import Trades - Pocket Portfolio"
        description="Import your trades from any broker with our universal CSV importer"
      />
      <MobileHeader title="Import" />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        border: '2px solid var(--signal)',
        borderRadius: '16px',
        marginTop: '20px',
        marginBottom: '20px',
        background: 'var(--surface)',
        boxShadow: '0 8px 32px rgba(255, 107, 53, 0.2)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>📥</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                color: 'var(--text)'
              }}>
                Import Your Trades
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '16px',
                margin: 0
              }}>
                Upload CSV files from any broker and we'll automatically detect the format
              </p>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Account Management</h2>
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              style={{
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Data
            </button>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Account
            </button>
          </div>
        </div>

        {/* Supported Brokers */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Supported Brokers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--accent-warm)' }}>US Brokers</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                <li>• Charles Schwab</li>
                <li>• Vanguard</li>
                <li>• E*TRADE</li>
                <li>• Fidelity</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--accent-warm)' }}>UK/EU Brokers</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                <li>• Trading212</li>
                <li>• Freetrade</li>
                <li>• DEGIRO</li>
                <li>• IG, Saxo, Revolut</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--accent-warm)' }}>Crypto Exchanges</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                <li>• Kraken</li>
                <li>• Binance</li>
                <li>• Coinbase</li>
                <li>• IBKR Flex</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CSV Importer */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Upload Your CSV</h2>
          <CSVImporter onImport={handleCSVImport} />
        </div>

        {/* Import History */}
        {importHistory.length > 0 && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Recent Imports</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {importHistory.map((importItem) => (
                <div
                  key={importItem.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'var(--bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{importItem.broker}</div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      {importItem.tradesCount} trades • {importItem.date}
                    </div>
                  </div>
                  <div style={{
                    color: importItem.status === 'success' ? 'var(--pos)' : 'var(--neg)',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {importItem.status === 'success' ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Import Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Auto-Detection</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Automatically detects broker format with 95%+ accuracy
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌍</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Multi-Currency</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Handles USD, GBP, EUR and other currencies automatically
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Privacy-First</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                All processing happens locally in your browser
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Fast Processing</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Process thousands of trades in seconds
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
