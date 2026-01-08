import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Ensure strict separation from main app Firebase
if (!process.env.SUPABASE_SALES_DATABASE_URL) {
  throw new Error('SUPABASE_SALES_DATABASE_URL is required for Sales Sidecar');
}

let connectionString = process.env.SUPABASE_SALES_DATABASE_URL;

// Ensure SSL is enabled for Supabase (append if not present)
if (!connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString = `${connectionString}${separator}sslmode=require`;
}

// Check if using Session Pooler (port 6543) - recommended for connection pooling
const isSessionPooler = connectionString.includes(':6543') || connectionString.includes('pgbouncer=true');

// Connection pool configuration
// For Session Pooler: use VERY small max connections (pooler handles pooling, but has strict limits)
// For direct connection: use larger max to handle concurrent requests
// CRITICAL: Session Pooler mode has strict limits - use minimal connections
const maxConnections = isSessionPooler ? 2 : 10; // Reduced from 5 to 2 for Session Pooler

// Supabase requires SSL connections
// Note: Session Pooler (port 6543) is recommended for production to avoid connection limits
const client = postgres(connectionString, { 
  max: maxConnections, // Minimal connections for Session Pooler
  idle_timeout: 10, // Close idle connections faster (reduced from 20)
  connect_timeout: 10, // Connection timeout
  ssl: { rejectUnauthorized: false }, // Supabase uses self-signed certificates
  connection: {
    // Connection-specific settings
    application_name: 'pocket-portfolio-sales-sidecar',
  },
  // Transform to handle connection errors gracefully
  transform: {
    undefined: null,
  },
  // Add connection retry logic
  onnotice: () => {}, // Suppress notices
});

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await client.end();
  });
  process.on('SIGTERM', async () => {
    await client.end();
  });
}

export const db = drizzle(client, { schema });
export type Database = typeof db;





