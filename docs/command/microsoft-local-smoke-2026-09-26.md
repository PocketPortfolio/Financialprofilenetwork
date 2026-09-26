# Local smoke — Microsoft sign-in + OneDrive Sovereign Sync

**Dev URL:** http://localhost:3001  
**Env:** `.env.local` has `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` (restart `npm run dev` after any env change).

## Azure must be finished before OneDrive works

1. App → **Authentication** → Add platform → **Single-page application**
   - `http://localhost:3001`
   - (optional now) `https://www.pocketportfolio.app`
2. App → **API permissions** → Microsoft Graph **Delegated**:
   - `openid`, `email`, `profile`, `User.Read`, `Files.ReadWrite.AppFolder`
3. Firebase Microsoft provider: Application ID = client ID, Application secret = secret **Value** (not Secret ID).

## Smoke A — Identity (anyone)

1. Open http://localhost:3001/login (or settings while signed out).
2. **Sign in with Microsoft** → complete Microsoft account picker.
3. Land in app / dashboard. Settings shows signed in with Microsoft.
4. Sign out. Confirm session clears.

## Smoke B — Sync gate (free / unpaid)

1. Stay on a non–Corporate / non–Founders account.
2. Settings → OneDrive Sovereign Sync → Connect should open upgrade / unlock, **not** Graph consent.

## Smoke C — OneDrive (paid seat)

1. Use Corporate or Founders Club account.
2. Settings → **Connect OneDrive** → second consent (App folder only).
3. Confirm `Apps/Pocket Portfolio` gets `pocket_portfolio_db.json`.
4. Disconnect → MSAL session clears; file remains in OneDrive.
5. If Drive was connected, connecting OneDrive should stop Drive auto-sync (one cloud).

## Failures to watch

| Symptom | Likely cause |
|---------|----------------|
| Firebase `invalid-credential` / secret errors | Secret ID pasted instead of Value; rotate secret |
| `redirect_uri_mismatch` on MSAL | Missing SPA `http://localhost:3001` |
| `AADSTS65001` / consent | Missing Graph delegated permission |
| Connect OneDrive: “not configured” | Env missing; restart dev server |
| Sign-in works, sync blocked | Correct — unpaid seats |

Do not paste client secrets into chat or `.env`.
