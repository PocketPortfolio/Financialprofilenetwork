/**
 * Above-the-fold IBKR Flex Query guide — reduces login-intent bounce on /import/interactive-brokers.
 */
export default function IbkrFlexQuickStart() {
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
      <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
        Export IBKR trades in 3 steps (Flex Query or Activity Statement)
      </h2>
      <ol
        style={{
          margin: 0,
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
          <code>Proceeds</code>, <code>Comm/Fee</code>.
        </li>
        <li>
          Drop the CSV below — parsing runs in your browser; your ledger is not uploaded to our servers.
        </li>
      </ol>
    </section>
  );
}
