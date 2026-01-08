import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

export default {
  schema: './db/sales/schema.ts',
  out: './drizzle/sales',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_SALES_DATABASE_URL!,
  },
} satisfies Config;






