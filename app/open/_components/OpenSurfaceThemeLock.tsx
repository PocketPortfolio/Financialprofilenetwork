'use client';

import { useEffect } from 'react';

/**
 * OpenSurfaceThemeLock — pin data-theme="dark" while the user is browsing the
 * Open Portfolio (B2B) surface.
 *
 * The root layout's bootstrap inline script reads `localStorage.pocket-portfolio-theme`
 * which is set by the consumer (Pocket) surface. If a user has chosen the light
 * (cream) theme on Pocket and then lands on Open Portfolio, the inherited CSS
 * variables (--bg, --surface, --border-subtle) bleed cream into B2B chrome.
 *
 * This is a deliberate, scope-local override: it forces `data-theme="dark"` on
 * both <html> and <body> for the duration of the O. surface visit WITHOUT
 * mutating the persisted preference. Returning to Pocket restores the user's
 * chosen theme on the next route group.
 */
export default function OpenSurfaceThemeLock() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prevHtmlTheme = root.getAttribute('data-theme');
    const prevBodyTheme = body.getAttribute('data-theme');
    root.setAttribute('data-theme', 'dark');
    body.setAttribute('data-theme', 'dark');
    return () => {
      if (prevHtmlTheme) root.setAttribute('data-theme', prevHtmlTheme);
      if (prevBodyTheme) body.setAttribute('data-theme', prevBodyTheme);
    };
  }, []);
  return null;
}
