import type { BrokerAdapter, BrokerId } from './adapters/types';
export declare const ADAPTERS: BrokerAdapter[];
export declare function detectBroker(sampleCsvHead: string): BrokerId | 'unknown';
