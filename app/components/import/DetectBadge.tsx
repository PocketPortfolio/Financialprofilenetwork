'use client';
import React from 'react';

export function DetectBadge({ detected, onChange }: { detected: any; onChange: (b: any) => void }) {
  return (
    <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
      <span>Import functionality temporarily disabled</span>
    </div>
  );
}