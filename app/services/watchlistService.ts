import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WatchlistItem {
  id?: string;
  symbol: string;
  name: string;
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class WatchlistService {
  // Get all watchlist items for a user
  static async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const watchlistQuery = query(
        collection(db, 'watchlist'),
        where('uid', '==', userId)
      );
      
      const snapshot = await getDocs(watchlistQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WatchlistItem[];
      
      // Sort by createdAt in descending order (newest first)
      return items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are signed in.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch watchlist. Please try again.');
      }
    }
  }

  // Add item to watchlist
  static async addToWatchlist(userId: string, symbol: string, name: string): Promise<void> {
    try {
      // Check if item already exists
      const existingQuery = query(
        collection(db, 'watchlist'),
        where('uid', '==', userId),
        where('symbol', '==', symbol.toUpperCase())
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      if (!existingSnapshot.empty) {
        throw new Error(`${symbol.toUpperCase()} is already in your watchlist`);
      }

      await addDoc(collection(db, 'watchlist'), {
        symbol: symbol.toUpperCase(),
        name,
        uid: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove item from watchlist
  static async removeFromWatchlist(userId: string, watchlistItemId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const watchlistRef = doc(db, 'watchlist', watchlistItemId);
      
      // First verify the item exists and user owns it
      const itemDoc = await getDoc(watchlistRef);
      if (!itemDoc.exists()) {
        throw new Error('Watchlist item not found');
      }
      
      const itemData = itemDoc.data();
      if (itemData.uid !== userId) {
        throw new Error('Insufficient permissions to remove this watchlist item');
      }
      
      await deleteDoc(watchlistRef);
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are signed in and own this item.');
      } else if (error.code === 'not-found') {
        throw new Error('Watchlist item not found. It may have already been removed.');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to remove watchlist item. Please try again.');
      }
    }
  }
}
