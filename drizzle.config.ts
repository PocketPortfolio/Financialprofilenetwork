import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Drizzle config - only used by drizzle-kit CLI, not included in Next.js build
const drizzleConfig: Config = {
  schema: './db/sales/schema.ts',
  out: './drizzle/sales',
  dialect: 'postgresql' as any,
  dbCredentials: {
    url: process.env.SUPABASE_SALES_DATABASE_URL!,
  },
};

export default drizzleConfig;






