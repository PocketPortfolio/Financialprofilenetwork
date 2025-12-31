'use client';

import { useState, useCallback, useEffect } from 'react';
import { convertToTaxFormat, type TaxSoftware } from '@/app/lib/tax-formats/mappings';
import SustainabilityWidget from '@/app/components/SustainabilityWidget';
import { 
  trackToolPageView, 
  trackToolInteraction, 
  trackToolSuccess, 
  trackToolDownload,
  trackToolError 
} from '@/app/lib/analytics/tools';

// Dynamic import with error handling
let parseCSV: any = null;
let importerLoaded = false;
let importerError: string | null = null;

interface TaxConverterProps {
  sourceBroker: string;
  sourceBrokerId: string;
  targetSoftware: string;
  targetSoftwareId: TaxSoftware;
}

export default function TaxConverter({
  sourceBroker,
  sourceBrokerId,
  targetSoftware,
  targetSoftwareId
}: TaxConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tradeCount, setTradeCount] = useState<number | null>(null);
  const [showSustainability, setShowSustainability] = useState(false);
  const [isImporterReady, setIsImporterReady] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackToolPageView('tax_converter', {
      sourceBroker: sourceBrokerId,
      targetSoftware: targetSoftwareId,
      conversionPair: `${sourceBrokerId}-to-${targetSoftwareId}`
    });
  }, [sourceBrokerId, targetSoftwareId]);

  // Load importer asynchronously (non-blocking)
  useEffect(() => {
    const loadImporter = async () => {
      try {
        const importer = await import('@pocket-portfolio/importer');
        parseCSV = importer.parseCSV;
        importerLoaded = true;
        importerError = null;
        setIsImporterReady(true);
      } catch (error: any) {
        console.error('Failed to load CSV importer:', error);
        importerError = error.message || 'Failed to load CSV parser';
        importerLoaded = false;
        setIsImporterReady(false);
      }
    };
    // Load importer in background, don't block render
    loadImporter().catch(() => {
      // Error already handled above
    });
  }, []);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setShowSustainability(false);
    
    // Track file upload interaction
    trackToolInteraction('tax_converter', 'file_upload', {
      sourceBroker: sourceBrokerId,
      targetSoftware: targetSoftwareId,
      conversionPair: `${sourceBrokerId}-to-${targetSoftwareId}`,
      fileSize: selectedFile.size
    });
  }, [sourceBrokerId, targetSoftwareId]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    // Wait for importer to load if not ready yet
    if (!importerLoaded || !parseCSV) {
      // Try to load it now if not already loading
      if (!isImporterReady && !importerError) {
        try {
          const importer = await import('@pocket-portfolio/importer');
          parseCSV = importer.parseCSV;
          importerLoaded = true;
          setIsImporterReady(true);
        } catch (error: any) {
          setError('Failed to load CSV parser. Please refresh the page and try again.');
          return;
        }
      } else if (importerError) {
        setError('CSV parser is not available. Please refresh the page.');
        return;
      } else {
        setError('CSV parser is still loading. Please wait a moment and try again.');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setShowSustainability(false);

    try {
      // Create RawFile object for importer
      const rawFile = {
        name: file.name,
        mime: file.type as 'text/csv' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: file.size,
        arrayBuffer: async () => {
          const buffer = await file.arrayBuffer();
          return buffer;
        }
      };

      // Parse CSV using importer
      const locale = sourceBrokerId === 'trading212' || sourceBrokerId === 'freetrade' ? 'en-GB' : 'en-US';
      const result = await parseCSV(rawFile, locale, sourceBrokerId as any);

      if (result.trades.length === 0) {
        throw new Error('No trades found in the CSV file. Please check the file format.');
      }

      // Convert to tax format
      const convertedCsv = convertToTaxFormat(result.trades, targetSoftwareId);

      // Create download
      const blob = new Blob([convertedCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sourceBroker.toLowerCase()}-to-${targetSoftware.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success and trigger sustainability widget
      setTradeCount(result.trades.length);
      setSuccess(true);
      setShowSustainability(true);

      // Track successful conversion
      trackToolSuccess('tax_converter', {
        sourceBroker: sourceBrokerId,
        targetSoftware: targetSoftwareId,
        conversionPair: `${sourceBrokerId}-to-${targetSoftwareId}`,
        tradeCount: result.trades.length,
        fileSize: file.size
      });

      // Track download
      trackToolDownload('tax_converter', 'csv', {
        sourceBroker: sourceBrokerId,
        targetSoftware: targetSoftwareId,
        conversionPair: `${sourceBrokerId}-to-${targetSoftwareId}`,
        tradeCount: result.trades.length
      });

      // Log conversion for analytics (legacy GA4)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'tax_conversion', {
          source_broker: sourceBrokerId,
          target_software: targetSoftwareId,
          trade_count: result.trades.length
        });
      }
    } catch (err: any) {
      console.error('Conversion error:', err);
      const errorMessage = err.message || 'Failed to convert CSV. Please check the file format and try again.';
      setError(errorMessage);
      
      // Track error
      trackToolError('tax_converter', err.name || 'conversion_error', {
        sourceBroker: sourceBrokerId,
        targetSoftware: targetSoftwareId,
        conversionPair: `${sourceBrokerId}-to-${targetSoftwareId}`,
        errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  }, [file, sourceBrokerId, targetSoftwareId, sourceBroker, targetSoftware, isImporterReady]);

  return (
    <div className="brand-card" style={{ padding: 'var(--space-6)' }}>
      {/* Importer Error State */}
      {importerError && (
        <div className="brand-card" style={{
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-4)',
          border: '1px solid var(--warning-muted)',
          background: 'var(--surface-elevated)'
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--warning)',
            lineHeight: 'var(--line-relaxed)'
          }}>
            ⚠️ Note: CSV parser may not be fully loaded. The converter will attempt to load it when you upload a file.
          </p>
        </div>
      )}

      {/* File Upload Area */}
      <div
        style={{
          border: `2px dashed ${file ? 'var(--signal)' : isHovering ? 'var(--signal)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: file ? 'var(--surface-elevated)' : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          position: 'relative'
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <svg style={{ width: '48px', height: '48px', color: 'var(--signal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <p style={{
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text)',
                  fontSize: 'var(--font-size-base)'
                }}>
                  {file.name}
                </p>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="brand-link"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--signal)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                textDecoration: 'none'
              }}
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <svg style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto',
              color: 'var(--text-secondary)'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text)',
                marginBottom: 'var(--space-2)'
              }}>
                Drag and drop your {sourceBroker} CSV file here
              </p>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}>
                or click to browse
              </p>
              <label className="brand-button brand-button-primary" style={{
                display: 'inline-block',
                cursor: 'pointer'
              }}>
                <span>Choose File</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)'
            }}>
              Supports CSV and Excel files (.csv, .xlsx, .xls)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="brand-card" style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          border: '1px solid var(--danger-muted)',
          background: 'var(--surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <svg style={{ 
              width: '24px', 
              height: '24px', 
              color: 'var(--danger)', 
              flexShrink: 0,
              marginTop: '2px'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--danger)',
                marginBottom: 'var(--space-1)',
                fontSize: 'var(--font-size-base)'
              }}>
                Conversion Error
              </p>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="brand-card" style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          border: '1px solid var(--signal-muted)',
          background: 'var(--surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <svg style={{ 
              width: '24px', 
              height: '24px', 
              color: 'var(--signal)', 
              flexShrink: 0,
              marginTop: '2px'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{
                fontWeight: 'var(--font-semibold)',
                color: 'var(--signal)',
                marginBottom: 'var(--space-1)',
                fontSize: 'var(--font-size-base)'
              }}>
                Conversion Successful!
              </p>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-relaxed)'
              }}>
                Converted {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'} to {targetSoftware} format. 
                Your file has been downloaded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Convert Button */}
      {file && !success && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="brand-button brand-button-primary"
            style={{
              width: '100%',
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                <svg style={{
                  animation: 'spin 1s linear infinite',
                  width: '20px',
                  height: '20px'
                }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </span>
            ) : (
              `Convert to ${targetSoftware} Format`
            )}
          </button>
        </div>
      )}

      {/* Sustainability Widget (Triggered after successful conversion) */}
      {showSustainability && (
        <div style={{ marginTop: 'var(--space-6)', width: '100%' }}>
          <SustainabilityWidget 
            context="export"
          />
        </div>
      )}
    </div>
  );
}
