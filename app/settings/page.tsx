'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import Header from '../components/Header';

export default function SettingsPage() {
  const { isAuthenticated, user, signInWithGoogle, logout } = useAuth();

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
          title="Settings - Pocket Portfolio"
          description="Manage your account settings and preferences"
        />
        <Header />
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Sign in to access settings</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Manage your account settings and preferences
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
        title="Settings - Pocket Portfolio"
        description="Manage your account settings and preferences"
      />
      <Header />
      
      <main style={{ 
        flex: 1, 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
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
              <span style={{ fontSize: '24px' }}>⚙️</span>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                color: 'var(--text)'
              }}>
                Settings
              </h1>
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '16px',
                margin: 0
              }}>
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Account</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                {user?.email || 'User'}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Signed in with Google
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Sign out from Google
          </button>
        </div>

        {/* Preferences Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Preferences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Default Currency</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>USD</div>
              </div>
              <select style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Auto-refresh Data</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>Update prices every 30 seconds</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--accent-warm)',
                  borderRadius: '24px',
                  transition: '0.3s'
                }}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Data Management</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--text)',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              📥 Export Portfolio Data
            </button>
            <button style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--text)',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              🔄 Reset Portfolio
            </button>
            <button style={{
              background: 'var(--bg)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--danger)',
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              🗑️ Delete All Data
            </button>
          </div>
        </div>

        {/* About Section */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>About</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--muted)' }}>
            <div>Pocket Portfolio v2.0</div>
            <div>Built with Next.js 14 and React 18</div>
            <div>Open source portfolio tracker</div>
            <div style={{ marginTop: '8px' }}>
              <a href="/" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>
                Learn more about Pocket Portfolio →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
