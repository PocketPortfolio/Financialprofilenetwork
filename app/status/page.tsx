import { Metadata } from 'next';
import ProductionNavbar from '@/app/components/marketing/ProductionNavbar';

export const metadata: Metadata = {
  title: 'System Status | Pocket Portfolio',
  description: 'Real-time status of Pocket Portfolio services, APIs, and infrastructure.',
  robots: 'index,follow',
};

export default function StatusPage() {
  const services = [
    {
      name: 'API Services',
      status: 'operational',
      description: 'JSON API endpoints for ticker data',
    },
    {
      name: 'Quote Data',
      status: 'operational',
      description: 'Real-time price quotes and market data',
    },
    {
      name: 'Historical Data',
      status: 'operational',
      description: 'OHLCV historical price data',
    },
    {
      name: 'Portfolio Tracker',
      status: 'operational',
      description: 'Dashboard and portfolio management',
    },
    {
      name: 'Sovereign Sync',
      status: 'operational',
      description: 'Google Drive bidirectional sync',
    },
  ];

  return (
    <>
      <ProductionNavbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          padding: 'clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 'clamp(32px, 6vw, 48px)' }}>
            <h1
              style={{
                fontSize: 'clamp(32px, 6vw, 48px)',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--text)',
              }}
            >
              System Status
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              Real-time status of Pocket Portfolio services and infrastructure.
            </p>
          </div>

          {/* Status Overview */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
                }}
              />
              <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>
                All Systems Operational
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Last updated: {new Date().toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
            </p>
          </div>

          {/* Services List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {services.map((service) => (
              <div
                key={service.name}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#34d399',
                        boxShadow: '0 0 6px rgba(52, 211, 153, 0.4)',
                      }}
                    />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
                      {service.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, marginLeft: '22px' }}>
                    {service.description}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#34d399',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div
            style={{
              marginTop: '48px',
              padding: '20px',
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              <strong>Status Page Updates:</strong> This page is manually maintained. For real-time incident
              notifications, follow{' '}
              <a
                href="https://x.com/P0cketP0rtf0li0"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-warm)', textDecoration: 'none' }}
              >
                @P0cketP0rtf0li0
              </a>{' '}
              on X.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

