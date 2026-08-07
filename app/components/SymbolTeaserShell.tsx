import Link from 'next/link';
import { developerUtilityCheckoutHref } from '@/lib/bot-gate';

export type SymbolTeaserQuote = {
  price?: number | null;
  change?: number | null;
  changePct?: number | null;
  currency?: string | null;
} | null;

type SymbolTeaserShellProps = {
  symbol: string;
  name: string;
  /** Path for returnTo, e.g. /s/aapl or /s/aapl/json-api */
  returnPath: string;
  quote?: SymbolTeaserQuote;
  /** Rate-budget exhausted vs soft teaser framing */
  rateBudgetExhausted?: boolean;
  variant?: 'symbol' | 'json-api';
};

/** Deterministic ≤7 preview points — not real market history (cannot be paginated). */
function previewSparkPoints(symbol: string, changePct?: number | null): number[] {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
  const drift = typeof changePct === 'number' && Number.isFinite(changePct) ? changePct / 100 : 0;
  const points: number[] = [];
  let v = 50 + (Math.abs(hash) % 20);
  for (let i = 0; i < 7; i++) {
    const wobble = ((hash >> (i * 3)) & 7) - 3;
    v = Math.max(8, Math.min(92, v + wobble + drift * 4));
    points.push(v);
  }
  return points;
}

function Sparkline({ symbol, changePct }: { symbol: string; changePct?: number | null }) {
  const pts = previewSparkPoints(symbol, changePct);
  const w = 280;
  const h = 56;
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const range = Math.max(1, max - min);
  const d = pts
    .map((y, i) => {
      const x = (i / (pts.length - 1)) * w;
      const py = h - ((y - min) / range) * (h - 8) - 4;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${symbol} preview sparkline`}
      style={{ display: 'block' }}
    >
      <path d={d} fill="none" stroke="var(--accent-warm)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * PLG human teaser for /s/[symbol] when rate budget is exhausted (or json-api stub).
 * Free fields only — no full OHLCV / CSV / live API series in the DOM.
 */
export default function SymbolTeaserShell({
  symbol,
  name,
  returnPath,
  quote = null,
  rateBudgetExhausted = true,
  variant = 'symbol',
}: SymbolTeaserShellProps) {
  const checkoutHref = developerUtilityCheckoutHref(
    returnPath,
    rateBudgetExhausted ? 'symbol_farm_rate' : 'symbol_teaser',
  );
  const price =
    typeof quote?.price === 'number' && Number.isFinite(quote.price) ? quote.price : null;
  const changePct =
    typeof quote?.changePct === 'number' && Number.isFinite(quote.changePct)
      ? quote.changePct
      : null;
  const changeAbs =
    typeof quote?.change === 'number' && Number.isFinite(quote.change) ? quote.change : null;
  const currency = quote?.currency || 'USD';

  const sampleJson = {
    symbol,
    last_price: price ?? '[LIVE_ON_UPGRADE]',
    history: '[UPGRADE_REQUIRED]',
  };

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '32px 16px 64px',
        color: 'var(--text)',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent-warm)',
          marginBottom: '12px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        {variant === 'json-api' ? 'JSON API · Preview' : 'Ticker · Free preview'}
      </p>

      <h1
        style={{
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
        }}
      >
        {symbol}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '16px' }}>
        {name}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Last price
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>
            {price != null ? `${currency} ${price.toFixed(2)}` : '—'}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            24h change
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color:
                changePct == null
                  ? 'var(--text)'
                  : changePct >= 0
                    ? 'var(--accent-warm)'
                    : 'var(--text-secondary)',
            }}
          >
            {changePct != null
              ? `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`
              : '—'}
            {changeAbs != null ? (
              <span style={{ fontSize: '13px', fontWeight: 500, marginLeft: '8px', opacity: 0.75 }}>
                ({changeAbs >= 0 ? '+' : ''}
                {changeAbs.toFixed(2)})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Preview sparkline (≤7 cached points · not full history)
        </div>
        <Sparkline symbol={symbol} changePct={changePct} />
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          sample_json schema stub
        </div>
        <pre
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.5,
            overflow: 'auto',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            color: 'var(--text-secondary)',
          }}
        >
          {JSON.stringify(sampleJson, null, 2)}
        </pre>
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: '14px',
          border: '1px solid rgba(245, 158, 11, 0.45)',
          background:
            'linear-gradient(180deg, rgba(11, 13, 16, 0.92) 0%, rgba(17, 17, 17, 0.96) 100%)',
          padding: '28px 22px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent-warm)',
            marginBottom: '10px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Developer Utility Tier Required
        </div>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 12px',
            color: '#f5f5f5',
          }}
        >
          {rateBudgetExhausted
            ? 'Free preview limit reached for ticker data'
            : 'Full API & CSV access is locked'}
        </h2>
        <p
          style={{
            color: 'rgba(245,245,245,0.72)',
            lineHeight: 1.55,
            marginBottom: '20px',
            fontSize: '15px',
          }}
        >
          Unlock unlimited symbol access, full time-series JSON streams, and CSV downloads. Bots
          stay blocked — this teaser is for human browsers only.
        </p>
        <Link
          href={checkoutHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 22px',
            background: 'var(--accent-warm)',
            color: '#0b0d10',
            fontWeight: 800,
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '15px',
          }}
        >
          Unlock Developer API Access →
        </Link>
      </div>
    </div>
  );
}
