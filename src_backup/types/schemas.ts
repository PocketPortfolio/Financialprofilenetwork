/**
 * Firestore collection schemas with Zod validation
 */
import { z } from 'zod';

// ============================================================
// Provider Health
// ============================================================
export const providerHealthSchema = z.object({
  provider: z.enum(['yahoo', 'chart', 'stooq']),
  lastSuccess: z.number().nullable(),
  lastFailure: z.number().nullable(),
  failureCount: z.number().int().min(0),
  activeFallback: z.boolean(),
});

export type ProviderHealth = z.infer<typeof providerHealthSchema>;

// ============================================================
// Portfolio
// ============================================================
export const portfolioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  version: z.number().int().default(1), // For migrations
});

export type Portfolio = z.infer<typeof portfolioSchema>;

// ============================================================
// Trade
// ============================================================
export const tradeTypeSchema = z.enum(['buy', 'sell', 'dividend', 'split', 'transfer']);

export const tradeSchema = z.object({
  id: z.string().optional(),
  symbol: z.string().min(1).max(20),
  type: tradeTypeSchema,
  quantity: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  fees: z.number().min(0).default(0),
  timestamp: z.date(),
  notes: z.string().max(500).optional(),
  isMock: z.boolean().default(false), // Mock trades for testing
  portfolioId: z.string(),
  createdAt: z.date(),
  version: z.number().int().default(1),
});

export type Trade = z.infer<typeof tradeSchema>;

// ============================================================
// Watchlist
// ============================================================
export const watchlistSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(50).default('Default'),
  symbols: z.array(z.string().min(1).max(10)).max(50),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export type Watchlist = z.infer<typeof watchlistSchema>;

// ============================================================
// User Preferences
// ============================================================
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  currency: z.string().length(3).default('USD'),
  locale: z.string().default('en-US'),
  notifications: z.object({
    priceAlerts: z.boolean().default(true),
    newsDigest: z.boolean().default(false),
  }).optional(),
  privacy: z.object({
    analytics: z.boolean().default(true),
    crashReports: z.boolean().default(true),
  }).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// ============================================================
// Telemetry Event
// ============================================================
export const telemetryEventSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  eventType: z.enum([
    'csv_import_start',
    'csv_import_success',
    'csv_import_error',
    'price_fetch_success',
    'price_fetch_error',
    'watchlist_created',
    'portfolio_created',
    'trade_added',
    'snapshot_exported',
    'page_view',
    'session_start',
  ]),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

// ============================================================
// Migration Metadata
// ============================================================
export const migrationSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  description: z.string(),
  appliedAt: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'rolled_back']),
  affectedCollections: z.array(z.string()),
  backupRef: z.string().optional(), // Reference to backup collection
});

export type Migration = z.infer<typeof migrationSchema>;

// ============================================================
// Quote (API Response)
// ============================================================
export const quoteSchema = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  price: z.number().nullable(),
  change: z.number().nullable().optional(),
  changePct: z.number().nullable().optional(),
  currency: z.string().optional(),
  source: z.string().optional(),
});

export type Quote = z.infer<typeof quoteSchema>;

// ============================================================
// CSV Row (normalized)
// ============================================================
export const csvRowSchema = z.object({
  symbol: z.string(),
  quantity: z.number(),
  price: z.number(),
  timestamp: z.string(), // ISO date string
  type: tradeTypeSchema.optional(),
  fees: z.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

