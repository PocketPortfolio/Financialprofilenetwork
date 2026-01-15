'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductionNavbar from '../components/marketing/ProductionNavbar';
import WaitlistForm from '../components/waitlist/WaitlistForm';
import SEOHead from '../components/SEOHead';
import StructuredData, { webAppData } from '../components/StructuredData';

function JoinWaitlistContent() {
  const searchParams = useSearchParams();
  const [source, setSource] = useState<'web:join' | 'web:footer' | 'web:header'>('web:join');
  
  useEffect(() => {
    const sourceParam = searchParams.get('source') as 'web:footer' | 'web:header' | null;
    if (sourceParam && ['web:footer', 'web:header'].includes(sourceParam)) {
      setSource(sourceParam);
    }
  }, [searchParams]);
  
  const handleFormSubmit = (success: boolean, message: string) => {
    // Could add additional analytics or redirect logic here
    console.log('Form submission result:', success, message);
  };
  
  return (
    <>
      <SEOHead
        title="Join Our Waitlist - Early Access to Pocket Portfolio"
        description="Be among the first to experience Pocket Portfolio's next-generation features. Join our waitlist for early access, exclusive updates, and priority support."
        keywords={[
          'waitlist',
          'early access',
          'pocket portfolio',
          'portfolio tracker',
          'investment dashboard',
          'beta access',
          'product updates',
          'financial technology'
        ]}
        canonical="https://www.pocketportfolio.app/join"
        ogImage="https://www.pocketportfolio.app/api/og?title=Pocket%20Portfolio&description=Evidence-First%20Investing&v=3"
        ogType="website"
      />
      
      <StructuredData type="WebApplication" data={webAppData} />
      
      <div className="join-page-container" style={{ 
        minHeight: '100vh', 
        background: 'var(--bg)', 
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <ProductionNavbar />

        {/* Main Content */}
        <main className="join-page-main" style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 4vw, 32px)',
          minHeight: 'calc(100vh - 80px)',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          <div className="join-page-card" style={{
            maxWidth: 'clamp(400px, 50vw, 450px)',
            width: '100%',
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: 'clamp(16px, 4vw, 32px)',
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, var(--accent-warm) 0%, #f59e0b 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '24px',
                boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4)'
              }}>
                🚀
              </div>
              
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Join Our Waitlist
              </h1>
              
              <p style={{
                fontSize: '16px',
                color: 'var(--muted)',
                lineHeight: '1.5',
                margin: 0
              }}>
                Be among the first to experience Pocket Portfolio's next-generation features. 
                Get early access, exclusive updates, and priority support.
              </p>
            </div>

            {/* Form */}
            <WaitlistForm 
              source={source}
              onSubmit={handleFormSubmit}
              showOptionalFields={true}
            />

            {/* Benefits */}
            <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--pos)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✨</span>
                What you'll get:
              </h3>
              <ul style={{
                fontSize: '14px',
                color: 'var(--text)',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: '1.6'
              }}>
                <li>Early access to new features</li>
                <li>Exclusive beta testing opportunities</li>
                <li>Priority customer support</li>
                <li>Monthly updates on our progress</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
export default function JoinWaitlistPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinWaitlistContent />
    </Suspense>
  );
}

