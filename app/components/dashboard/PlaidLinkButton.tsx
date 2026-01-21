'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../../hooks/useAuth';

interface PlaidLinkButtonProps {
  onSuccess?: (publicToken: string, metadata: any) => void;
  onExit?: (err: any, metadata: any) => void;
}

export default function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkButtonProps) {
  const { user } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.uid || 'anonymous' }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create link token');
        }
        
        const data = await response.json();
        if (data.link_token) {
          setLinkToken(data.link_token);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (error) {
        console.error('Failed to create link token:', error);
        setError('Failed to initialize connection');
      }
    };

    createLinkToken();
  }, [user]);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      setLoading(true);
      setError(null);
      try {
        // Exchange public token for access token
        const response = await fetch('/api/plaid/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token: publicToken }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }
        
        const data = await response.json();
        
        if (onSuccess) {
          onSuccess(publicToken, { ...metadata, access_token: data.access_token });
        }
      } catch (error) {
        console.error('Failed to exchange token:', error);
        setError('Failed to complete connection');
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const config = {
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onExit || ((err: any, metadata: any) => {
      if (err) {
        console.error('Plaid exit error:', err);
        setError(err.error_message || 'Connection cancelled');
      }
    }),
  };

  const { open, ready } = usePlaidLink(config);

  const handleClick = () => {
    if (ready && linkToken) {
      open();
    }
  };

  if (error) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#ef4444',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ready || !linkToken || loading}
      style={{
        padding: '12px 20px',
        background: ready && linkToken && !loading
          ? 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)'
          : 'hsl(var(--muted))',
        border: '2px solid var(--border-warm)',
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: ready && linkToken && !loading ? 'pointer' : 'not-allowed',
        opacity: ready && linkToken && !loading ? 1 : 0.6,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'center',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (ready && linkToken && !loading) {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (ready && linkToken && !loading) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {loading ? 'Connecting...' : '🇺🇸 Connect US Brokerage'}
    </button>
  );
}

