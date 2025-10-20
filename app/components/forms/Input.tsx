'use client';

import React, { useState, forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  className = '',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size styles
  const sizeStyles = {
    sm: {
      padding: 'var(--space-sm) var(--space-md)',
      fontSize: 'var(--text-mobile-sm)',
      minHeight: 'var(--touch-target-min)',
    },
    md: {
      padding: 'var(--space-md)',
      fontSize: 'var(--text-mobile-base)',
      minHeight: 'var(--touch-target-comfortable)',
    },
    lg: {
      padding: 'var(--space-lg)',
      fontSize: 'var(--text-mobile-lg)',
      minHeight: 'var(--touch-target-large)',
    },
  };

  if (variant === 'floating') {
    return (
      <div className={`mobile-input-container ${className}`} style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            id={inputId}
            className="mobile-input"
            style={{
              width: '100%',
              background: 'var(--card)',
              border: `2px solid ${error ? 'var(--neg)' : isFocused ? 'var(--brand)' : 'transparent'}`,
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text)',
              fontSize: sizeStyles[size].fontSize,
              padding: sizeStyles[size].padding,
              minHeight: sizeStyles[size].minHeight,
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              ...(isFocused && { boxShadow: `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}` }),
            }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            {...props}
          />
          
          {label && (
            <label
              htmlFor={inputId}
              className="mobile-input-label"
              style={{
                position: 'absolute',
                left: sizeStyles[size].padding.split(' ')[1],
                top: isFocused || hasValue ? 'var(--space-xs)' : '50%',
                transform: isFocused || hasValue ? 'translateY(0)' : 'translateY(-50%)',
                fontSize: isFocused || hasValue ? 'var(--text-mobile-xs)' : sizeStyles[size].fontSize,
                color: error ? 'var(--neg)' : isFocused ? 'var(--brand)' : 'var(--muted)',
                background: 'var(--card)',
                padding: '0 var(--space-xs)',
                transition: 'all 0.2s ease',
                pointerEvents: 'none',
                zIndex: 10,
                fontWeight: '500',
              }}
            >
              {label}
              {props.required && <span style={{ color: 'var(--neg)' }}> *</span>}
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: 'var(--space-xs)',
              fontSize: 'var(--text-mobile-xs)',
              color: 'var(--neg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
            }}
          >
            <span>⚠</span>
            {error}
          </div>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <div
            style={{
              marginTop: 'var(--space-xs)',
              fontSize: 'var(--text-mobile-xs)',
              color: 'var(--muted)',
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`mobile-input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: 'var(--text-mobile-sm)',
            fontWeight: '500',
            color: 'var(--text)',
            marginBottom: 'var(--space-xs)',
          }}
        >
          {label}
          {props.required && <span style={{ color: 'var(--neg)' }}> *</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        className="mobile-input"
        style={{
          width: '100%',
          background: 'var(--card)',
          border: `1px solid ${error ? 'var(--neg)' : 'var(--card-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text)',
          fontSize: sizeStyles[size].fontSize,
          padding: sizeStyles[size].padding,
          minHeight: sizeStyles[size].minHeight,
          outline: 'none',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          ...(isFocused && { 
            borderColor: error ? 'var(--neg)' : 'var(--brand)',
            boxShadow: `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}` 
          }),
        }}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        onChange={handleChange}
        {...props}
      />

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: 'var(--space-xs)',
            fontSize: 'var(--text-mobile-xs)',
            color: 'var(--neg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
          }}
        >
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <div
          style={{
            marginTop: 'var(--space-xs)',
            fontSize: 'var(--text-mobile-xs)',
            color: 'var(--muted)',
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
























