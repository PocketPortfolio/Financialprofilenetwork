'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { AccountService, UserData } from '../services/accountService';
import { Trade } from '../services/tradeService';

interface AccountManagementProps {
  user: User;
  trades: Trade[];
  onAccountDeleted?: () => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'delete' | 'export';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
        border: '2px solid var(--border-warm)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: type === 'delete' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px',
            boxShadow: type === 'delete' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            {type === 'delete' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v3m0 3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--neg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
          }}>
            {title}
          </h3>
        </div>
        
        <p style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '24px',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              border: '2px solid var(--border-warm)',
              color: 'var(--text-warm)',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
              minWidth: '100px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.borderColor = 'var(--accent-warm)';
                e.currentTarget.style.color = 'var(--accent-warm)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-warm)';
                e.currentTarget.style.color = 'var(--text-warm)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.2)';
              }
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '14px 28px',
              background: type === 'delete' 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                : 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              border: type === 'delete' ? '2px solid #dc2626' : '2px solid var(--border-warm)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: type === 'delete' 
                ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                : '0 4px 12px rgba(245, 158, 11, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              minWidth: '140px',
              height: '48px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                if (type === 'delete') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                if (type === 'delete') {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }
              }
            }}
          >
            {isLoading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}/>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AccountManagement({ user, trades, onAccountDeleted }: AccountManagementProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await AccountService.deleteAccount(user);
      setShowDeleteModal(false);
      // Call the callback to handle post-deletion logic (e.g., redirect)
      if (onAccountDeleted) {
        onAccountDeleted();
      } else {
        // Default: redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Show a more helpful error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete account. Please try again.';
      
      alert(errorMessage);
      setIsDeleting(false);
    }
    // Note: Don't reset isDeleting in finally if redirecting
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const userData = await AccountService.exportUserData(user.uid);
      
      if (exportFormat === 'json') {
        AccountService.downloadUserData(userData);
      } else {
        AccountService.downloadTradesCSV(userData.trades);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter out mock trades for real portfolio calculations
  const realTrades = trades?.filter(trade => !trade.mock) || [];
  
  // Calculate positions like the dashboard does (average cost basis for current holdings)
  const positions = realTrades.reduce((acc: { [key: string]: any }, trade) => {
    const { ticker, qty, price, type } = trade;
    
    if (!acc[ticker]) {
      acc[ticker] = {
        ticker,
        shares: 0,
        avgCost: 0,
        currency: trade.currency || 'USD'
      };
    }
    
    if (type === 'BUY') {
      const totalCost = acc[ticker].shares * acc[ticker].avgCost + qty * price;
      acc[ticker].shares += qty;
      acc[ticker].avgCost = totalCost / acc[ticker].shares;
    } else {
      // For SELL trades, reduce shares but keep the same average cost
      acc[ticker].shares -= qty;
    }
    
    return acc;
  }, {});

  // Calculate total invested based on current position holdings (average cost basis)
  const totalInvested = Object.values(positions).reduce((sum: number, pos: any) => {
    return sum + (pos.avgCost * pos.shares);
  }, 0);

  const totalTrades = realTrades.length;
  const totalPositions = Object.keys(positions).length;

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
        border: '2px solid var(--border-warm)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--text)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              Account Management
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-warm)',
              margin: 0,
              fontWeight: '500'
            }}>
              {user.displayName || user.email}
            </p>
          </div>
        </div>

        {/* Account Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
          padding: '24px',
          background: 'var(--warm-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-warm)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-warm)', margin: '0 0 6px 0', fontWeight: '600' }}>Trades</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>{totalTrades}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ fontSize: '20px' }}>💰</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-warm)', margin: '0 0 6px 0', fontWeight: '600' }}>Invested</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
              ${totalInvested.toFixed(2)}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ fontSize: '20px' }}>📈</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 6px 0', fontWeight: '600' }}>Positions</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>{totalPositions}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowExportModal(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
              border: '2px solid var(--border-warm)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export Data
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: '2px solid #dc2626',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete Account
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--warm-bg) 100%)',
            border: '2px solid var(--border-warm)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.1)'
          }}>
            {/* Header with Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.5px'
                }}>
                  Export Your Data
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  Download your portfolio data
                </p>
              </div>
            </div>
            
            {/* Clear Description */}
            <div style={{
              background: 'var(--warm-bg)',
              border: '1px solid var(--border-warm)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <p style={{
                color: 'var(--text)',
                lineHeight: '1.6',
                margin: '0 0 16px 0',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Choose how you'd like to export your data:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  background: exportFormat === 'json' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  border: exportFormat === 'json' ? '2px solid var(--accent-warm)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    style={{ accentColor: 'var(--accent-warm)', transform: 'scale(1.2)' }}
                  />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                      📄 Complete Backup (JSON)
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      All your data including trades, positions, and settings
                    </div>
                  </div>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  background: exportFormat === 'csv' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  border: exportFormat === 'csv' ? '2px solid var(--accent-warm)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                    style={{ accentColor: 'var(--accent-warm)', transform: 'scale(1.2)' }}
                  />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                      📊 Trades Only (CSV)
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Just your trades for importing into other tools
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Clear Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end',
              paddingTop: '8px'
            }}>
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  border: '2px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  opacity: isExporting ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                  minWidth: '100px'
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.borderColor = 'var(--accent-warm)';
                    e.currentTarget.style.color = 'var(--accent-warm)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                  border: '2px solid var(--border-warm)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  opacity: isExporting ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '140px',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, var(--accent-warm) 100%)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }
                }}
              >
                {isExporting ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}/>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Export Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Account"
        message={`This action will permanently delete your account and all associated data (${totalTrades} trades, ${totalPositions} positions, $${totalInvested.toFixed(2)} invested). This cannot be undone.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        type="delete"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
