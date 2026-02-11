'use client';

import React from 'react';

export function DownloadPdfButton() {
  function handleDownload() {
    window.print();
  }

  return (
    <div className="no-print fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={handleDownload}
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        aria-label="Download or print book as PDF"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Bestseller Edition (PDF)
      </button>
    </div>
  );
}
