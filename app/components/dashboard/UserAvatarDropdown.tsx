'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';

interface UserAvatarDropdownProps {
  user: any;
}

export function UserAvatarDropdown({ user }: UserAvatarDropdownProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: `1px solid hsl(var(--border))`,
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'hsl(var(--muted))';
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
        }}
      >
        {user?.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'User'} 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%'
            }}
          />
        ) : (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'hsl(var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--primary-foreground))',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {userInitial}
          </div>
        )}
        <span style={{ 
          fontSize: '14px', 
          color: 'hsl(var(--foreground))',
          display: typeof window !== 'undefined' && window.innerWidth >= 768 ? 'inline' : 'none'
        }}>
          {user?.displayName || user?.email?.split('@')[0]}
        </span>
        <svg 
          style={{ 
            width: '16px', 
            height: '16px',
            color: 'hsl(var(--muted-foreground))',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: '224px',
          background: 'hsl(var(--card))',
          border: `1px solid hsl(var(--border))`,
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px hsl(var(--foreground) / 0.5)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px' }}>
            <div style={{ 
              padding: '8px 12px', 
              fontSize: '12px', 
              color: 'hsl(var(--muted-foreground))', 
              borderBottom: `1px solid hsl(var(--border))`,
              marginBottom: '4px'
            }}>
              {user?.email}
            </div>
            
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsl(var(--muted))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Settings
            </Link>
            
            <Link
              href="/dashboard#account"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsl(var(--muted))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <User style={{ width: '16px', height: '16px' }} />
              Account Management
            </Link>
            
            <div style={{ 
              borderTop: `1px solid hsl(var(--border))`, 
              margin: '4px 0'
            }} />
            
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                fontSize: '14px',
                color: 'hsl(var(--foreground))',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsl(var(--muted))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

