/**
 * CSV Rules Playground - Test and debug CSV import rules
 * Helps users understand how their CSV will be parsed
 */
import { useState, useRef } from 'react';
import { parseCsv, type CsvParseResult } from '@/lib/csvNormalizer';

export default function CsvRulesPlayground() {
  const [result, setResult] = useState<CsvParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sampleCsv, setSampleCsv] = useState<string>(
    `Date,Symbol,Quantity,Price,Fees,Type
2024-01-15,AAPL,10,150.25,2.50,buy
2024-01-20,GOOGL,5,135.80,1.25,buy
2024-02-01,MSFT,15,380.50,3.75,buy`
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    setLoading(true);
    try {
      const parsed = await parseCsv(sampleCsv);
      setResult(parsed);
    } catch (err) {
      setResult({
        rows: [],
        errors: [err instanceof Error ? err.message : 'Parse failed'],
        warnings: [],
        metadata: {
          totalRows: 0,
          successRows: 0,
          detectedFormat: 'unknown',
          encoding: 'unknown',
          delimiter: ',',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const parsed = await parseCsv(file);
      setResult(parsed);
      const text = await file.text();
      setSampleCsv(text);
    } catch (err) {
      setResult({
        rows: [],
        errors: [err instanceof Error ? err.message : 'Parse failed'],
        warnings: [],
        metadata: {
          totalRows: 0,
          successRows: 0,
          detectedFormat: 'unknown',
          encoding: 'unknown',
          delimiter: ',',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csv-playground" style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h2>CSV Rules Playground</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Test how your CSV will be parsed. Paste CSV content or upload a file.
      </p>

      <div style={{ display: 'grid', gap: 20 }}>
        {/* Input Section */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button
              onClick={handleParse}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Parsing...' : 'Parse CSV'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 16px',
                background: '#666',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <textarea
            value={sampleCsv}
            onChange={e => setSampleCsv(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: 12,
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
            aria-label="CSV content input"
          />
        </div>

        {/* Results Section */}
        {result && (
          <div>
            <h3>Parse Results</h3>

            {/* Metadata */}
            <div
              style={{
                padding: 10,
                background: '#f5f5f5',
                borderRadius: 4,
                marginBottom: 10,
              }}
            >
              <div>
                <strong>Total Rows:</strong> {result.metadata.totalRows}
              </div>
              <div>
                <strong>Success:</strong> {result.metadata.successRows}
              </div>
              <div>
                <strong>Encoding:</strong> {result.metadata.encoding}
              </div>
              <div>
                <strong>Delimiter:</strong> {result.metadata.delimiter === '\t' ? 'TAB' : result.metadata.delimiter}
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div
                style={{
                  padding: 10,
                  background: '#fee',
                  borderLeft: '4px solid #c00',
                  marginBottom: 10,
                }}
                role="alert"
              >
                <strong>Errors ({result.errors.length}):</strong>
                <ul style={{ margin: '5px 0 0', paddingLeft: 20 }}>
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div
                style={{
                  padding: 10,
                  background: '#fff3cd',
                  borderLeft: '4px solid #ff9800',
                  marginBottom: 10,
                }}
                role="alert"
              >
                <strong>Warnings ({result.warnings.length}):</strong>
                <ul style={{ margin: '5px 0 0', paddingLeft: 20 }}>
                  {result.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parsed Rows */}
            {result.rows.length > 0 && (
              <div>
                <strong>Parsed Trades ({result.rows.length}):</strong>
                <div style={{ overflowX: 'auto', marginTop: 10 }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: 8, textAlign: 'left', border: '1px solid #ddd' }}>Symbol</th>
                        <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Qty</th>
                        <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Price</th>
                        <th style={{ padding: 8, textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                        <th style={{ padding: 8, textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
                        <th style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>Fees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 20).map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>{row.symbol}</td>
                          <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                            {row.quantity}
                          </td>
                          <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                            {row.price.toFixed(2)}
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>
                            {new Date(row.timestamp).toLocaleDateString()}
                          </td>
                          <td style={{ padding: 8, border: '1px solid #ddd' }}>{row.type || '—'}</td>
                          <td style={{ padding: 8, textAlign: 'right', border: '1px solid #ddd' }}>
                            {row.fees?.toFixed(2) || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.rows.length > 20 && (
                    <div style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
                      Showing first 20 rows of {result.rows.length}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

