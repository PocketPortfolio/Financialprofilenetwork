'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '../../components/Logo';
import SEOHead from '../../components/SEOHead';
import StructuredData from '../../components/StructuredData';

export default function EToroToOpenBrokerCSVPage() {
  const [csvContent, setCsvContent] = useState('');
  const [convertedCsv, setConvertedCsv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const convertCsv = () => {
    if (!csvContent.trim()) {
      alert('Please upload a CSV file first.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate conversion processing
    setTimeout(() => {
      try {
        // Simple CSV conversion logic
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Convert eToro format to OpenBrokerCSV format
        const convertedLines = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          // Map eToro columns to OpenBrokerCSV format
          // This is a simplified example - real conversion would be more complex
          return `${values[0]}, ${values[1]}, Stock, USD, ${values[2]}, ${values[3]}, 0, 0`;
        });

        const openBrokerHeaders = 'Date, Ticker, Type, Currency, Quantity, Price, Commission, Fees';
        setConvertedCsv([openBrokerHeaders, ...convertedLines].join('\n'));
      } catch (error) {
        alert('Error converting CSV. Please check the format and try again.');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const downloadCsv = () => {
    if (!convertedCsv) return;
    
    const blob = new Blob([convertedCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-trades.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead
        title="eToro to OpenBrokerCSV Converter - Import Your Trading History"
        description="Convert your eToro trading history to OpenBrokerCSV format and import it into Pocket Portfolio. Free tool to migrate your investment data from eToro to any portfolio tracker."
        keywords={[
          'etoro csv converter',
          'etoro import',
          'etoro portfolio',
          'trading history export',
          'etoro to pocket portfolio',
          'broker migration',
          'csv converter',
          'trading data migration',
          'portfolio import',
          'etoro export'
        ]}
        canonical="https://pocketportfolio.app/csv/etoro-to-openbrokercsv"
        ogType="website"
      />
      
      <StructuredData 
        type="Product" 
        data={{
          name: 'eToro to OpenBrokerCSV Converter',
          description: 'Free tool to convert eToro trading history to OpenBrokerCSV format for import into Pocket Portfolio',
          url: 'https://pocketportfolio.app/csv/etoro-to-openbrokercsv'
        }} 
      />

      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)', 
        color: 'var(--text)', 
        fontFamily: 'system-ui, -apple-system, sans-serif' 
      }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid var(--card-border)', 
        background: 'var(--chrome)', 
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Logo size="medium" showWordmark={true} />
            </Link>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link 
                href="/openbrokercsv" 
                style={{ 
                  padding: '8px 16px', 
                  background: 'transparent', 
                  color: 'var(--text)', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid var(--card-border)'
                }}
              >
                OpenBrokerCSV
              </Link>
              <Link 
                href="/app" 
                style={{ 
                  padding: '8px 16px', 
                  background: 'var(--brand)', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px' }}>
          eToro to OpenBrokerCSV Converter
        </h1>
        
        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            How to Use
          </h2>
          <ol style={{ fontSize: '16px', lineHeight: '1.6', marginLeft: '24px' }}>
            <li>Export your trading history from eToro as a CSV file</li>
            <li>Upload the CSV file using the form below</li>
            <li>Click "Convert to OpenBrokerCSV" to process the file</li>
            <li>Download the converted file and import it into Pocket Portfolio</li>
          </ol>
        </div>

        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Upload eToro CSV
          </h2>
          
          <div style={{ marginBottom: '24px' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                padding: '12px',
                border: '2px dashed var(--card-border)',
                borderRadius: '8px',
                width: '100%',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            />
          </div>

          {csvContent && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Preview (first 5 rows):
              </h3>
              <div style={{ 
                background: 'var(--bg)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '8px', 
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <pre>{csvContent.split('\n').slice(0, 6).join('\n')}</pre>
              </div>
            </div>
          )}

          <button
            onClick={convertCsv}
            disabled={!csvContent || isProcessing}
            style={{
              padding: '12px 24px',
              background: csvContent && !isProcessing ? 'var(--brand)' : 'var(--muted)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: csvContent && !isProcessing ? 'pointer' : 'not-allowed',
              marginBottom: '24px'
            }}
          >
            {isProcessing ? 'Converting...' : 'Convert to OpenBrokerCSV'}
          </button>

          {convertedCsv && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Converted OpenBrokerCSV Format:
              </h3>
              <div style={{ 
                background: 'var(--bg)', 
                border: '1px solid var(--card-border)', 
                borderRadius: '8px', 
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '14px',
                maxHeight: '300px',
                overflow: 'auto',
                marginBottom: '16px'
              }}>
                <pre>{convertedCsv}</pre>
              </div>
              <button
                onClick={downloadCsv}
                style={{
                  padding: '12px 24px',
                  background: 'var(--pos)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Download Converted CSV
              </button>
            </div>
          )}
        </div>

        <div style={{ 
          background: 'var(--card)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Import into Pocket Portfolio
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
            Once you have your converted CSV file:
          </p>
          <ol style={{ fontSize: '16px', lineHeight: '1.6', marginLeft: '24px', marginBottom: '24px' }}>
            <li>Go to the Pocket Portfolio dashboard</li>
            <li>Click on the "Import CSV" button</li>
            <li>Select your converted CSV file</li>
            <li>Your trades will be imported automatically</li>
          </ol>
          <Link 
            href="/app" 
            style={{ 
              padding: '12px 24px', 
              background: 'var(--brand)', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '8px', 
              fontSize: '16px',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        marginTop: '80px', 
        padding: '32px 24px', 
        borderTop: '1px solid var(--card-border)', 
        textAlign: 'center', 
        background: 'var(--chrome)' 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            © 2025 Pocket Portfolio — Built with the community.
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
