'use client';

import { useState } from 'react';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import ProductionNavbar from '../components/marketing/ProductionNavbar';

export default function RetrieveApiKeyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [corporateLicense, setCorporateLicense] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setApiKey(null);
    setCorporateLicense(null);
    setTier(null);

    try {
      // Use query parameter route (more reliable than path parameter with @ symbol)
      const response = await fetch(`/api/api-keys?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey || data.corporateLicense) {
          setApiKey(data.apiKey);
          setCorporateLicense(data.corporateLicense);
          setTier(data.tier);
        } else {
          setError('No API keys found for this email. Make sure you have completed a purchase.');
        }
      } else if (response.status === 503) {
        // Handle quota exceeded error
        const errorData = await response.json().catch(() => ({}));
        setError('Service temporarily unavailable due to high demand. Please try again in a few minutes.');
      } else {
        setError('Failed to retrieve API keys. Please check your email and try again.');
      }
    } catch (err) {
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
            Enter the email address you used when purchasing to retrieve your API key
          </p>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <form onSubmit={handleRetrieve}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
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
              type="submit"
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
          </form>
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
                border: '1px solid var(--border)',
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
                  alert('API key copied to clipboard!');
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
              💡 Save this key securely. You'll need it for the Google Sheets formula generator.
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
                border: '1px solid var(--border)',
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
                  alert('Corporate license key copied and saved!');
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
    </div>
  );
}


