import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp,
  writeBatch
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
  static async getTrades(userId: string): Promise<Trade[]> {
    try {
      const q = query(
        collection(db, 'trades'), // Using /trades collection to match production
        where('uid', '==', userId) // Filter by uid to match production structure
      );
      
      const querySnapshot = await getDocs(q);
      const trades = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      
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
  static async deleteTrade(userId: string, tradeId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const tradeRef = doc(db, 'trades', tradeId);
      
      // First verify the trade exists and user owns it
      const tradeDoc = await getDoc(tradeRef);
      if (!tradeDoc.exists()) {
        throw new Error('Trade not found');
      }
      
      const tradeData = tradeDoc.data();
      if (tradeData.uid !== userId) {
        throw new Error('Insufficient permissions to delete this trade');
      }
      
      await deleteDoc(tradeRef);
    } catch (error: any) {
      console.error('Error deleting trade:', error);
      
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
  static async updateTrade(userId: string, tradeId: string, updates: Partial<Trade>): Promise<void> {
    try {
      await updateDoc(doc(db, 'trades', tradeId), { // Using /trades collection to match production
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  }

  // Bulk import trades (for CSV import)
  static async importTrades(userId: string, trades: Omit<Trade, 'id' | 'uid' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = [];
      const now = Timestamp.now();
      
      for (const trade of trades) {
        batch.push({
          ...trade,
          uid: userId, // Using uid to match production Firestore rules
          createdAt: now,
          updatedAt: now
        });
      }

      const docRefs = await Promise.all(
        batch.map(trade => addDoc(collection(db, 'trades'), trade)) // Using /trades collection to match production
      );
      
      return docRefs.map(ref => ref.id);
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
