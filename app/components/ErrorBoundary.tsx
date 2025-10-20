'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  scope?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in ${this.props.scope || 'component'}:`, error, errorInfo);
    
    // Log to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        custom_parameter_error: `ErrorBoundary: ${error.message}`,
        custom_parameter_scope: this.props.scope || 'unknown'
      });
    }
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            border: '1px solid var(--danger, #fee)',
            background: 'var(--danger-bg, #fff5f5)',
            borderRadius: '8px',
            margin: '20px',
            color: 'var(--text, #333)',
          }}
          role="alert"
        >
          <h2 style={{ color: 'var(--danger, #c00)', marginBottom: '10px', fontSize: '18px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--muted, #666)', marginBottom: '15px', fontSize: '14px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ marginBottom: '15px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--muted, #666)' }}>
                Error Details (Development)
              </summary>
              <pre style={{ 
                fontSize: '10px', 
                color: 'var(--danger, #c00)', 
                overflow: 'auto',
                maxHeight: '200px',
                marginTop: '8px',
                padding: '8px',
                background: 'var(--bg, #f5f5f5)',
                borderRadius: '4px'
              }}>
                {this.state.error?.stack}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              background: 'var(--accent, #0066cc)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `useErrorHandler: ${error.message}`,
        fatal: false
      });
    }
  };
}
