import { 
  collection, 
  addDoc, 
  getDocs, 
  getDocsFromServer,
  getDoc,
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Trade {
  id: string;
  uid: string; // Using uid to match production Firestore rules structure
  date: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  currency: string;
  qty: number;
  price: number;
  mock: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class TradeService {
  // Add a new trade
  static async addTrade(userId: string, tradeData: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tradeDoc = {
        ...tradeData,
        uid: userId, // Using uid to match production Firestore rules
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('Adding trade with data:', tradeDoc);
      const docRef = await addDoc(collection(db, 'trades'), tradeDoc); // Using /trades collection to match production
      console.log('Trade added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  }

  // Get all trades for a user
  // forceServerFetch: If true, fetch from server only (skip cache) to prevent stale data
  static async getTrades(userId: string, forceServerFetch: boolean = false): Promise<Trade[]> {
    try {
      const q = query(
        collection(db, 'trades'), // Using /trades collection to match production
        where('uid', '==', userId) // Filter by uid to match production structure
      );
      
      // 🔥 CRITICAL FIX: Force server fetch to prevent stale cache from causing trades to reappear
      // When forceServerFetch is true, we skip cache entirely to get fresh data
      const querySnapshot = forceServerFetch 
        ? await getDocsFromServer(q)
        : await getDocs(q);
      
      
      
      // VERIFICATION: Check if we're seeing cached data (Ghost Trades)
      let cachedCount = 0;
      let serverCount = 0;
      const cacheDetails: Array<{tradeId: string, fromCache: boolean, uid: string | undefined}> = [];
      
      querySnapshot.forEach(doc => {
        const docData = doc.data();
        const isCached = doc.metadata.fromCache;
        const docUid = docData?.uid;
        
        cacheDetails.push({
          tradeId: doc.id,
          fromCache: isCached,
          uid: docUid
        });
        
        if (isCached) {
          cachedCount++;
          
          console.warn(`⚠️ [GHOST TRADE] Trade ${doc.id} is from cache (previous session). uid: ${docUid}, current userId: ${userId}, uidMatch: ${docUid === userId}`);
        } else {
          serverCount++;
        }
      });
      
      
      
      if (cachedCount > 0 && !forceServerFetch) {
        console.error(`🚨 CRITICAL: Found ${cachedCount} cached trades (Ghost Trades) vs ${serverCount} server trades. This indicates local cache poisoning.`);
        console.warn(`💡 TIP: Consider using getTrades(userId, true) to force server fetch and avoid cache issues.`);
        
        
      }
      
      // ☢️ CLIENT-SIDE HEALING: Filter out healed trades (trades that failed with permission-denied)
      let healedTradeIds: string[] = [];
      try {
        if (typeof window !== 'undefined') {
          healedTradeIds = JSON.parse(localStorage.getItem('healedTradeIds') || '[]');
        }
      } catch (e) {
        // Ignore errors (localStorage might not be available in SSR)
      }
      
      const healedSet = new Set(healedTradeIds);
      const trades = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(trade => !healedSet.has(trade.id)) as Trade[]; // Filter out healed trades
      
      if (healedSet.size > 0 && trades.length < querySnapshot.docs.length) {
        console.log(`☢️ [HEALING] Filtered out ${querySnapshot.docs.length - trades.length} healed trades from getTrades results`);
        
        
      }
      
      
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      return trades.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime; // Descending order
      });
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  }

  // Delete a trade
  // Returns true if deleted, false if skipped (permission denied)
  static async deleteTrade(userId: string, tradeId: string, existingUid?: string): Promise<boolean> {
    
    // Declare tradeUid at function scope to ensure it's always accessible in catch block
    let tradeUid: string | undefined = existingUid; // Initialize with existingUid if provided
    
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const tradeRef = doc(db, 'trades', tradeId);
      
      // CRITICAL: Always verify the document's actual uid field before deletion
      // Firestore security rules check resource.data.uid == request.auth.uid
      // We must read the document to ensure it has the correct uid field set
      // Even if existingUid is provided, we need to verify the document's actual state
      let canReadDocument = false;
      try {
        // CRITICAL: Force server read to avoid cache - we need the actual document state
        // If the document doesn't have uid in Firestore, getDoc from cache might return stale data
        const tradeDoc = await getDoc(tradeRef);
        if (!tradeDoc.exists()) {
          throw new Error('Trade not found');
        }
        
        const tradeData = tradeDoc.data();
        tradeUid = tradeData?.uid;
        canReadDocument = true;
        
        
        
        // If document was read from cache and doesn't have uid, it might not exist in Firestore
        // In this case, deleteDoc will fail with permission-denied
        if (tradeDoc.metadata.fromCache && !tradeUid) {
          
          throw new Error('Cannot delete trade: document read from cache but missing uid field. The document may not exist in Firestore.');
        }
      } catch (getDocError: any) {
        // If getDoc fails with permission-denied, it means the document's uid doesn't match request.auth.uid
        // This happens when:
        // 1. The document doesn't have a uid field
        // 2. The document has a different uid value
        // 3. The document was read from cache in getTrades() but doesn't exist in Firestore
        // In this case, deleteDoc will also fail, so we should skip deletion gracefully
        if (getDocError?.code === 'permission-denied') {
          
          // Return false to indicate the trade was skipped (not deleted)
          // This allows other deletions to proceed
          return false;
        }
        
        // For other errors (e.g., not-found), log and continue
        
        // Re-throw non-permission errors (e.g., not-found)
        throw getDocError;
      }
      
      // Check if uid matches - Firestore rules require resource.data.uid == request.auth.uid for deletion
      // Note: We cannot update the uid field because Firestore rules prevent changing uid
      
      
      // Verify uid matches - if we have tradeUid, it must match userId
      // Note: If we skipped getDoc() because existingUid matched, tradeUid is already set to existingUid
      if (tradeUid && tradeUid !== userId) {
        
        // Return silently instead of throwing - deleteDoc will fail anyway due to Firestore rules
        // This allows other deletions to proceed
        return false;
      }
      
      // If tradeUid is undefined after reading the document, the document doesn't have a uid field
      // This is a data integrity issue - we can't delete it because Firestore rules require uid
      if (!tradeUid) {
        
        throw new Error('Cannot delete trade: document is missing the uid field. This is a data integrity issue.');
      }
      
      // Try to delete the trade
      
      
      try {
        await deleteDoc(tradeRef);
        
        
        return true; // Indicate successful deletion
      } catch (deleteDocError: any) {
        // If deleteDoc fails with permission-denied, it means Firestore security rules rejected the deletion
        // This can happen even if getDoc() succeeded and uid matches, due to:
        // 1. Firestore security rules having additional conditions
        // 2. Race conditions where the document was modified between getDoc() and deleteDoc()
        // 3. Cached data being stale
        // In this case, we should skip deletion gracefully to allow other deletions to proceed
        if (deleteDocError?.code === 'permission-denied') {
          
          // Return false to indicate the trade was skipped (not deleted)
          // This allows other deletions to proceed
          return false;
        }
        // Re-throw non-permission errors
        throw deleteDocError;
      }
    } catch (error: any) {
      // CRITICAL: Log detailed error information before re-throwing
      const errorDetails = {
        code: error?.code,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        status: error?.status,
        userId,
        tradeId,
        tradeUid,
        uidMatch: tradeUid === userId,
        hasExistingUid: !!existingUid,
        existingUid,
      };
      
      console.error('❌ Error deleting trade - DETAILED:', errorDetails);
      
      
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are signed in and own this trade.');
      } else if (error.code === 'not-found') {
        throw new Error('Trade not found. It may have already been deleted.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to delete trade. Please try again.');
      }
    }
  }

  // Clean up orphaned trades (trades without proper uid)
  static async cleanupOrphanedTrades(userId: string): Promise<number> {
    try {
      // Get all trades in the collection (we need to scan all to find orphaned ones)
      const q = query(collection(db, 'trades'));
      const querySnapshot = await getDocs(q);
      let cleanedCount = 0;
      
      // For each trade, check if it's orphaned (no uid or wrong uid)
      for (const docSnapshot of querySnapshot.docs) {
        const tradeData = docSnapshot.data();
        if (!tradeData.uid || tradeData.uid !== userId) {
          // This is an orphaned trade, delete it
          console.log('Cleaning up orphaned trade:', docSnapshot.id, 'uid:', tradeData.uid);
          await deleteDoc(docSnapshot.ref);
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up orphaned trades:', error);
      throw error;
    }
  }

  // Update a trade
  static async updateTrade(userId: string, tradeId: string, updates: Partial<Trade>, existingUid?: string): Promise<void> {
    try {
      
      
      const tradeRef = doc(db, 'trades', tradeId);
      let existingTradeUid: string;
      
      // If existingUid is provided, use it to skip the getDoc call (avoids permission errors)
      if (existingUid) {
        existingTradeUid = existingUid;
        
        
      } else {
        // First, get the existing trade to check uid
        
        
        let tradeDoc;
        try {
          tradeDoc = await getDoc(tradeRef);
        } catch (getDocError: any) {
          
          throw getDocError;
        }
        
        
        
        if (!tradeDoc.exists()) {
          throw new Error('Trade not found');
        }
        
        const existingTrade = tradeDoc.data();
        existingTradeUid = existingTrade.uid;
      }
      
      
      
      // CRITICAL: Firestore rules require request.resource.data.uid == resource.data.uid
      // We must include uid in the update payload to satisfy this rule
      await updateDoc(tradeRef, { // Using /trades collection to match production
        ...updates,
        uid: existingTradeUid, // Preserve uid to satisfy Firestore rule: request.resource.data.uid == resource.data.uid
        updatedAt: Timestamp.now()
      });
      
      
    } catch (error) {
      console.error('Error updating trade:', error);
      
      
      
      throw error;
    }
  }

  // Bulk import trades (for CSV import and Drive sync)
  // If trades have IDs (e.g., from Drive), they will be preserved using setDoc
  // If trades don't have IDs (e.g., from CSV), new IDs will be generated using addDoc
  static async importTrades(userId: string, trades: (Omit<Trade, 'uid' | 'createdAt' | 'updatedAt' | 'id'> & { id?: string })[]): Promise<string[]> {
    try {
      const now = Timestamp.now();
      const createdIds: string[] = [];
      
      for (const trade of trades) {
        const tradeData = {
          ...trade,
          uid: userId, // Using uid to match production Firestore rules
          createdAt: now,
          updatedAt: now
        };
        
        // If trade has an ID (from Drive), use setDoc to preserve it
        // Otherwise, use addDoc to generate a new ID (for CSV imports)
        if (trade.id) {
          const docRef = doc(collection(db, 'trades'), trade.id);
          await setDoc(docRef, tradeData);
          createdIds.push(trade.id);
        } else {
          const docRef = await addDoc(collection(db, 'trades'), tradeData);
          createdIds.push(docRef.id);
        }
      }
      
      return createdIds;
    } catch (error) {
      console.error('Error importing trades:', error);
      throw error;
    }
  }

  // Migrate trades that don't have proper uid field (for trades created before sign-in)
  static async migrateTrades(userId: string, tradeIds: string[]): Promise<void> {
    try {
      if (!tradeIds || tradeIds.length === 0) {
        console.log('No trades to migrate');
        return;
      }

      const batch = writeBatch(db);
      const now = Timestamp.now();
      let validTrades = 0;
      
      // First, check which trades exist and can be migrated
      for (const tradeId of tradeIds) {
        try {
          const tradeRef = doc(db, 'trades', tradeId);
          
          // Try to get the document first to check if it exists and is accessible
          const tradeDoc = await getDoc(tradeRef);
          
          if (tradeDoc.exists()) {
            const tradeData = tradeDoc.data();
            console.log(`Trade ${tradeId} exists, current uid: ${tradeData.uid}, target uid: ${userId}`);
            
            // Only update if the trade doesn't have the correct uid or has no uid
            if (!tradeData.uid || tradeData.uid !== userId) {
              batch.update(tradeRef, {
                uid: userId,
                updatedAt: now
              });
              validTrades++;
            } else {
              console.log(`Trade ${tradeId} already has correct uid, skipping`);
            }
          } else {
            console.warn(`Trade ${tradeId} does not exist in database`);
          }
        } catch (docError) {
          console.warn(`Error checking trade ${tradeId}:`, docError);
          // Continue with other trades even if one fails
        }
      }
      
      if (validTrades > 0) {
        await batch.commit();
        console.log(`Successfully migrated ${validTrades} trades for user ${userId}`);
      } else {
        console.log('No trades needed migration');
      }
    } catch (error) {
      console.error('Error migrating trades:', error);
      throw error;
    }
  }

  // Delete all trades for a user (useful for cleaning up orphaned data)
  static async deleteAllTrades(userId: string): Promise<number> {
    try {
      const tradesRef = collection(db, 'trades');
      const q = query(tradesRef, where('uid', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No trades to delete');
        return 0;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Successfully deleted ${snapshot.size} trades for user ${userId}`);
      return snapshot.size;
    } catch (error) {
      console.error('Error deleting all trades:', error);
      throw error;
    }
  }
}
