# Supabase Connection Troubleshooting

## Issue: DNS Resolution Failure

**Error**: `getaddrinfo ENOTFOUND db.[YOUR-PROJECT-REF].supabase.co`

**Observation**: Supabase logs show successful connections, but local machine cannot resolve DNS.

## Possible Causes & Solutions

### 1. Connection Pooler URL (Recommended)

Supabase provides two connection strings:
- **Direct connection**: `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres`
- **Connection pooler**: `postgresql://postgres:...@db.xxx.supabase.co:6543/postgres` (port 6543)

**Try using the pooler URL**:
1. Go to Supabase Dashboard → Project Settings → Database
2. Look for "Connection Pooling" section
3. Use the pooler connection string (port 6543)
4. Update `.env.local`:
   ```bash
   SUPABASE_SALES_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   ```

### 2. Network/Firewall Issue

**Check**:
- Corporate firewall blocking Supabase domains
- VPN interfering with DNS resolution
- Windows DNS cache issue

**Try**:
```powershell
# Flush DNS cache
ipconfig /flushdns

# Test DNS resolution
nslookup db.[YOUR-PROJECT-REF].supabase.co
```

### 3. IP Allowlisting

**Check Supabase Settings**:
1. Go to Supabase Dashboard → Project Settings → Database
2. Check "Network Restrictions" or "IP Allowlist"
3. Ensure your IP is allowed (or disable restrictions for testing)

### 4. Project Status

**Verify**:
- Project is not paused
- Project is on active plan (not suspended)
- Database is provisioned and running

### 5. Alternative: Use Supabase Client Library

Instead of direct postgres connection, use Supabase JS client:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_SALES_URL!,
  process.env.SUPABASE_SALES_ANON_KEY!
);
```

This uses HTTPS API instead of direct postgres connection.

## Quick Test

Try connecting via psql command line:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

If this works, the issue is with the Node.js postgres library configuration.
If this fails, the issue is network/DNS related.

## Next Steps

1. Try connection pooler URL (port 6543)
2. Check network/firewall settings
3. Verify Supabase project is active
4. Test with psql command line
5. Consider using Supabase JS client as alternative


