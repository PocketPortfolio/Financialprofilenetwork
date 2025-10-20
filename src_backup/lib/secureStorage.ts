/**
 * Secure local storage wrapper with encryption consideration
 * For now, uses localStorage with namespace isolation
 * Future: Add encryption layer for sensitive data
 */

const APP_PREFIX = 'pp_v1_';

export class SecureStorage {
  private prefix: string;

  constructor(namespace: string) {
    this.prefix = `${APP_PREFIX}${namespace}_`;
  }

  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serialized);
    } catch (err) {
      console.error('SecureStorage.set failed', err);
    }
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch (err) {
      console.error('SecureStorage.get failed', err);
      return defaultValue ?? null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (err) {
      console.error('SecureStorage.remove failed', err);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (err) {
      console.error('SecureStorage.clear failed', err);
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }
}

// Pre-configured instances
export const userPrefsStorage = new SecureStorage('prefs');
export const cacheStorage = new SecureStorage('cache');
export const sessionStorage = new SecureStorage('session');

