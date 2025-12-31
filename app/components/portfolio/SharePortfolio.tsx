'use client';

import React, { useState } from 'react';
import type { Position } from '@/app/lib/utils/portfolioCalculations';
import { exportToCSV, exportChartAsPNG, exportChartAsSVG } from '@/app/lib/portfolio/export';

interface SharePortfolioProps {
  positions: Position[];
  chartElementRef?: React.RefObject<HTMLElement>;
  excludeSensitiveData?: boolean;
}

/**
 * Share Portfolio Component
 * Allows exporting and sharing portfolio data with privacy controls
 */
export default function SharePortfolio({
  positions,
  chartElementRef,
  excludeSensitiveData = true,
}: SharePortfolioProps) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExportCSV = () => {
    const dataToExport = excludeSensitiveData
      ? positions.map((pos) => ({
          ...pos,
          avgCost: 0, // Hide cost basis
          totalInvested: 0,
          unrealizedPL: 0,
          unrealizedPLPercent: 0,
        }))
      : positions;

    exportToCSV(dataToExport, 'portfolio-export.csv');
  };

  const handleExportChartPNG = () => {
    if (chartElementRef?.current) {
      exportChartAsPNG(chartElementRef.current, 'portfolio-chart.png');
    }
  };

  const handleExportChartSVG = () => {
    if (chartElementRef?.current) {
      exportChartAsSVG(chartElementRef.current, 'portfolio-chart.svg');
    }
  };

  const handleGenerateShareLink = () => {
    // Generate a shareable link (read-only view)
    // In production, this would create a share token and store it
    const shareData = excludeSensitiveData
      ? positions.map((pos) => ({
          ticker: pos.ticker,
          shares: pos.shares,
          currentValue: pos.currentValue,
          // Exclude cost basis and P/L
        }))
      : positions;

    // For now, just show a message
    // In production, create a share endpoint that stores this data
    const shareId = Math.random().toString(36).substring(7);
    const link = `${window.location.origin}/share/${shareId}`;
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Silently handle copy errors - user will see visual feedback via UI state
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}
    >
      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--text)',
        }}
      >
        Export & Share
      </h3>

      {/* Export Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <button
          onClick={handleExportCSV}
          style={{
            padding: 'var(--space-3)',
            background: 'var(--surface-elevated)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: 'pointer',
            transition: 'var(--transition-base)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface)';
            e.currentTarget.style.borderColor = 'var(--signal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--surface-elevated)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          📥 Export to CSV
        </button>

        {chartElementRef && (
          <>
            <button
              onClick={handleExportChartPNG}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              🖼️ Export Chart as PNG
            </button>

            <button
              onClick={handleExportChartSVG}
              style={{
                padding: 'var(--space-3)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--signal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              🎨 Export Chart as SVG
            </button>
          </>
        )}
      </div>

      {/* Share Link */}
      <div
        style={{
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={handleGenerateShareLink}
          style={{
            padding: 'var(--space-3)',
            background: 'var(--signal)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-semibold)',
            cursor: 'pointer',
            transition: 'var(--transition-base)',
            width: '100%',
            marginBottom: shareLink ? 'var(--space-2)' : 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          🔗 Generate Share Link
        </button>

        {shareLink && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={shareLink}
              readOnly
              style={{
                flex: 1,
                padding: 'var(--space-2)',
                background: 'var(--surface-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                background: copied ? 'var(--signal)' : 'var(--surface-elevated)',
                color: copied ? 'var(--bg)' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-base)',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}

        {excludeSensitiveData && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            ℹ️ Sensitive data (cost basis, P/L) excluded from share
          </div>
        )}
      </div>
    </div>
  );
}

