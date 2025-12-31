'use client';

import { useState } from 'react';
import { encodePortfolio } from '@/app/lib/share';
import AlertModal from './modals/AlertModal';

interface Position {
  ticker: string;
  currentValue: number;
}

interface SharePortfolioButtonProps {
  positions: Position[];
  className?: string;
}

export default function SharePortfolioButton({ positions, className = '' }: SharePortfolioButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalData, setAlertModalData] = useState<{title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  const handleShare = () => {
    if (positions.length === 0) {
      setAlertModalData({
        title: 'No Positions',
        message: 'No positions to share. Add some trades first!',
        type: 'warning'
      });
      setShowAlertModal(true);
      return;
    }

    try {
      const blob = encodePortfolio(positions);
      const shareUrl = `${window.location.origin}/p/${blob}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback: show URL in alert modal
        setAlertModalData({
          title: 'Share Link',
          message: `Share link: ${shareUrl}`,
          type: 'info'
        });
        setShowAlertModal(true);
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      setAlertModalData({
        title: 'Error',
        message: 'Failed to generate share link. Please try again.',
        type: 'error'
      });
      setShowAlertModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        style={{
          padding: '12px 16px',
          background: 'var(--accent-warm)',
          color: '#ffffff',
          borderRadius: '8px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          fontSize: '15px'
        }}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--signal)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-warm)';
        }}
      >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 16v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3a2 2 0 002 2h11a2 2 0 002-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Share Portfolio
        </>
      )}
    </button>
    
    {alertModalData && (
      <AlertModal
        isOpen={showAlertModal}
        title={alertModalData.title}
        message={alertModalData.message}
        type={alertModalData.type}
        onClose={() => setShowAlertModal(false)}
      />
    )}
    </>
  );
}
