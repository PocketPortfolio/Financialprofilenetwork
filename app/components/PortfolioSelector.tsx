'use client';

import React, { useState } from 'react';
import { usePortfolios } from '../hooks/usePortfolios';

interface PortfolioSelectorProps {
  className?: string;
}

export default function PortfolioSelector({ className = '' }: PortfolioSelectorProps) {
  const { 
    portfolios, 
    selectedPortfolio, 
    selectedPortfolioId, 
    selectPortfolio, 
    createPortfolio,
    loading 
  } = usePortfolios();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioBroker, setNewPortfolioBroker] = useState('');
  const [newPortfolioCurrency, setNewPortfolioCurrency] = useState('USD');

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;

    try {
      await createPortfolio({
        name: newPortfolioName.trim(),
        broker: newPortfolioBroker.trim() || 'Unknown',
        description: `Portfolio for ${newPortfolioBroker.trim() || 'Unknown'} broker`,
        currency: newPortfolioCurrency,
        isDefault: portfolios.length === 0
      });
      
      setNewPortfolioName('');
      setNewPortfolioBroker('');
      setNewPortfolioCurrency('USD');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating portfolio:', error);
    }
  };

  if (loading) {
    return (
      <div className={`portfolio-selector ${className}`}>
        <div style={{ 
          padding: '12px 16px', 
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          Loading portfolios...
        </div>
      </div>
    );
  }

  return (
    <div className={`portfolio-selector ${className}`}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 7H21V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        
        <select
          value={selectedPortfolioId || ''}
          onChange={(e) => selectPortfolio(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--text)',
            fontSize: '14px',
            minWidth: '200px',
            cursor: 'pointer'
          }}
        >
          {portfolios.map(portfolio => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name} ({portfolio.broker})
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: 'var(--signal)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New Portfolio
        </button>
      </div>

      {showCreateForm && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-elevated)'
        }}>
          <form onSubmit={handleCreatePortfolio}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: 'var(--text)'
              }}>
                Portfolio Name *
              </label>
              <input
                type="text"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                placeholder="e.g. My Global Portfolio"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: 'var(--text)'
              }}>
                Broker
              </label>
              <input
                type="text"
                value={newPortfolioBroker}
                onChange={(e) => setNewPortfolioBroker(e.target.value)}
                placeholder="e.g. Fidelity & Crypto"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: 'var(--text)'
              }}>
                Currency
              </label>
              <select
                value={newPortfolioCurrency}
                onChange={(e) => setNewPortfolioCurrency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--signal)',
                  color: 'white',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Create Portfolio
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedPortfolio && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            {selectedPortfolio.name}
          </div>
          <div style={{ fontSize: '12px' }}>
            {selectedPortfolio.broker} • {selectedPortfolio.currency}
          </div>
        </div>
      )}
    </div>
  );
}
