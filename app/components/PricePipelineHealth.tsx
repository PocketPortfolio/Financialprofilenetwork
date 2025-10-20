'use client';

import React, { useState, useEffect } from 'react';

interface DataSourceHealth {
  name: string;
  status: 'Fresh' | 'Fallback' | 'Unhealthy';
  lastUpdate: string;
  responseTime: number;
  errorRate: number;
  dataQuality: number;
  fallbackSource?: string;
}

interface RAGHealthStatus {
  overallStatus: 'Fresh' | 'Fallback' | 'Unhealthy';
  message: string;
  sources: DataSourceHealth[];
  timestamp: string;
  responseTime: number;
  ragAssessment: {
    fresh: number;
    fallback: number;
    unhealthy: number;
  };
}

export default function PricePipelineHealth() {
  const [healthStatus, setHealthStatus] = useState<RAGHealthStatus | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side to prevent hydration mismatch
    setIsClient(true);
    
    // RAG-based health check
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health-price');
        const data = await response.json();
        
        if (response.ok) {
          setHealthStatus(data);
        } else {
          setHealthStatus({
            overallStatus: 'Unhealthy',
            message: 'RAG assessment failed',
            sources: [],
            timestamp: new Date().toISOString(),
            responseTime: 0,
            ragAssessment: { fresh: 0, fallback: 0, unhealthy: 0 }
          });
        }
      } catch (error) {
        setHealthStatus({
          overallStatus: 'Unhealthy',
          message: 'RAG system unavailable',
          sources: [],
          timestamp: new Date().toISOString(),
          responseTime: 0,
          ragAssessment: { fresh: 0, fallback: 0, unhealthy: 0 }
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'Fresh' | 'Fallback' | 'Unhealthy') => {
    switch (status) {
      case 'Fresh':
        return '#10b981'; // green
      case 'Fallback':
        return '#f59e0b'; // yellow
      case 'Unhealthy':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status: 'Fresh' | 'Fallback' | 'Unhealthy') => {
    switch (status) {
      case 'Fresh':
        return '🟢';
      case 'Fallback':
        return '🟡';
      case 'Unhealthy':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (!isClient) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--text)'
      }}>
        <span style={{ fontSize: '14px' }}>⚪</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '500',
            color: 'var(--muted)',
            marginBottom: '2px'
          }}>
            RAG system initializing...
          </div>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--text)'
      }}>
        <span style={{ fontSize: '14px' }}>⚪</span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '500',
            color: 'var(--muted)',
            marginBottom: '2px'
          }}>
            Checking price pipeline status...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: '12px', color: 'var(--text)' }}>
      {/* Overall Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '14px' }}>
          {getStatusIcon(healthStatus.overallStatus)}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: '500',
            color: getStatusColor(healthStatus.overallStatus),
            marginBottom: '2px'
          }}>
            {healthStatus.message}
          </div>
          <div style={{ 
            fontSize: '11px',
            color: 'var(--muted)'
          }}>
            Last checked: {healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Individual Sources */}
      <div style={{ marginTop: '8px' }}>
        {healthStatus?.sources && healthStatus.sources.length > 0 ? (
          healthStatus.sources.map((source, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
            padding: '4px 8px',
            background: 'var(--surface)',
            borderRadius: '4px',
            border: `1px solid ${getStatusColor(source.status)}20`
          }}>
            <span style={{ fontSize: '12px' }}>
              {getStatusIcon(source.status)}
            </span>
            <div style={{ flex: 1, fontSize: '11px' }}>
              <div style={{ 
                fontWeight: '500',
                color: getStatusColor(source.status)
              }}>
                {source.name}
              </div>
              <div style={{ 
                fontSize: '10px',
                color: 'var(--muted)'
              }}>
                {source.responseTime}ms • {source.dataQuality}% quality
              </div>
            </div>
          </div>
        ))
        ) : (
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--muted)', 
            textAlign: 'center',
            padding: '8px'
          }}>
            No data sources available
          </div>
        )}
      </div>

      {/* RAG Assessment Summary */}
      <div style={{
        marginTop: '8px',
        padding: '6px 8px',
        background: 'var(--chrome)',
        borderRadius: '4px',
        fontSize: '10px',
        color: 'var(--muted)',
        textAlign: 'center'
      }}>
        RAG: {healthStatus?.ragAssessment?.fresh || 0} Fresh • {healthStatus?.ragAssessment?.fallback || 0} Fallback • {healthStatus?.ragAssessment?.unhealthy || 0} Unhealthy
      </div>
    </div>
  );
}
