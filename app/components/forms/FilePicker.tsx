'use client';

import React, { useRef, useState } from 'react';

export interface FilePickerProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFileSelect: (files: FileList | null) => void;
  onError?: (error: string) => void;
  className?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

// File size formatter
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FilePicker({
  accept = '.csv,.xlsx,.xls',
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  onError,
  className = '',
  label = 'Choose File',
  helperText = 'CSV, XLSX, or XLS files up to 5MB',
  disabled = false,
}: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max ${formatFileSize(maxSize)})`);
        return;
      }

      // Check file type
      const fileName = file.name.toLowerCase();
      const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return file.type.includes(type.replace('*', ''));
      });

      if (!isAccepted) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      onError?.(errors.join(', '));
      return;
    }

    setSelectedFiles(validFiles);
    onFileSelect(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    // Create a new FileList-like object
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    onFileSelect(dt.files);
  };

  return (
    <div className={`mobile-file-picker ${className}`}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 'var(--text-mobile-sm)',
            fontWeight: '500',
            color: 'var(--text)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          {label}
        </label>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {/* Drop Zone */}
      <div
        className="mobile-file-drop-zone"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--brand)' : 'var(--card-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--card)',
          transition: 'all 0.2s ease',
          minHeight: 'var(--touch-target-large)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {/* Upload Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: isDragOver ? 'var(--brand)' : 'var(--chrome)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDragOver ? 'white' : 'var(--muted)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Upload Text */}
        <div>
          <div
            style={{
              fontSize: 'var(--text-mobile-base)',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: 'var(--space-xs)',
            }}
          >
            {isDragOver ? 'Drop files here' : 'Choose File'}
          </div>
          <div
            style={{
              fontSize: 'var(--text-mobile-sm)',
              color: 'var(--muted)',
            }}
          >
            {helperText}
          </div>
        </div>

        {/* Choose File Button */}
        <button
          type="button"
          className="mobile-file-button touch-target-comfortable"
          disabled={disabled}
          style={{
            background: 'var(--brand)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-lg)',
            fontSize: 'var(--text-mobile-sm)',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--brand)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Browse Files
        </button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div
          style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-lg)',
            background: 'var(--chrome)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--card-border)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-mobile-sm)',
              fontWeight: '500',
              color: 'var(--text)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            Selected Files ({selectedFiles.length})
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-sm)',
                  background: 'var(--card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 'var(--text-mobile-xs)',
                    }}
                  >
                    📄
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--text-mobile-sm)',
                        fontWeight: '500',
                        color: 'var(--text)',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-mobile-xs)',
                        color: 'var(--muted)',
                      }}
                    >
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="touch-target"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neg)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-xs)',
                    fontSize: 'var(--text-mobile-base)',
                  }}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}










