'use client';

import { useState } from 'react';
import AlertModal from '@/app/components/modals/AlertModal';

interface ShareButtonsProps {
  userId: string;
}

export default function ShareButtons({ userId }: ShareButtonsProps) {
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setAlertModal({
        isOpen: true,
        title: 'Copied!',
        message: 'Link copied to clipboard!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to copy link. Please try again.',
        type: 'error'
      });
    }
  };

  const copyMarkdown = async () => {
    try {
      const markdown = `[View Portfolio Performance](https://www.pocketportfolio.app/share/${userId})`;
      await navigator.clipboard.writeText(markdown);
      setAlertModal({
        isOpen: true,
        title: 'Copied!',
        message: 'Markdown copied to clipboard!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to copy markdown. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <>
      <button
        onClick={copyLink}
        className="brand-button brand-button-primary"
        style={{
          marginRight: 'var(--space-3)'
        }}
      >
        Copy Link
      </button>
      <button
        onClick={copyMarkdown}
        className="brand-button brand-button-secondary"
      >
        Copy as Markdown
      </button>
      
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </>
  );
}









