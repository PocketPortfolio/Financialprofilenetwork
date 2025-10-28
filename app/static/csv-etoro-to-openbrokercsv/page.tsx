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
            "image": "https://www.pocketportfolio.app/brand/og-base.png",
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
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/brand/pp-wordmark.svg" alt="Pocket Portfolio" width="156" height="20" />
          </a>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a href="/dashboard" style={{
              padding: '8px 16px',
              background: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Launch App
            </a>
            <a href="/openbrokercsv" style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #d1d5db',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              OpenBrokerCSV
            </a>
          </nav>
        </header>

        <main>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Convert eToro CSV to OpenBrokerCSV
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Client-side conversion — nothing leaves your browser.
          </p>

          <section style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Supported eToro columns
            </h2>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>eToro Header</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>OpenBrokerCSV</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Open Date / OpenTime</td>
                    <td style={{ padding: '8px' }}><code>timestamp</code></td>
                    <td style={{ padding: '8px' }}>ISO 8601 (UTC)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Instrument</td>
                    <td style={{ padding: '8px' }}><code>symbol</code></td>
                    <td style={{ padding: '8px' }}>e.g., AAPL, TSLA</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Side</td>
                    <td style={{ padding: '8px' }}><code>side</code></td>
                    <td style={{ padding: '8px' }}>BUY or SELL</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Units</td>
                    <td style={{ padding: '8px' }}><code>quantity</code></td>
                    <td style={{ padding: '8px' }}>number (negative if SELL)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Open Rate</td>
                    <td style={{ padding: '8px' }}><code>price</code></td>
                    <td style={{ padding: '8px' }}>number</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>Currency</td>
                    <td style={{ padding: '8px' }}><code>trade_currency</code></td>
                    <td style={{ padding: '8px' }}>ISO 4217 (USD, GBP, EUR)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
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

          <section style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Convert your file
            </h2>
            <div style={{
              border: '2px dashed #d1d5db',
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
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  width: '100%',
                  maxWidth: '300px'
                }}
              />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Upload your eToro CSV file to convert it to OpenBrokerCSV format
              </p>
            </div>

            {file && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#10b981', fontWeight: '500' }}>
                  Selected: {file.name}
                </p>
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  style={{
                    padding: '8px 16px',
                    background: isProcessing ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Convert File'}
                </button>
              </div>
            )}

            {result && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  background: '#f3f4f6', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  padding: '12px',
                  marginBottom: '1rem'
                }}>
                  <pre style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                    {result}
                  </pre>
                </div>
                {convertedData.length > 0 && (
                  <button
                    onClick={() => downloadCSV(convertedData)}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
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