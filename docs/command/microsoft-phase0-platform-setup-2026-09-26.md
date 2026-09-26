# Microsoft Identity + OneDrive — Platform setup (Phase 0)

Execution lock: `docs/command/microsoft-sovereign-sync-execution-lock-2026-09-26.md`

## Azure app registration

1. Create an app registration: **Accounts in any organizational directory and personal Microsoft accounts**.
2. Authentication:
   - Add **Web** redirect: `https://<FIREBASE_AUTH_DOMAIN>/__/auth/handler` (Firebase Microsoft provider).
   - Add **SPA** redirect URIs (exact, no trailing slash):
     - Local: `http://localhost:3001`
     - Production (canonical): `https://www.pocketportfolio.app` — **required**
     - Optional apex (harmless): `https://pocketportfolio.app` — site 301s apex→www; do **not** use apex as the only SPA URI or MSAL PKCE breaks
     - Optional forwarder only if `NEXT_PUBLIC_MICROSOFT_REDIRECT_URI` points at `onedrive-auth.html` on the **same** origin
3. API permissions (delegated only): `openid`, `email`, `profile`, `User.Read`, `Files.ReadWrite.AppFolder`.
4. Do **not** add Mail, Sites, or application (app-only) permissions.
5. Copy the **Application (client) ID** → `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` in Vercel (Production / Preview / Development) and `.env.local`.
   - Optional: `NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=https://www.pocketportfolio.app` (must match the host users actually browse; runtime prefers `window.location.origin`).
   - Optional reference only: `NEXT_PUBLIC_MICROSOFT_TENANT_ID` (runtime MSAL uses `/common`).
   - Never put the Azure client secret in `NEXT_PUBLIC_*` — Firebase Console only.

## Seat gate (product)

- Microsoft **sign-in** is free (Firebase identity).
- OneDrive **Sovereign Sync** is Corporate / Founders only — same gate as Google Drive.
- Free seats must see upgrade UI only; Connect must not start MSAL.

## Firebase

1. Authentication → Sign-in method → Microsoft → Enable.
2. Paste Azure Application ID and Client secret (Firebase console only — never expose the secret as `NEXT_PUBLIC_*`).
3. Confirm tenant / common support matches Azure multi-tenant + personal.

## Env

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=<azure-application-client-id>
```

## CSP

`middleware.ts` allows Microsoft auth + Graph + OneDrive/SharePoint download hosts:
`login.microsoftonline.com`, `login.live.com`, `graph.microsoft.com`, `*.sharepoint.com`,
`*.onedrive.com`, `onedrive.live.com`, `*.livefilestore.com` (file content CDN after Graph).

## Verify

- Free user: Sign in with Microsoft works; Connect OneDrive shows upgrade.
- Corporate / Founders: Connect OneDrive opens MSAL consent for AppFolder only.
- Network tab: no Graph bearer token calls to `/api/*`.
