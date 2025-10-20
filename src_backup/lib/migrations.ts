/**
 * Firestore migration utilities
 * Supports zero-downtime migrations with dual-read/dual-write strategy
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@services/firebase';
import { migrationSchema, type Migration } from '@types/schemas';

export interface MigrationDefinition {
  id: string;
  version: number;
  description: string;
  affectedCollections: string[];
  up: () => Promise<void>;
  down: () => Promise<void>;
}

/**
 * Register a migration in the migrations collection
 */
export async function registerMigration(migration: Omit<Migration, 'appliedAt'>): Promise<void> {
  const migrationRef = doc(db, 'migrations', migration.id);
  await setDoc(migrationRef, {
    ...migration,
    appliedAt: Timestamp.now(),
  });
}

/**
 * Get all applied migrations
 */
export async function getAppliedMigrations(): Promise<Migration[]> {
  const q = query(collection(db, 'migrations'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => migrationSchema.parse({ id: doc.id, ...doc.data() }));
}

/**
 * Mark migration status
 */
export async function updateMigrationStatus(
  migrationId: string,
  status: Migration['status']
): Promise<void> {
  const migrationRef = doc(db, 'migrations', migrationId);
  await updateDoc(migrationRef, { status, appliedAt: Timestamp.now() });
}

/**
 * Run migration with error handling
 */
export async function runMigration(migration: MigrationDefinition): Promise<void> {
  console.log(`[Migration] Starting ${migration.id}: ${migration.description}`);

  try {
    // Mark as in progress
    await registerMigration({
      id: migration.id,
      version: migration.version,
      description: migration.description,
      status: 'in_progress',
      affectedCollections: migration.affectedCollections,
    });

    // Execute migration
    await migration.up();

    // Mark as completed
    await updateMigrationStatus(migration.id, 'completed');
    console.log(`[Migration] Completed ${migration.id}`);
  } catch (err) {
    console.error(`[Migration] Failed ${migration.id}`, err);
    await updateMigrationStatus(migration.id, 'failed');
    throw err;
  }
}

/**
 * Rollback migration
 */
export async function rollbackMigration(migration: MigrationDefinition): Promise<void> {
  console.log(`[Migration] Rolling back ${migration.id}`);

  try {
    await migration.down();
    await updateMigrationStatus(migration.id, 'rolled_back');
    console.log(`[Migration] Rolled back ${migration.id}`);
  } catch (err) {
    console.error(`[Migration] Rollback failed ${migration.id}`, err);
    throw err;
  }
}

/**
 * Batch update utility for large collections
 */
export async function batchUpdate<T>(
  collectionPath: string,
  transform: (doc: T) => Partial<T>,
  batchSize = 500
): Promise<number> {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);
  
  let batch = writeBatch(db);
  let count = 0;
  let totalUpdated = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data() as T;
    const updates = transform(data);
    
    if (Object.keys(updates).length > 0) {
      batch.update(docSnapshot.ref, updates);
      count++;
      totalUpdated++;

      if (count >= batchSize) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  return totalUpdated;
}

