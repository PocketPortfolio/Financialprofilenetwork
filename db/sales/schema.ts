import { pgTable, text, timestamp, integer, jsonb, boolean, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const leadStatusEnum = pgEnum('lead_status', [
  'NEW',
  'RESEARCHING',
  'SCHEDULED',
  'CONTACTED',
  'REPLIED',
  'INTERESTED',
  'NOT_INTERESTED',
  'DO_NOT_CONTACT',
  'CONVERTED'
]);

export const conversationTypeEnum = pgEnum('conversation_type', [
  'INITIAL_OUTREACH',
  'FOLLOW_UP',
  'OBJECTION_HANDLING',
  'HUMAN_ESCALATION',
  'AUTONOMOUS_REPLY',
  'AI_REPLY'
]);

export const auditActionEnum = pgEnum('audit_action', [
  'EMAIL_SENT',
  'EMAIL_SCHEDULED',
  'EMAIL_RECEIVED',
  'RESEARCH_DONE',
  'LEAD_SCORED',
  'STATUS_CHANGED',
  'COMPLIANCE_CHECK',
  'RATE_LIMIT_HIT',
  'KILL_SWITCH_ACTIVATED',
  'AUTONOMOUS_REPLY_SENT',
  'AUTONOMOUS_REPLY_FAILED',
  'AI_REPLY_SENT'
]);

// Leads Table
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  companyName: text('company_name').notNull(),
  jobTitle: text('job_title'),
  linkedinUrl: text('linkedin_url'),
  
  // Scoring & Status
  score: integer('score').default(0), // 0-100
  status: leadStatusEnum('status').default('NEW').notNull(),
  
  // Research Data
  techStackTags: jsonb('tech_stack_tags').$type<string[]>().default([]),
  researchSummary: text('research_summary'),
  researchData: jsonb('research_data').$type<Record<string, any>>(),
  
  // Cultural Intelligence (Sprint 4: Humanity & Precision)
  location: text('location'), // e.g., "London, UK", "San Francisco, CA"
  timezone: text('timezone'), // e.g., "Europe/London", "America/Los_Angeles"
  detectedLanguage: text('detected_language'), // e.g., "en", "zh-CN", "de"
  detectedRegion: text('detected_region'), // e.g., "CN", "BR", "DE"
  newsSignals: jsonb('news_signals').$type<Array<{
    type: 'funding' | 'hiring' | 'cto_announcement' | 'product_launch';
    date: string;
    description: string;
    source: string;
    relevance: number;
  }>>(),
  
  // Scheduling (Sprint 4: Timezone Awareness)
  scheduledSendAt: timestamp('scheduled_send_at'), // For timezone-aware sending
  
  // Compliance
  optOut: boolean('opt_out').default(false).notNull(),
  dataSource: text('data_source'), // e.g., "apollo", "linkedin", "manual"
  dataSourceDate: timestamp('data_source_date'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastContactedAt: timestamp('last_contacted_at'),
});

// Conversations Table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }).notNull(),
  
  type: conversationTypeEnum('type').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  
  // AI Metadata
  aiModel: text('ai_model'), // e.g., "gpt-4o", "claude-3.5-sonnet"
  aiReasoning: text('ai_reasoning'), // Why this email was generated
  sentimentScore: integer('sentiment_score'), // -100 to 100
  
  // Direction
  direction: text('direction').notNull(), // 'outbound' | 'inbound'
  
  // Classification (for inbound)
  classification: text('classification'), // 'INTERESTED' | 'NOT_INTERESTED' | 'OOO' | 'HUMAN_ESCALATION'
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  emailId: text('email_id'), // Resend email ID
  threadId: text('thread_id'), // For threading
});

// Embeddings Table (for RAG)
export const embeddings = pgTable('embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  
  // Vector embedding (1536 dimensions for OpenAI)
  // Note: Using text for now - pgvector extension can be added later
  // To enable: CREATE EXTENSION IF NOT EXISTS vector;
  embedding: text('embedding'), // Will store JSON array or use pgvector when extension is enabled
  
  // Source content
  content: text('content').notNull(),
  contentType: text('content_type').notNull(), // 'company_info' | 'tech_stack' | 'job_posting'
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  
  action: auditActionEnum('action').notNull(),
  aiReasoning: text('ai_reasoning'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  
  // Compliance
  humanOverride: boolean('human_override').default(false),
  humanUserId: text('human_user_id'), // If overridden by human
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const leadsRelations = relations(leads, ({ many }) => ({
  conversations: many(conversations),
  embeddings: many(embeddings),
  auditLogs: many(auditLogs),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  lead: one(leads, {
    fields: [conversations.leadId],
    references: [leads.id],
  }),
}));


