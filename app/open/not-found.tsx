import Link from 'next/link';

/**
 * 404 for the Open Portfolio surface — keeps O. chrome (layout navbar)
 * instead of falling through to the root not-found with Pocket nav.
 */
export default function OpenNotFound() {
  return (
    <section
      style={{
        padding: 'clamp(64px, 12vw, 120px) 24px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: '16px',
        }}
      >
        404 · Route not on substrate
      </p>
      <h1
        style={{
          fontSize: 'clamp(32px, 6vw, 48px)',
          fontWeight: 800,
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
        }}
      >
        This path is not on Open Portfolio.
      </h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
        Consumer app routes (dashboard, features, tools) live on Pocket Portfolio. Developer
        routes are listed in the menu above.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 22px',
          background: 'var(--accent-warm)',
          color: '#0b0d10',
          textDecoration: 'none',
          fontWeight: 700,
          borderRadius: '6px',
        }}
      >
        Back to Open Portfolio home
      </Link>
    </section>
  );
}
