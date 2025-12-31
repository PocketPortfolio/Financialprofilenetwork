'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AlertModal from '../../components/modals/AlertModal';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [corporateLicense, setCorporateLicense] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    // Fetch API keys if session exists
    if (sessionId) {
      fetchApiKeys();
    }
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  const fetchApiKeys = async (retryCount = 0) => {
    try {
      if (!sessionId) return;

      // Fetch API keys using Stripe session ID (more reliable than localStorage)
      const response = await fetch(`/api/api-keys/session/${encodeURIComponent(sessionId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey || data.corporateLicense) {
          // API keys found - set them immediately
          setApiKey(data.apiKey);
          setCorporateLicense(data.corporateLicense);
          setTier(data.tier);
          setEmail(data.email);
        } else if (retryCount < 3) {
          // Keys not found yet - webhook might still be processing
          // Retry up to 3 times with 2 second delays
          console.log(`API keys not found yet, retrying... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => fetchApiKeys(retryCount + 1), 2000);
        } else {
          // After 3 retries, fallback to email lookup
          console.log('API keys not found after retries, trying email fallback');
          const storedEmail = localStorage.getItem('sponsor_email');
          if (storedEmail) {
            const fallbackResponse = await fetch(`/api/api-keys/${encodeURIComponent(storedEmail)}`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setApiKey(fallbackData.apiKey);
              setCorporateLicense(fallbackData.corporateLicense);
              setTier(fallbackData.tier);
              setEmail(storedEmail);
            }
          }
        }
      } else if (retryCount < 3) {
        // Error response - retry if we haven't exceeded retry limit
        console.log(`Error fetching API keys, retrying... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => fetchApiKeys(retryCount + 1), 2000);
      } else {
        // After 3 retries, fallback to localStorage/email lookup
        const storedEmail = localStorage.getItem('sponsor_email');
        if (storedEmail) {
          const fallbackResponse = await fetch(`/api/api-keys/${encodeURIComponent(storedEmail)}`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setApiKey(fallbackData.apiKey);
            setCorporateLicense(fallbackData.corporateLicense);
            setTier(fallbackData.tier);
            setEmail(storedEmail);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      if (retryCount < 3) {
        // Retry on error if we haven't exceeded retry limit
        console.log(`Error occurred, retrying... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => fetchApiKeys(retryCount + 1), 2000);
      } else {
        // After 3 retries, fallback to localStorage/email lookup
        const storedEmail = localStorage.getItem('sponsor_email');
        if (storedEmail) {
          try {
            const fallbackResponse = await fetch(`/api/api-keys/${encodeURIComponent(storedEmail)}`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setApiKey(fallbackData.apiKey);
              setCorporateLicense(fallbackData.corporateLicense);
              setTier(fallbackData.tier);
              setEmail(storedEmail);
            }
          } catch (fallbackError) {
            console.error('Fallback fetch also failed:', fallbackError);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ color: 'var(--text)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '60px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center',
      color: 'var(--text)'
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '2px solid var(--accent-warm)',
        borderRadius: '12px',
        padding: '48px 32px',
        marginBottom: '32px'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          ❤️
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.5rem)',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: 'var(--text)'
        }}>
          Thank You!
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Your support means the world to us. You're helping make Pocket Portfolio better for everyone.
        </p>
        {sessionId && (
          <p style={{
            fontSize: '14px',
            color: 'var(--muted)',
            fontFamily: 'monospace',
            background: 'var(--bg)',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}

        {/* API Key Display */}
        {apiKey && (
          <div style={{
            background: 'var(--bg)',
            border: '2px solid var(--accent-warm)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              🎉 Your API Key
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Use this key for unlimited API calls:
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <code style={{
                flex: 1,
                padding: '12px',
                background: 'var(--surface)',
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
              💡 Save this key securely. You'll need it for the Google Sheets formula generator.
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '8px'
            }}>
              Lost your key? <Link href="/retrieve-api-key" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>Retrieve it here</Link> or view it in <Link href="/settings" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>Settings</Link>.
            </p>
          </div>
        )}

        {/* Corporate License Display */}
        {corporateLicense && (
          <div style={{
            background: 'var(--bg)',
            border: '2px solid var(--accent-warm)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              🏢 Your Corporate License Key
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Use this key to unlock PDF downloads in the Advisor tool:
            </p>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <code style={{
                flex: 1,
                padding: '12px',
                background: 'var(--surface)',
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
                  // Store in localStorage for Advisor tool
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
            <p style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '8px'
            }}>
              Lost your key? <Link href="/retrieve-api-key" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>Retrieve it here</Link> or view it in <Link href="/settings" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>Settings</Link>.
            </p>
          </div>
        )}
        
        {!apiKey && !corporateLicense && (
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              ⏳ API Key Processing
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Your API key is being generated. This usually takes just a few seconds.
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '8px'
            }}>
              If your key doesn't appear, you can <Link href="/retrieve-api-key" style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}>retrieve it here</Link> using your email address.
            </p>
          </div>
        )}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: 'var(--accent-warm)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '2px solid var(--border)',
              color: 'var(--text)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-warm)';
              e.currentTarget.style.color = 'var(--accent-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        You should receive a confirmation email from Stripe shortly. If you have any questions, please contact us.
      </p>

      {/* Alert Modal */}
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

export default function SponsorSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ color: 'var(--text)' }}>Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

