import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy initialization to avoid build-time errors
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;
let _initError: Error | null = null;

function getClient() {
  if (_client) return _client;
  
  // If we've already tried and failed, throw the cached error
  if (_initError) {
    throw _initError;
  }
  
  try {
    // Ensure strict separation from main app Firebase
    if (!process.env.SUPABASE_SALES_DATABASE_URL) {
      const error = new Error('SUPABASE_SALES_DATABASE_URL is required for Sales Sidecar. Check your .env.local file.');
      _initError = error;
      console.error('[DB_CLIENT] Missing SUPABASE_SALES_DATABASE_URL environment variable');
      throw error;
    }

    let connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    console.log('[DB_CLIENT] Initializing database client...');
    console.log('[DB_CLIENT] Connection string source:', connectionString ? 'Found' : 'Missing');
    console.log('[DB_CLIENT] Connection string length:', connectionString?.length || 0);
    console.log('[DB_CLIENT] Using port:', connectionString?.includes(':6543') ? '6543 (Session Pooler)' : connectionString?.includes(':5432') ? '5432 (Transaction Pooler)' : 'Unknown');
    console.log('[DB_CLIENT] Has pgbouncer:', connectionString?.includes('pgbouncer=true') ? 'Yes' : 'No');
    console.log('[DB_CLIENT] Has sslmode:', connectionString?.includes('sslmode=') ? 'Yes' : 'No');
    console.log('[DB_CLIENT] Connection string preview:', connectionString ? connectionString.substring(0, 80) + '...' : 'N/A');
    
    // Validate connection string format (should not include variable name)
    if (connectionString.includes('SUPABASE_SALES_DATABASE_URL=')) {
      const error = new Error('Invalid SUPABASE_SALES_DATABASE_URL format - contains variable name. Check Vercel environment variable configuration. The value should be only the connection string, not "SUPABASE_SALES_DATABASE_URL=..."');
      _initError = error;
      throw error;
    }

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
    _client = postgres(connectionString, { 
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
        await _client?.end();
      });
      process.on('SIGTERM', async () => {
        await _client?.end();
      });
    }

    return _client;
  } catch (error: any) {
    // Cache the error so we don't keep trying
    _initError = error;
    // Provide more helpful error message
    if (error.message?.includes('SUPABASE_SALES_DATABASE_URL')) {
      throw error;
    }
    throw new Error(`Database initialization failed: ${error.message || 'Unknown error'}. Check your SUPABASE_SALES_DATABASE_URL in .env.local`);
  }
}

function getDb() {
  if (!_db) {
    try {
      _db = drizzle(getClient(), { schema });
    } catch (error: any) {
      // Re-throw with context
      throw new Error(`Failed to initialize database client: ${error.message || 'Unknown error'}`);
    }
  }
  return _db;
}

// Lazy proxy to delay initialization until first use
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    // Don't initialize in browser
    if (typeof window !== 'undefined') {
      throw new Error('Database client cannot be used in browser environment');
    }
    try {
      return (getDb() as any)[prop];
    } catch (error: any) {
      // Wrap errors to provide better context
      throw new Error(`Database operation failed: ${error.message || 'Unknown error'}`);
    }
  }
});

export type Database = typeof db;
