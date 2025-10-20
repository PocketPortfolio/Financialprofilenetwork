# Price Pipeline Health

**Endpoint**: `GET /api/health-price` → `{ providers: Array<{ provider, lastSuccess, lastFailure, failureCount, activeFallback }>}’

**States**
- **Fresh**: `Date.now - lastSuccess < 30s`
- **Fallback**: `activeFallback === true`
- **Unhealthy**: otherwise

**Persistence**
- Default: in-memory per Edge instance
- Optional: Upstash Redis (set `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- Optional snapshots: Firestore collection `providerHealth` with docs:
  ```json
  { "ts": <serverTimestamp>, "providers": [ ...ProviderHealth ] }
