import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { deleteUser, User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Trade } from './tradeService';

export interface UserData {
  trades: Trade[];
  portfolios?: any[];
  watchlists?: any[];
  preferences?: any[];
  totalTrades: number;
  totalInvested: number;
  totalPositions: number;
  exportDate: string;
  userId: string;
}

export class AccountService {
  // Delete all user data from Firestore
  static async deleteUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete all trades from /trades collection with uid filter
      const tradesQuery = query(
        collection(db, 'trades'),
        where('uid', '==', userId)
      );
      const tradesSnapshot = await getDocs(tradesQuery);
      tradesSnapshot.docs.forEach((tradeDoc) => {
        batch.delete(tradeDoc.ref);
      });

      await batch.commit();
      console.log('User data deleted successfully');
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  // Export all user data
  static async exportUserData(userId: string): Promise<UserData> {
    try {
      // Get all trades from /trades collection with uid filter
      const tradesQuery = query(
        collection(db, 'trades'),
        where('uid', '==', userId)
      );
      const tradesSnapshot = await getDocs(tradesQuery);
      const trades = tradesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      trades.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime; // Descending order
      });

      // Calculate portfolio metrics
      const totalTrades = trades.length;
      const totalInvested = trades.reduce((sum, trade) => {
        return sum + (trade.qty * trade.price);
      }, 0);
      const totalPositions = new Set(trades.map(trade => trade.ticker)).size;

      return {
        trades,
        portfolios: [], // Not used in production structure
        watchlists: [], // Not used in production structure
        preferences: [], // Not used in production structure
        totalTrades,
        totalInvested,
        totalPositions,
        exportDate: new Date().toISOString(),
        userId
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Delete user account completely (auth + data)
  static async deleteAccount(user: User): Promise<void> {
    try {
      const userId = user.uid;
      
      // First delete all user data from Firestore
      await this.deleteUserData(userId);
      
      // Then delete the Firebase Auth user
      await deleteUser(user);
      
      console.log('Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Handle specific Firebase auth errors
      if (error?.code === 'auth/requires-recent-login') {
        throw new Error('Please sign out and sign back in, then try deleting your account again. This is required for security.');
      }
      
      throw error;
    }
  }

  // Generate downloadable JSON file
  static downloadUserData(data: UserData, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `pocket-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Generate downloadable CSV file for trades
  static downloadTradesCSV(trades: Trade[], filename?: string): void {
    if (trades.length === 0) {
      throw new Error('No trades to export');
    }

    const headers = ['Date', 'Ticker', 'Type', 'Currency', 'Quantity', 'Price', 'Mock', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        trade.date,
        trade.ticker,
        trade.type,
        trade.currency,
        trade.qty,
        trade.price,
        trade.mock,
        trade.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `pocket-portfolio-trades-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
