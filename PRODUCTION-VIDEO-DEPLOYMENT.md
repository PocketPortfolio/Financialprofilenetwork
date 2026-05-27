# Landing Product Videos — Production Checklist

**Date:** 2026-05-27  
**Status:** Ready for production deploy

---

## Branded 4K assets (verified)

| Clip | Resolution | Local fallback | Cloudinary version | CDN URL |
|------|------------|----------------|--------------------|---------|
| **Hero dashboard demo** | 3840×2098 | `public/dashboard-demo-4k.mp4` (~18 MB) | `v1779906039` | `https://res.cloudinary.com/dknmhvm7a/video/upload/v1779906039/pocket-portfolio/dashboard-demo-4k.mp4` |
| **Pocket Analyst demo** | 3840×2110 | `public/pocket-analyst-demo.mp4` (~6.6 MB) | `v1779906828` | `https://res.cloudinary.com/dknmhvm7a/video/upload/v1779906828/pocket-portfolio/pocket-analyst-demo.mp4` |

Both encodes: H.264 Main profile, keyframe every 1s, `fastdecode`, `+faststart`, no audio.

---

## Code (prod-safe)

- **`lib/landing-product-video.ts`** — version-stamped CDN defaults; ignores stale env overrides.
- **`app/components/landing/LandingProductVideo.tsx`** — shared player: `playsInline`, `muted`, `autoPlay`, `aspect-ratio` (no layout shift on mobile), CDN → local fallback on error.
- **`app/landing/page.tsx`** — hero uses `LandingProductVideo`.
- **`app/components/landing/AnalystVideo.tsx`** — analyst section; Cloudinary trim `so_0,eo_42/` for 42s loop.
- **`next.config.js`** — `Accept-Ranges: bytes` on all fallback MP4 paths; CSP `media-src` allows `https://res.cloudinary.com`.

---

## Vercel environment (already set)

```
NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL=https://res.cloudinary.com/dknmhvm7a/video/upload/v1779906039/pocket-portfolio/dashboard-demo-4k.mp4
NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL=https://res.cloudinary.com/dknmhvm7a/video/upload/v1779906828/pocket-portfolio/pocket-analyst-demo.mp4
```

Production, Preview, and Development — confirm with `vercel env ls`.

---

## Pre-deploy checklist

- [ ] Commit updated MP4 fallbacks (`public/dashboard-demo-4k.mp4`, `public/pocket-analyst-demo.mp4`)
- [ ] Commit code changes (`lib/landing-product-video.ts`, components, `next.config.js`)
- [ ] `npm run lint` — clean
- [ ] `npx tsc --noEmit` — clean
- [ ] Push → Vercel redeploy (bakes `NEXT_PUBLIC_*` into client bundle)

---

## Post-deploy smoke test

1. Open `https://www.pocketportfolio.app/` on **desktop** and **mobile** (or DevTools device mode).
2. **Hero:** GOOGL +157.46%, $9,523.95 — video animates (not frozen TSLA screenshot).
3. **Pocket Analyst section:** new branded clip plays; 4K badge visible; Try Ask AI works.
4. Network tab: video requests hit `res.cloudinary.com/.../v1779906039/...` and `.../so_0,eo_42/v1779906828/...`.
5. If CDN fails, fallback serves committed `public/*.mp4` from same origin.

---

## Replacing a video later

1. Encode source to 3840px width (same ffmpeg profile as dashboard demo).
2. Overwrite `public/*.mp4`, run `npm run upload-gif-cloudinary` or `npm run upload-pocket-analyst-cloudinary`.
3. Bump `DASHBOARD_DEMO_BRANDED_VERSION` or `POCKET_ANALYST_BRANDED_VERSION` in `lib/landing-product-video.ts`.
4. Update Vercel env with new version-stamped URL → redeploy.
