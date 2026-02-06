DO $$ BEGIN
 CREATE TYPE "audit_action" AS ENUM('EMAIL_SENT', 'EMAIL_SCHEDULED', 'EMAIL_RECEIVED', 'RESEARCH_DONE', 'LEAD_SCORED', 'STATUS_CHANGED', 'COMPLIANCE_CHECK', 'RATE_LIMIT_HIT', 'KILL_SWITCH_ACTIVATED', 'AUTONOMOUS_REPLY_SENT', 'AUTONOMOUS_REPLY_FAILED', 'AI_REPLY_SENT', 'LEAD_SUBMITTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "conversation_type" AS ENUM('INITIAL_OUTREACH', 'FOLLOW_UP', 'OBJECTION_HANDLING', 'HUMAN_ESCALATION', 'AUTONOMOUS_REPLY', 'AI_REPLY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "lead_status" AS ENUM('NEW', 'RESEARCHING', 'SCHEDULED', 'CONTACTED', 'REPLIED', 'INTERESTED', 'NOT_INTERESTED', 'UNQUALIFIED', 'DO_NOT_CONTACT', 'CONVERTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"action" "audit_action" NOT NULL,
	"ai_reasoning" text,
	"metadata" jsonb,
	"human_override" boolean DEFAULT false,
	"human_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" "conversation_type" NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"ai_model" text,
	"ai_reasoning" text,
	"sentiment_score" integer,
	"direction" text NOT NULL,
	"classification" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email_id" text,
	"thread_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"embedding" text,
	"content" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"company_name" text NOT NULL,
	"job_title" text,
	"linkedin_url" text,
	"score" integer DEFAULT 0,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"tech_stack_tags" jsonb DEFAULT '[]'::jsonb,
	"research_summary" text,
	"research_data" jsonb,
	"location" text,
	"timezone" text,
	"detected_language" text,
	"detected_region" text,
	"news_signals" jsonb,
	"scheduled_send_at" timestamp,
	"sequence_step" integer DEFAULT 0,
	"opt_out" boolean DEFAULT false NOT NULL,
	"data_source" text,
	"data_source_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_contacted_at" timestamp,
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "search_miss_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_query" text NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticker_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_query" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
