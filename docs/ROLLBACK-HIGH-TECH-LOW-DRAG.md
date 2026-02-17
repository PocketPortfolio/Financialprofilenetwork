# Rollback: High-Tech, Low-Drag (Strider-Inspired) Landing

If you need to revert to the previous **static hero** and remove the Living Pipeline, Typewriter, Scroll Reveal, and grid pulse:

## 1. Remove new components (delete files)

- `app/components/landing/LivingPipeline.tsx`
- `app/components/ui/Typewriter.tsx`
- `app/components/ui/ScrollReveal.tsx`

## 2. Revert landing page

In `app/landing/page.tsx`:

- Remove these imports:
  - `import LivingPipeline from '../components/landing/LivingPipeline';`
  - `import Typewriter from '../components/ui/Typewriter';`
  - `import ScrollReveal from '../components/ui/ScrollReveal';`
- In the hero section: remove `<LivingPipeline />` and the wrapper that contains it.
- Restore the **static H1**: replace the `<Typewriter />` usage (and remove the `<noscript>Import any CSV. Instantly.</noscript>` that was added for SEO) with the original static headline (see block below).
- Remove all `<ScrollReveal>` wrappers around the Mission, Features, and FIN Pillars sections (keep the inner content; delete only the wrapper and its closing tag).

### Original static hero headline + subhead (paste back if reverting Typewriter)

```tsx
          {/* Headline - PREMIUM POSITIONING */}
          <h1 className="brand-text" style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: 'bold', 
            lineHeight: '1.1', 
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            maxWidth: '800px'
          }}>
            Evidence-First Investing.{' '}
            <span style={{ color: 'var(--accent-warm)' }}>Universal Data.</span>
          </h1>

          {/* Subhead - PREMIUM POSITIONING */}
          <p className="brand-text-secondary" style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', 
            lineHeight: '1.6', 
            marginBottom: '40px',
            maxWidth: '700px',
            color: 'var(--text-secondary)'
          }}>
            Stop waiting for integrations. Our LLM-powered engine imports trading history from{' '}
            <strong style={{ color: 'var(--text)' }}>any broker, bank, or spreadsheet</strong>
            {' '}in seconds.
            <br />
            <span style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              <strong style={{ color: 'var(--accent-warm)' }}>£100 Lifetime License.</strong> Own it forever.
            </span>
          </p>
```

## 3. Revert grid pulse in brand.css

In `app/styles/brand.css`:

- Remove the class `.brand-grid-pulse` and its `@keyframes grid-pulse` (and the `@media (prefers-reduced-motion: reduce)` block that disables it).
- Remove the class `brand-grid-pulse` from any element that has it (e.g. in `app/landing/page.tsx`, change the first hero `<main className="brand-surface brand-grid brand-grid-pulse ...">` back to `className="brand-surface brand-grid ..."`).

## 4. Quick git revert (if all changes are committed)

If the only changes in this branch are the High-Tech Low-Drag work:

```bash
git checkout app/landing/page.tsx app/styles/brand.css
git rm app/components/landing/LivingPipeline.tsx app/components/ui/Typewriter.tsx app/components/ui/ScrollReveal.tsx
```

Then restore the three deleted component files from the previous commit if you use them elsewhere, or leave them deleted.

---

**Added:** 2026-02 (Engineering Order: Living Pipeline, Typewriter, Scroll Reveal, Grid Pulse).
