/**
 * Create Sales Tables Directly
 * Creates all required tables for the Sales Sidecar
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function createTables() {
  try {
    console.log('🔍 Connecting to Supabase...\n');
    
    const connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_SALES_DATABASE_URL not set');
    }
    
    const sql = postgres(connectionString, {
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10,
    });
    
    console.log('✅ Connected to database\n');
    
    // Create enums
    console.log('Creating enums...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE lead_status AS ENUM ('NEW', 'RESEARCHING', 'SCHEDULED', 'CONTACTED', 'REPLIED', 'INTERESTED', 'NOT_INTERESTED', 'DO_NOT_CONTACT', 'CONVERTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE conversation_type AS ENUM ('INITIAL_OUTREACH', 'FOLLOW_UP', 'OBJECTION_HANDLING', 'HUMAN_ESCALATION', 'AUTONOMOUS_REPLY', 'AI_REPLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE audit_action AS ENUM ('EMAIL_SENT', 'EMAIL_SCHEDULED', 'EMAIL_RECEIVED', 'RESEARCH_DONE', 'LEAD_SCORED', 'STATUS_CHANGED', 'COMPLIANCE_CHECK', 'RATE_LIMIT_HIT', 'KILL_SWITCH_ACTIVATED', 'ENRICHMENT_FAILED', 'EMAIL_FAILED', 'AUTONOMOUS_REPLY_SENT', 'AI_REPLY_SENT', 'AUTONOMOUS_REPLY_FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log('✅ Enums created\n');
    
    // Create leads table
    console.log('Creating leads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        company_name TEXT NOT NULL,
        job_title TEXT,
        linkedin_url TEXT,
        score INTEGER DEFAULT 0,
        status lead_status DEFAULT 'NEW' NOT NULL,
        tech_stack_tags JSONB DEFAULT '[]'::jsonb,
        research_summary TEXT,
        research_data JSONB,
        -- Sprint 4: Humanity & Precision fields
        location TEXT,
        timezone TEXT,
        detected_language TEXT,
        detected_region TEXT,
        news_signals JSONB,
        scheduled_send_at TIMESTAMP,
        opt_out BOOLEAN DEFAULT false NOT NULL,
        data_source TEXT,
        data_source_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_contacted_at TIMESTAMP
      );
    `;
    console.log('✅ leads table created\n');
    
    // Create conversations table
    console.log('Creating conversations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        type conversation_type NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        ai_model TEXT,
        ai_reasoning TEXT,
        sentiment_score INTEGER,
        direction TEXT NOT NULL,
        classification TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        email_id TEXT,
        thread_id TEXT
      );
    `;
    console.log('✅ conversations table created\n');
    
    // Create embeddings table
    console.log('Creating embeddings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
        embedding TEXT,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log('✅ embeddings table created\n');
    
    // Create audit_logs table
    console.log('Creating audit_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
        action audit_action NOT NULL,
        ai_reasoning TEXT,
        metadata JSONB,
        human_override BOOLEAN DEFAULT false,
        human_user_id TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log('✅ audit_logs table created\n');
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_lead_id ON audit_logs(lead_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`;
    console.log('✅ Indexes created\n');
    
    await sql.end();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All tables created successfully!');
    console.log('   - leads');
    console.log('   - conversations');
    console.log('   - embeddings');
    console.log('   - audit_logs');
    console.log('');
    console.log('Next: Test the Sales Dashboard');
    console.log('   http://localhost:3001/admin/sales');
    
    return true;
  } catch (error: any) {
    console.error('❌ Error creating tables:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    return false;
  }
}

createTables()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


