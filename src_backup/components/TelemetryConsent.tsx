/**
 * Telemetry Consent Banner (GDPR/Privacy-friendly)
 */
import { useState, useEffect } from 'react';
import { telemetry } from '@/lib/telemetry';
import { userPrefsStorage } from '@/lib/secureStorage';

export default function TelemetryConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't made a choice
    const hasConsented = userPrefsStorage.has('telemetry_enabled');
    setShow(!hasConsented);
  }, []);

  const handleAccept = () => {
    telemetry.enable();
    setShow(false);
  };

  const handleDecline = () => {
    telemetry.disable();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1a1a1a',
        color: 'white',
        padding: '16px 20px',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h3 id="consent-title" style={{ margin: '0 0 8px', fontSize: 16 }}>
            Privacy & Analytics
          </h3>
          <p id="consent-description" style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#ccc' }}>
            We collect anonymous usage data to improve the app. No personal information is stored.
            You can opt out anytime in settings.{' '}
            <a
              href="/docs/privacy"
              style={{ color: '#66b3ff', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'white',
              border: '1px solid #666',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '10px 20px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

