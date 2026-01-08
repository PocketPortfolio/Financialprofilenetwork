import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

async function getTestLead() {
  const [lead] = await db.select().from(leads).where(eq(leads.status, 'NEW')).limit(1);
  if (lead) {
    console.log(lead.id);
  } else {
    console.error('No NEW leads found');
    process.exit(1);
  }
}

getTestLead();

