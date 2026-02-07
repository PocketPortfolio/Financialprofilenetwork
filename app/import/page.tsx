'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrades } from '../hooks/useTrades';
import SEOHead from '../components/SEOHead';
import CSVImporter from '../components/CSVImporter';
import AlertModal from '../components/modals/AlertModal';

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
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
      setAlertModal({
        isOpen: true,
        title: 'Import Successful',
        message: `Successfully imported ${trades.length} trades!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Import failed:', error);
      setAlertModal({
        isOpen: true,
        title: 'Import Failed',
        message: 'Import failed. Please check your CSV format.',
        type: 'error'
      });
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
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        border: '2px solid var(--signal)',
        borderRadius: '16px',
        marginTop: '0',
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
                Auto-detection for 20+ brokers. Smart Mapping for everything else.
              </p>
            </div>
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
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Supported Brokers</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 16px 0' }}>
            Auto-detection for 20+ brokers. Smart Mapping for everything else.
          </p>
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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
