'use client';

import Link from 'next/link';
import { ReactNode, CSSProperties } from 'react';

interface HoverableLinkProps {
  href: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function HoverableLink({ href, children, style, className, onClick }: HoverableLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      style={style}
      onMouseEnter={(e) => {
        if (style?.transition) {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (style?.transition) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </Link>
  );
}




