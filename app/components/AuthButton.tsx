'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AccountManagement from './AccountManagement';
import SignInOptions from './auth/SignInOptions';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signInWithMicrosoft, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const runGoogle = async () => {
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } finally {
      setAuthBusy(false);
    }
  };

  const runMicrosoft = async () => {
    setAuthBusy(true);
    try {
      await signInWithMicrosoft();
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('popup-blocked')) {
        alert(msg || 'Microsoft sign-in failed');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        style={{
          padding: '8px 16px',
          background: 'var(--muted)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'not-allowed',
          opacity: 0.6,
        }}
      >
        Loading...
      </button>
    );
  }

  if (!user && !loading) {
    return (
      <SignInOptions
        onGoogle={runGoogle}
        onMicrosoft={runMicrosoft}
        busy={authBusy}
        layout="row"
        emphasizeGoogle={false}
      />
    );
  }

  if (user) {
    return (
      <>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
          ref={dropdownRef}
        >
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                }}
              />
            )}
            <span style={{ fontSize: '14px', color: 'var(--text)' }}>
              {user.displayName || user.email}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                boxShadow:
                  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                minWidth: '200px',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => {
                  setShowAccountManagement(true);
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid var(--card-border)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Account Management
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--neg)',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {showAccountManagement && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowAccountManagement(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                ✕
              </button>

              <AccountManagement
                user={user}
                trades={[]}
                onAccountDeleted={() => {
                  setShowAccountManagement(false);
                  logout();
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <SignInOptions
      onGoogle={runGoogle}
      onMicrosoft={runMicrosoft}
      busy={authBusy}
      layout="row"
      emphasizeGoogle={false}
    />
  );
}
