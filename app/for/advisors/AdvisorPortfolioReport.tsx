'use client';

import {
  SOVEREIGN_REPORT,
  formatReportCurrency,
  formatReportDate,
} from '@/app/lib/advisors/sovereign-report-theme';
import type { PortfolioReportPosition } from '@/app/lib/advisors/generate-portfolio-report-pdf';

export interface AdvisorPortfolioReportProps {
  clientName: string;
  reportDate?: string;
  totalValue: number;
  primaryCurrency: string;
  positions: PortfolioReportPosition[];
  firmLogoDataUrl?: string | null;
  showWatermark?: boolean;
}

const mono = 'ui-monospace, Consolas, "Courier New", monospace';
const sans = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

function formatShares(shares: number): string {
  return shares % 1 === 0 ? shares.toLocaleString('en-GB') : shares.toFixed(2);
}

/**
 * A4-width sovereign report surface — matches vector PDF output (not a themed screen card).
 */
export default function AdvisorPortfolioReport({
  clientName,
  reportDate = formatReportDate(),
  totalValue,
  primaryCurrency,
  positions,
  firmLogoDataUrl,
  showWatermark = false,
}: AdvisorPortfolioReportProps) {
  const currency = primaryCurrency || 'GBP';

  return (
    <div
      className="advisor-sovereign-report"
      style={{
        width: '100%',
        maxWidth: '794px',
        margin: '0 auto',
        background: SOVEREIGN_REPORT.bg,
        color: SOVEREIGN_REPORT.text,
        fontFamily: sans,
        fontSize: '13px',
        lineHeight: 1.45,
        border: `1px solid ${SOVEREIGN_REPORT.border}`,
        boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showWatermark && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 2,
            opacity: 0.12,
            fontFamily: mono,
            fontSize: '56px',
            fontWeight: 700,
            color: SOVEREIGN_REPORT.muted,
            transform: 'rotate(-28deg)',
            letterSpacing: '0.08em',
          }}
        >
          PREVIEW ONLY
        </div>
      )}

      <div style={{ padding: '28px 32px 24px', position: 'relative', zIndex: 1 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            borderLeft: `3px solid ${SOVEREIGN_REPORT.amber}`,
            paddingLeft: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: SOVEREIGN_REPORT.amber,
              }}
            >
              Pocket Portfolio · Client Intelligence Report
            </p>
            <h1
              style={{
                margin: '8px 0 4px',
                fontSize: '26px',
                fontWeight: 700,
                color: SOVEREIGN_REPORT.text,
                lineHeight: 1.2,
              }}
            >
              Portfolio Report
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: SOVEREIGN_REPORT.muted }}>
              {clientName} · {reportDate}
            </p>
          </div>
          {firmLogoDataUrl ? (
            <img
              src={firmLogoDataUrl}
              alt="Firm logo"
              style={{
                height: '48px',
                width: 'auto',
                maxWidth: '180px',
                objectFit: 'contain',
                objectPosition: 'right center',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                fontFamily: mono,
                fontSize: '11px',
                fontWeight: 700,
                color: SOVEREIGN_REPORT.amber,
                textAlign: 'right',
              }}
            >
              POCKET
              <br />
              PORTFOLIO
            </div>
          )}
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Total portfolio value', value: formatReportCurrency(totalValue, currency) },
            { label: 'Positions', value: String(positions.length) },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                background: SOVEREIGN_REPORT.surface,
                border: `1px solid ${SOVEREIGN_REPORT.border}`,
                borderLeft: `3px solid ${SOVEREIGN_REPORT.amber}`,
                padding: '12px 14px',
              }}
            >
              <p
                style={{
                  margin: '0 0 6px',
                  fontFamily: mono,
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: SOVEREIGN_REPORT.amber,
                }}
              >
                {metric.label}
              </p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{metric.value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2
            style={{
              margin: '0 0 10px',
              fontFamily: mono,
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: SOVEREIGN_REPORT.amber,
            }}
          >
            Holdings
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ background: SOVEREIGN_REPORT.surface }}>
                {['Ticker', 'Shares', 'Value', 'Alloc %'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 0 ? 'left' : 'right',
                      padding: '8px 10px',
                      fontFamily: mono,
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: SOVEREIGN_REPORT.amber,
                      borderBottom: `2px solid ${SOVEREIGN_REPORT.amber}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr
                  key={`${position.ticker}-${index}`}
                  style={{
                    background: index % 2 === 1 ? SOVEREIGN_REPORT.surface : 'transparent',
                  }}
                >
                  <td style={{ padding: '9px 10px', fontWeight: 600 }}>{position.ticker}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                    {formatShares(position.shares)}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                    {formatReportCurrency(position.value, position.currency || currency)}
                  </td>
                  <td
                    style={{
                      padding: '9px 10px',
                      textAlign: 'right',
                      color: SOVEREIGN_REPORT.amber,
                      fontWeight: 600,
                    }}
                  >
                    {position.allocation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer
          style={{
            marginTop: '20px',
            paddingTop: '14px',
            borderTop: `1px solid ${SOVEREIGN_REPORT.border}`,
          }}
        >
          <p
            style={{
              margin: '0 0 6px',
              fontFamily: mono,
              fontSize: '9px',
              color: SOVEREIGN_REPORT.muted,
              lineHeight: 1.5,
            }}
          >
            Generated via stateless edge architecture. Portfolio aggregates computed client-side;
            raw ledger rows are not persisted on the inference path.
          </p>
          <p style={{ margin: 0, fontSize: '9px', color: SOVEREIGN_REPORT.muted }}>
            Pocket Portfolio · Confidential client intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
