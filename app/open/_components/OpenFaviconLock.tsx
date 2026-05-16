'use client';

import { useEffect } from 'react';

/**
 * Root layout hard-codes Pocket favicon <link> tags in <head>. On the O. surface
 * we swap them to the Open monogram so browser tabs show O. not P.
 */
const OPEN_ICON = '/brand/op-icon.png';
const OPEN_SVG = '/brand/op-monogram-amber.svg';

export default function OpenFaviconLock() {
  useEffect(() => {
    const prev: Array<{ el: HTMLLinkElement; href: string }> = [];

    const swap = (selector: string, href: string, type?: string) => {
      document.querySelectorAll<HTMLLinkElement>(selector).forEach((el) => {
        prev.push({ el, href: el.href });
        el.href = href;
        if (type) el.type = type;
      });
    };

    swap('link[rel="icon"][type="image/svg+xml"]', OPEN_SVG, 'image/svg+xml');
    swap('link[rel="icon"][type="image/png"]', OPEN_ICON, 'image/png');
    swap('link[rel="apple-touch-icon"]', OPEN_ICON);

    const title = document.title;
    if (!title.includes('Open Portfolio') && !title.endsWith('| Open Portfolio')) {
      // Leave page-specific titles; layout template handles suffix on O. routes.
    }

    return () => {
      prev.forEach(({ el, href }) => {
        el.href = href;
      });
    };
  }, []);

  return null;
}
