'use client';

import { useState } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import AlertModal from '../components/modals/AlertModal';
import { useAuth } from '../hooks/useAuth';
import { bearerFetch } from '../lib/auth/bearerFetch';

export default function RetrieveApiKeyPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [corporateLicense, setCorporateLicense] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleRetrieve = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setApiKey(null);
    setCorporateLicense(null);
    setTier(null);

    try {
      const response = await bearerFetch(
        '/api/api-keys/user',
        { cache: 'no-store' },
        () => user.getIdToken()
      );

      if (response.ok) {
        const data = await response.json();
        if (data.apiKey || data.corporateLicense) {
          setApiKey(data.apiKey);
          setCorporateLicense(data.corporateLicense);
          setTier(data.tier);
        } else {
          setError('No API keys found for your account. Make sure you have completed a purchase.');
        }
      } else if (response.status === 401) {
        setError('Your session has expired. Please sign in again using the Sign In button in the navbar.');
      } else if (response.status === 403) {
        setError('You do not have permission to retrieve API keys for this account.');
      } else if (response.status === 503) {
        setError('Service temporarily unavailable due to high demand. Please try again in a few minutes.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to retrieve API keys. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <SEOHead 
        title="Retrieve API Key - Pocket Portfolio"
        description="Retrieve your API key if you've lost it"
      />
      <ProductionNavbar />
      
      <main style={{ 
        flex: 1, 
        padding: '40px 20px',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: 'var(--text)'
          }}>
            Retrieve API Key
          </h1>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '16px'
          }}>
            Sign in to retrieve the API keys linked to your account
          </p>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--border-warm)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          {authLoading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Checking sign-in status...</p>
          ) : !isAuthenticated ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '16px',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                You must be signed in to retrieve your API keys. Use the <strong>Sign In</strong> button in the navbar, then return to this page.
              </p>
              <Link
                href="/dashboard"
                style={{
                  color: 'var(--accent-warm)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Go to Dashboard to sign in →
              </Link>
            </div>
          ) : (
            <>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '20px'
              }}>
                Signed in as <strong>{user?.email}</strong>
              </p>
              {error && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handleRetrieve}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: loading ? 'var(--muted)' : 'var(--accent-warm)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? 'Retrieving...' : 'Retrieve API Key'}
              </button>
            </>
          )}
        </div>

        {/* Display API Keys */}
        {apiKey && (
          <div style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent-warm)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              🎉 Your API Key
            </h2>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <code style={{
                flex: 1,
                padding: '12px',
                background: 'var(--bg)',
                border: '2px solid var(--border-warm)',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: 'var(--text)',
                wordBreak: 'break-all'
              }}>
                {apiKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  setAlertModal({
                    isOpen: true,
                    title: 'Copied!',
                    message: 'API key copied to clipboard!',
                    type: 'success'
                  });
                }}
                style={{
                  padding: '12px 16px',
                  background: 'var(--accent-warm)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Copy
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '8px'
            }}>
              💡 Save this key securely. Use it for unlimited API calls across all endpoints (stock prices, market data, historical data, etc.)
            </p>
          </div>
        )}

        {corporateLicense && (
          <div style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent-warm)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              🏢 Your Corporate License Key
            </h2>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <code style={{
                flex: 1,
                padding: '12px',
                background: 'var(--bg)',
                border: '2px solid var(--border-warm)',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: 'var(--text)',
                wordBreak: 'break-all'
              }}>
                {corporateLicense}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(corporateLicense);
                  localStorage.setItem('CORPORATE_KEY', corporateLicense);
                  setAlertModal({
                    isOpen: true,
                    title: 'Saved!',
                    message: 'Corporate license key copied and saved!',
                    type: 'success'
                  });
                }}
                style={{
                  padding: '12px 16px',
                  background: 'var(--accent-warm)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Copy & Save
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '8px'
            }}>
              💡 This key is automatically saved to your browser for the Advisor tool.
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link
            href="/sponsor"
            style={{
              color: 'var(--accent-warm)',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Don't have an API key? Become a Patron →
          </Link>
        </div>
      </main>
      
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
}
