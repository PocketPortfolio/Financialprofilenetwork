/**
 * Portfolio Snapshot Service
 * Handles saving and retrieving historical portfolio snapshots
 */

import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { PortfolioSnapshot } from './types';
import type { Position } from '../utils/portfolioCalculations';

const COLLECTION_NAME = 'portfolio_snapshots';
const VERSION = '1.0.0';

/**
 * Save a daily snapshot of the portfolio
 */
export async function saveDailySnapshot(
  userId: string,
  positions: Position[],
  totalValue: number,
  totalInvested: number
): Promise<void> {
  if (!db) {
    // Firestore not available, skip snapshot save
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const snapshotRef = doc(db, COLLECTION_NAME, `${userId}_${today}`);

    // Calculate position allocations
    const positionData = positions.map((pos) => ({
      ticker: pos.ticker,
      shares: pos.shares,
      value: pos.currentValue,
      allocation: totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0,
    }));

    const snapshot: PortfolioSnapshot = {
      userId,
      date: today,
      totalValue,
      totalInvested,
      positions: positionData,
      metadata: {
        timestamp: Date.now(),
        version: VERSION,
      },
    };

    await setDoc(snapshotRef, {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        timestamp: Timestamp.fromMillis(snapshot.metadata.timestamp),
      },
    });
  } catch (error) {
    // Re-throw error for caller to handle
    throw error;
  }
}

/**
 * Get historical portfolio data
 */
export async function getHistoricalData(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<PortfolioSnapshot[]> {
  if (!db) {
    return [];
  }

  try {
    const snapshotsRef = collection(db, COLLECTION_NAME);
    let q = query(
      snapshotsRef,
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    // Add date filters if provided
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    const snapshots: PortfolioSnapshot[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamp back to number
      const timestamp =
        data.metadata?.timestamp?.toMillis?.() || data.metadata?.timestamp || Date.now();

      snapshots.push({
        userId: data.userId,
        date: data.date,
        totalValue: data.totalValue,
        totalInvested: data.totalInvested,
        positions: data.positions || [],
        metadata: {
          timestamp,
          version: data.metadata?.version || VERSION,
        },
      });
    });

    return snapshots;
  } catch (error) {
    // Return empty array on error to prevent UI breakage
    return [];
  }
}

/**
 * Calculate historical returns from snapshots
 */
export function calculateHistoricalReturns(
  snapshots: PortfolioSnapshot[]
): Array<{ date: string; return: number; returnPercent: number }> {
  if (snapshots.length === 0) {
    return [];
  }

  const firstSnapshot = snapshots[0];
  const firstValue = firstSnapshot.totalInvested || firstSnapshot.totalValue;

  return snapshots.map((snapshot) => {
    const currentValue = snapshot.totalValue;
    const returnAmount = currentValue - firstValue;
    const returnPercent = firstValue > 0 ? (returnAmount / firstValue) * 100 : 0;

    return {
      date: snapshot.date,
      return: returnAmount,
      returnPercent,
    };
  });
}

/**
 * Get the most recent snapshot
 */
export async function getLatestSnapshot(
  userId: string
): Promise<PortfolioSnapshot | null> {
  if (!db) {
    return null;
  }

  try {
    const snapshotsRef = collection(db, COLLECTION_NAME);
    const q = query(
      snapshotsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const timestamp =
      data.metadata?.timestamp?.toMillis?.() || data.metadata?.timestamp || Date.now();

    return {
      userId: data.userId,
      date: data.date,
      totalValue: data.totalValue,
      totalInvested: data.totalInvested,
      positions: data.positions || [],
      metadata: {
        timestamp,
        version: data.metadata?.version || VERSION,
      },
    };
  } catch (error) {
    // Return null on error
    return null;
  }
}

