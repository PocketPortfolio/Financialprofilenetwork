/**
 * Encrypted Sync Configuration
 * 
 * Feature flag to control encrypted sync service.
 * Default: DISABLED (do not enable until fully implemented and tested)
 */

export const ENABLE_ENCRYPTED_SYNC = process.env.ENABLE_ENCRYPTED_SYNC === 'true';

export const SYNC_CONFIG = {
  enabled: ENABLE_ENCRYPTED_SYNC,
  pricing: {
    monthly: 4.00, // $4/month
    currency: 'USD',
  },
  limits: {
    maxDevices: 5,
    maxStorage: 10 * 1024 * 1024, // 10MB
    uploadRateLimit: 10, // requests per minute
    downloadRateLimit: 30, // requests per minute
  },
} as const;









