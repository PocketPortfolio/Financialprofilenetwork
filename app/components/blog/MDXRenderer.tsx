'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import React from 'react';

// MDX components using React.createElement for consistency
const createElement = React.createElement;
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h1', {
    ...props,
    style: {
      fontSize: '2em',
      fontWeight: '700',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      lineHeight: '1.3',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h2', {
    ...props,
    style: {
      fontSize: '1.5em',
      fontWeight: '600',
      marginTop: '1.2em',
      marginBottom: '0.5em',
      lineHeight: '1.4',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h3', {
    ...props,
    style: {
      fontSize: '1.25em',
      fontWeight: '600',
      marginTop: '1em',
      marginBottom: '0.5em',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h4', {
    ...props,
    style: {
      fontSize: '1.1em',
      fontWeight: '600',
      marginTop: '0.8em',
      marginBottom: '0.4em',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h5', {
    ...props,
    style: {
      fontSize: '1em',
      fontWeight: '600',
      marginTop: '0.6em',
      marginBottom: '0.4em',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => createElement('h6', {
    ...props,
    style: {
      fontSize: '0.9em',
      fontWeight: '600',
      marginTop: '0.5em',
      marginBottom: '0.3em',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => createElement('p', {
    ...props,
    style: {
      marginBottom: '1em',
      lineHeight: '1.8',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  strong: (props: React.HTMLAttributes<HTMLElement>) => createElement('strong', {
    ...props,
    style: {
      fontWeight: '700',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  em: (props: React.HTMLAttributes<HTMLElement>) => createElement('em', props),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => createElement('ul', {
    ...props,
    style: {
      marginBottom: '1em',
      paddingLeft: '1.5em',
      listStyleType: 'disc',
      ...props.style,
    },
  }),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => createElement('ol', {
    ...props,
    style: {
      marginBottom: '1em',
      paddingLeft: '1.5em',
      ...props.style,
    },
  }),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => createElement('li', {
    ...props,
    style: {
      marginBottom: '0.5em',
      lineHeight: '1.6',
      color: 'var(--text)',
      ...props.style,
    },
  }),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => createElement('a', {
    ...props,
    style: {
      color: 'var(--accent-warm)',
      textDecoration: 'underline',
      ...props.style,
    },
  }),
  code: (props: React.HTMLAttributes<HTMLElement>) => createElement('code', {
    ...props,
    style: {
      background: 'var(--surface-elevated)',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.9em',
      fontFamily: 'Courier New, monospace',
      color: 'var(--accent-warm)',
      ...props.style,
    },
  }),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => createElement('pre', {
    ...props,
    style: {
      background: 'var(--surface-elevated)',
      padding: '1em',
      borderRadius: '8px',
      overflowX: 'auto',
      marginBottom: '1.5em',
      border: '1px solid var(--border)',
      ...props.style,
    },
  }),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => createElement('blockquote', {
    ...props,
    style: {
      borderLeft: '4px solid var(--accent-warm)',
      paddingLeft: '1em',
      marginLeft: '0',
      marginBottom: '1em',
      marginTop: '1em',
      fontStyle: 'italic',
      color: 'var(--text-secondary)',
      ...props.style,
    },
  }),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => createElement('hr', {
    ...props,
    style: {
      border: 'none',
      borderTop: '1px solid var(--border)',
      margin: '2em 0',
      ...props.style,
    },
  }),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => createElement('img', {
    ...props,
    style: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '8px',
      marginBottom: '1em',
      marginTop: '1em',
      ...props.style,
    },
  }),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => createElement('div', {
    style: {
      overflowX: 'auto',
      marginBottom: '2em',
      marginTop: '1.5em',
      borderRadius: '12px',
      border: '1px solid rgba(128, 128, 128, 0.2)',
      background: 'var(--surface-elevated)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  }, createElement('table', {
    ...props,
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '16px',
      lineHeight: '1.6',
      minWidth: '100%',
      ...props.style,
    },
  })),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => createElement('thead', {
    ...props,
    style: {
      background: 'var(--surface)',
      borderBottom: '2px solid rgba(128, 128, 128, 0.3)',
      ...props.style,
    },
  }),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => createElement('tbody', props),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => createElement('tr', {
    ...props,
    style: {
      borderBottom: '1px solid rgba(128, 128, 128, 0.15)',
      transition: 'background 0.2s ease',
      ...props.style,
    },
  }),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => createElement('th', {
    ...props,
    style: {
      padding: '18px 20px',
      textAlign: 'left',
      fontWeight: '700',
      color: 'var(--text)',
      fontSize: '15px',
      letterSpacing: '0.01em',
      borderRight: '1px solid rgba(128, 128, 128, 0.15)',
      whiteSpace: 'nowrap',
      ...props.style,
    },
  }),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => createElement('td', {
    ...props,
    style: {
      padding: '18px 20px',
      color: 'var(--text-secondary)',
      borderRight: '1px solid rgba(128, 128, 128, 0.15)',
      verticalAlign: 'top',
      fontSize: '15px',
      lineHeight: '1.7',
      ...props.style,
    },
  }),
};

interface MDXRendererProps {
  source: MDXRemoteSerializeResult;
}

export default function MDXRenderer({ source }: MDXRendererProps) {
  try {
    // Validate source before rendering
    if (!source) {
      throw new Error('MDX source is null or undefined');
    }
    
    return (
      <MDXRemote
        {...source}
        components={mdxComponents}
      />
    );
  } catch (error: any) {
    // ✅ Log error for production debugging
    console.error('[MDXRenderer Error]', {
      error: error.message,
      errorName: error.name,
      stack: error.stack?.substring(0, 500),
      hasSource: !!source,
      sourceType: typeof source,
      timestamp: new Date().toISOString(),
    });
    
    return (
      <div style={{
        padding: '2em',
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}>
        <h2 style={{ color: 'var(--accent-warm)', marginBottom: '1em' }}>
          Error Loading Content
        </h2>
        <p style={{ marginBottom: '1em' }}>
          There was an error rendering this blog post. Please try refreshing the page.
        </p>
        <pre style={{
          background: '#f5f5f5',
          padding: '1em',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px',
        }}>
          Error: {error.message || 'Unknown error'}
          {process.env.NODE_ENV === 'production' && error.stack && (
            <details style={{ marginTop: '0.5em' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--accent-warm)' }}>Technical Details</summary>
              <pre style={{ marginTop: '0.5em', fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
                {error.stack.substring(0, 1000)}
              </pre>
            </details>
          )}
        </pre>
      </div>
    );
  }
}

