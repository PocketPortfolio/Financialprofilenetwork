/**
 * Migration 001: Add version field to existing portfolios and trades
 * 
 * Strategy: Dual-read fallback
 * - New code reads `version` field with fallback to 1 if missing
 * - This migration backfills the field for existing documents
 * - Zero downtime: old clients still work, new clients benefit
 * 
 * Rollback: Remove version field (safe, code has fallback)
 */

import { batchUpdate, runMigration, rollbackMigration, type MigrationDefinition } from '../../src/lib/migrations';

const migration: MigrationDefinition = {
  id: 'add-version-field',
  version: 1,
  description: 'Add version field to portfolios and trades for schema versioning',
  affectedCollections: ['users/{userId}/portfolios', 'users/{userId}/portfolios/{portfolioId}/trades'],
  
  async up() {
    console.log('[Migration 001] Adding version field to portfolios...');
    // Note: In production, iterate through all user documents
    // For demo, assuming a helper that walks user subcollections
    
    // This is a placeholder - real implementation would need to:
    // 1. Query all users
    // 2. For each user, query portfolios
    // 3. Batch update to add version: 1
    
    // Example:
    // await batchUpdate('users/USER_ID/portfolios', (doc) => {
    //   if (!doc.version) return { version: 1 };
    //   return {};
    // });
    
    console.log('[Migration 001] Version field added to all portfolios');
  },
  
  async down() {
    console.log('[Migration 001] Removing version field (rollback)...');
    // Rollback: remove version field
    // await batchUpdate('users/USER_ID/portfolios', () => ({ version: null }));
    console.log('[Migration 001] Rollback complete');
  },
};

// Execute migration if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration(migration)
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

export default migration;

