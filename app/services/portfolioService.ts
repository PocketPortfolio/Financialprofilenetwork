import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Portfolio {
  id: string;
  uid: string;
  name: string;
  broker: string;
  description?: string;
  currency: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isDefault: boolean;
}

export interface Trade {
  id: string;
  uid: string;
  portfolioId: string; // Link to portfolio
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

export class PortfolioService {
  // Create a new portfolio
  static async createPortfolio(userId: string, portfolioData: Omit<Portfolio, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const portfolioDoc = {
        ...portfolioData,
        uid: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'portfolios'), portfolioDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  // Get all portfolios for a user
  static async getPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const q = query(
        collection(db, 'portfolios'),
        where('uid', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const portfolios = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Portfolio[];
      
      return portfolios.sort((a, b) => {
        // Default portfolio first, then by creation date
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting portfolios:', error);
      throw error;
    }
  }

  // Get a specific portfolio
  static async getPortfolio(userId: string, portfolioId: string): Promise<Portfolio | null> {
    try {
      const q = query(
        collection(db, 'portfolios'),
        where('uid', '==', userId),
        where('__name__', '==', portfolioId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Portfolio;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      throw error;
    }
  }

  // Update a portfolio
  static async updatePortfolio(userId: string, portfolioId: string, updates: Partial<Portfolio>): Promise<void> {
    try {
      await updateDoc(doc(db, 'portfolios', portfolioId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  // Delete a portfolio
  static async deletePortfolio(userId: string, portfolioId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'portfolios', portfolioId));
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // Set default portfolio
  static async setDefaultPortfolio(userId: string, portfolioId: string): Promise<void> {
    try {
      // First, unset all other portfolios as default
      const portfolios = await this.getPortfolios(userId);
      const updatePromises = portfolios
        .filter(p => p.id !== portfolioId)
        .map(p => this.updatePortfolio(userId, p.id, { isDefault: false }));
      
      await Promise.all(updatePromises);
      
      // Set the selected portfolio as default
      await this.updatePortfolio(userId, portfolioId, { isDefault: true });
    } catch (error) {
      console.error('Error setting default portfolio:', error);
      throw error;
    }
  }
}

export class TradeService {
  // Add a new trade to a specific portfolio
  static async addTrade(userId: string, portfolioId: string, tradeData: Omit<Trade, 'id' | 'uid' | 'portfolioId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tradeDoc = {
        ...tradeData,
        uid: userId,
        portfolioId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'trades'), tradeDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  }

  // Get all trades for a specific portfolio
  static async getTrades(userId: string, portfolioId: string): Promise<Trade[]> {
    try {
      const q = query(
        collection(db, 'trades'),
        where('uid', '==', userId),
        where('portfolioId', '==', portfolioId)
      );
      
      const querySnapshot = await getDocs(q);
      const trades = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      
      return trades.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  }

  // Get all trades for a user (across all portfolios)
  static async getAllTrades(userId: string): Promise<Trade[]> {
    try {
      const q = query(
        collection(db, 'trades'),
        where('uid', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const trades = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      
      return trades.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting all trades:', error);
      throw error;
    }
  }

  // Delete a trade
  static async deleteTrade(userId: string, tradeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'trades', tradeId));
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  }

  // Update a trade
  static async updateTrade(userId: string, tradeId: string, updates: Partial<Trade>): Promise<void> {
    try {
      await updateDoc(doc(db, 'trades', tradeId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  }

  // Bulk import trades to a specific portfolio
  static async importTrades(userId: string, portfolioId: string, trades: Omit<Trade, 'id' | 'uid' | 'portfolioId' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> {
    try {
      const batch = [];
      const now = Timestamp.now();
      
      for (const trade of trades) {
        batch.push({
          ...trade,
          uid: userId,
          portfolioId,
          createdAt: now,
          updatedAt: now
        });
      }

      const docRefs = await Promise.all(
        batch.map(trade => addDoc(collection(db, 'trades'), trade))
      );
      
      return docRefs.map(ref => ref.id);
    } catch (error) {
      console.error('Error importing trades:', error);
      throw error;
    }
  }
}
