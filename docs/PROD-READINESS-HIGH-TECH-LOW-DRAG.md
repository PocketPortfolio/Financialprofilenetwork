# Production Readiness: High-Tech Low-Drag Landing

**Feature:** Strider-inspired hero (Living Pipeline, Typewriter, Scroll Reveal, grid pulse).  
**Rollback:** [docs/ROLLBACK-HIGH-TECH-LOW-DRAG.md](./ROLLBACK-HIGH-TECH-LOW-DRAG.md)

---

## Pre-deploy checklist

- [ ] **Build:** `npm run build` completes successfully (importer, sitemaps, inject-firebase, next build).
- [ ] **Landing:** Open `/` (or `/landing` if routed there). Confirm:
  - Living Pipeline (CSV → processor → JSON) animates; pauses when tab is hidden; **cards stay at full opacity** (no darkening on tab switch—fixed via explicit `paused` variants).
  - Typewriter cycles between the two strings with amber cursor.
  - Grid has subtle pulse on hero (or disabled if `prefers-reduced-motion`).
  - Mission, Features, FIN Pillars sections reveal on scroll (once).
- [ ] **Reduced motion:** In OS/browser set “Reduce motion” (e.g. Windows: Settings → Accessibility → Visual effects). Reload landing: Typewriter shows static first string; ScrollReveal shows content without animation; grid pulse off.
- [ ] **SEO:** Hero H1 includes `<noscript>Import any CSV. Instantly.</noscript>` so crawlers without JS still see the primary headline.
- [ ] **No console errors:** Check browser console on landing for errors (Framer Motion, hydration, etc.).

---

## Post-deploy (optional)

- [ ] **LCP / performance:** Confirm no regression on landing (Lighthouse or Web Vitals). Framer Motion is already a dependency; new components are small.
- [ ] **Rollback path:** If issues arise, follow [ROLLBACK-HIGH-TECH-LOW-DRAG.md](./ROLLBACK-HIGH-TECH-LOW-DRAG.md) to revert to the static hero.

---

## Files touched

| File | Purpose |
|------|--------|
| `app/components/landing/LivingPipeline.tsx` | CSV → processor → JSON hero animation |
| `app/components/ui/Typewriter.tsx` | Typing effect for hero H1 |
| `app/components/ui/ScrollReveal.tsx` | Scroll-triggered reveal (Mission, Features, FIN) |
| `app/styles/brand.css` | `.brand-grid-pulse`, `@keyframes grid-pulse`, `typewriter-blink` |
| `app/landing/page.tsx` | Hero integration, ScrollReveal wrappers, `noscript` fallback |

---

**Last updated:** 2026-02 (prod prep). Pipeline darkening fix: `paused` variants now set `opacity: 1` (and x/scale) so cards do not dim on tab switch.
