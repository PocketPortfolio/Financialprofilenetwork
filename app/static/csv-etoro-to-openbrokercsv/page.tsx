'use client';

import React, { useState, useRef } from 'react';

export default function EtoroConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedData, setConvertedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = (lines.shift() || "").split(",").map(s => s.trim());
    return lines.map(row => {
      const cols = row.split(",");
      const obj: any = {};
      headers.forEach((h, i) => obj[h] = cols[i]);
      return obj;
    });
  };

  const toISO = (s: string) => {
    const t = String(s || "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t;
    const d = new Date(t);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  const normalize = (row: any) => {
    const side = (row.Side || row['Buy/Sell'] || row.side || "").toUpperCase();
    const qty = Number(row.Units ?? row.Qty ?? row.quantity ?? 0);
    const sign = /SELL/i.test(side) ? -1 : 1;
    return {
      broker: "etoro",
      trade_id: row["Position ID"] || row["Trade ID"] || row.trade_id || "",
      timestamp: toISO(row["Open Date"] || row.OpenTime || row.timestamp || ""),
      symbol: (row.Instrument || row.Symbol || "").toUpperCase().replace(/\s+/g, ""),
      side: /SELL/i.test(side) ? "SELL" : "BUY",
      quantity: sign * Math.abs(qty),
      price: Number(row["Open Rate"] ?? row.Price ?? row.price ?? 0),
      trade_currency: (row.Currency || row.trade_currency || "USD").toUpperCase(),
      fee: Number(row.Fees || row.fee || 0) || undefined
    };
  };

  const downloadCSV = (rows: any[]) => {
    const headers = ["broker", "trade_id", "timestamp", "symbol", "side", "quantity", "price", "fee", "trade_currency", "settlement_currency", "fx_rate"];
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => r[h] || "").join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etoro-normalized.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult('');
      setConvertedData([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      const normalized = data.map(normalize);
      const valid = normalized.filter(r => r.timestamp && r.symbol);
      const invalid = normalized.filter(r => !r.timestamp || !r.symbol);

      setConvertedData(normalized);
      setResult(`
        Found ${data.length} rows
        ✓ ${valid.length} valid rows
        ${invalid.length > 0 ? `⚠ ${invalid.length} invalid rows` : ''}
      `);
    } catch (err) {
      setResult(`Error parsing CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "eToro CSV to OpenBrokerCSV Converter",
            "description": "Free tool to convert eToro CSV exports to OpenBrokerCSV format for portfolio tracking.",
            "url": "https://www.pocketportfolio.app/static/csv-etoro-to-openbrokercsv",
            "image": "https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=2",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2026-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "18",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      <div style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1rem' }}>
        <main>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Convert eToro CSV to OpenBrokerCSV
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Client-side conversion — nothing leaves your browser.
          </p>

          <section className="brand-card" style={{
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Supported eToro columns
            </h2>
            <div style={{ overflow: 'auto' }}>
              <table className="brand-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>eToro Header</th>
                    <th>OpenBrokerCSV</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px' }}>Open Date / OpenTime</td>
                    <td style={{ padding: '8px' }}><code>timestamp</code></td>
                    <td style={{ padding: '8px' }}>ISO 8601 (UTC)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Instrument</td>
                    <td style={{ padding: '8px' }}><code>symbol</code></td>
                    <td style={{ padding: '8px' }}>e.g., AAPL, TSLA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Side</td>
                    <td style={{ padding: '8px' }}><code>side</code></td>
                    <td style={{ padding: '8px' }}>BUY or SELL</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Units</td>
                    <td style={{ padding: '8px' }}><code>quantity</code></td>
                    <td style={{ padding: '8px' }}>number (negative if SELL)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Open Rate</td>
                    <td style={{ padding: '8px' }}><code>price</code></td>
                    <td style={{ padding: '8px' }}>number</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Currency</td>
                    <td style={{ padding: '8px' }}><code>trade_currency</code></td>
                    <td style={{ padding: '8px' }}>ISO 4217 (USD, GBP, EUR)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Position ID</td>
                    <td style={{ padding: '8px' }}><code>trade_id</code></td>
                    <td style={{ padding: '8px' }}>string</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Fees/Spread</td>
                    <td style={{ padding: '8px' }}><code>fee</code></td>
                    <td style={{ padding: '8px' }}>optional number</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="brand-card" style={{
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Convert your file
            </h2>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: '12px',
              padding: '18px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{
                  marginBottom: '1rem',
                  padding: '8px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  width: '100%',
                  maxWidth: '300px',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Upload your eToro CSV file to convert it to OpenBrokerCSV format
              </p>
            </div>

            {file && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'var(--signal)', fontWeight: '500' }}>
                  Selected: {file.name}
                </p>
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="brand-button brand-button-primary"
                  style={{
                    padding: 'var(--space-3) var(--space-5)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-medium)',
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Convert File'}
                </button>
              </div>
            )}

            {result && (
              <div style={{ marginBottom: '1rem' }}>
                <div className="brand-card" style={{ 
                  marginBottom: '1rem'
                }}>
                  <pre style={{ margin: 0, fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {result}
                  </pre>
                </div>
                {convertedData.length > 0 && (
                  <button
                    onClick={() => downloadCSV(convertedData)}
                    className="brand-button brand-button-primary"
                    style={{
                      padding: 'var(--space-3) var(--space-5)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    Download OpenBrokerCSV
                  </button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}