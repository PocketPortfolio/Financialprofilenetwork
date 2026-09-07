/**
 * Above-the-fold IBKR Flex Query guide — pass 2 engagement fix.
 * Targets login-intent bounce and gives an immediate path to CSV import.
 */
import type { CSSProperties } from 'react';

export default function IbkrFlexQuickStart() {
  const jumpStyle: CSSProperties = {
    display: 'inline-block',
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    cursor: 'pointer',
  };

  return (
    <section
      id="step1"
      aria-label="Interactive Brokers Flex Query export steps"
      style={{
        marginBottom: 24,
        padding: '20px 24px',
        border: '1px solid var(--border-warm, var(--border-subtle))',
        background: 'var(--warm-bg, var(--surface))',
        borderRadius: 12,
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--accent-warm, #f59e0b)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Not IBKR login — CSV import guide
      </p>

      <div
        role="note"
        style={{
          marginBottom: 16,
          padding: '12px 14px',
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
        }}
      >
        <strong style={{ color: 'var(--text)' }}>Looking for Client Portal login?</strong> This page imports your
        exported trades — it is not the IBKR website.{' '}
        <a
          href="https://www.interactivebrokers.com/portal"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-warm)', fontWeight: 600 }}
        >
          Open IBKR Client Portal →
        </a>
      </div>

      <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
        Export IBKR trades in 3 steps (Flex Query or Activity Statement)
      </h2>
      <ol
        style={{
          margin: '0 0 16px',
          paddingLeft: 20,
          fontSize: 15,
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
        }}
      >
        <li style={{ marginBottom: 8 }}>
          In IBKR Client Portal → <strong>Performance &amp; Reports</strong> →{' '}
          <strong>Flex Queries</strong> (or download an Activity Statement CSV).
        </li>
        <li style={{ marginBottom: 8 }}>
          Include columns: <code>Symbol</code>, <code>Quantity</code>, <code>T.Price</code>,{' '}
          <code>Proceeds</code>, <code>Comm/Fee</code> (or <code>Commission</code>).
        </li>
        <li>
          Drop the CSV below — parsing runs in your browser; your ledger is not uploaded to our servers.
        </li>
      </ol>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <a
          href="#import-now"
          style={{
            ...jumpStyle,
            background: 'var(--accent-warm)',
            color: '#0b0d10',
          }}
        >
          I have a CSV — import now ↓
        </a>
        <a
          href="/samples/ibkr-flex-sample.csv"
          download="ibkr-flex-sample.csv"
          style={{
            ...jumpStyle,
            border: '2px solid var(--accent-warm)',
            color: 'var(--text)',
            background: 'transparent',
          }}
        >
          Download sample Flex CSV
        </a>
      </div>

      <details
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 12,
          color: 'var(--text-secondary)',
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text)' }}>
          Common Flex Query issues (expand)
        </summary>
        <ul style={{ margin: '12px 0 0', paddingLeft: 18 }}>
          <li style={{ marginBottom: 6 }}>
            Use <strong>CSV</strong> output — PDF/HTML statements will not parse.
          </li>
          <li style={{ marginBottom: 6 }}>
            Multi-currency accounts: keep the <code>Currency</code> column so FX legs stay correct.
          </li>
          <li style={{ marginBottom: 6 }}>
            If the file opens blank in Excel, re-export with UTF-8 / comma delimiter from Flex Queries.
          </li>
          <li>
            Still stuck? Try the sample CSV above, confirm the dropzone turns green, then swap in your export.
          </li>
        </ul>
      </details>
    </section>
  );
}
