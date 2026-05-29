'use client';

import ReactMarkdown from 'react-markdown';

/** Client-only markdown render — server passes plain string (RSC-safe). */
export default function BlogMarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="blog-content-markdown">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
