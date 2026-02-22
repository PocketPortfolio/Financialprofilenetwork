/**
 * Enable Row Level Security (RLS) on public.system_settings
 * Fixes Supabase Security Advisor error: "RLS Disabled in Public"
 *
 * Access pattern: app uses SUPABASE_SALES_DATABASE_URL (direct Postgres), which
 * bypasses RLS. Enabling RLS locks down API access (anon/authenticated) while
 * keeping server-side access unchanged.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function enableRlsSystemSettings() {
  try {
    const connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_SALES_DATABASE_URL not set');
    }

    const sql = postgres(connectionString, {
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10,
    });

    console.log('Enabling RLS on public.system_settings...\n');

    await sql`
      ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
    `;
    console.log('✅ RLS enabled on public.system_settings\n');

    await sql.end();
    console.log('✅ Done. Re-run Security Advisor in Supabase to clear the error.');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  enableRlsSystemSettings();
}

export { enableRlsSystemSettings };
