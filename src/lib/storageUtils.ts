/**
 * STORAGE UTILITY - BULLETPROOF BROWSER COMPATIBILITY
 * Handles all localStorage operations safely across SSR/CSR/Electron
 * 
 * CRITICAL: Prevents storage failures in all environments
 * Created: Storage Configuration Audit - July 13, 2025
 */

/**
 * Check if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR environment
  }

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    // Safari private mode, storage quota exceeded, etc.
    console.warn('localStorage not available:', e);
    return false;
  }
}

/**
 * Safe localStorage.getItem with fallback
 */
export function safeGetItem(key: string, fallback: any = null): any {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return fallback;
  }
}

/**
 * Safe localStorage.setItem with error handling
 */
export function safeSetItem(key: string, value: any): boolean {
  if (!isStorageAvailable()) {
    console.warn(`Cannot save "${key}" - localStorage unavailable`);
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    
    // Check if we're approaching storage quota
    const size = new Blob([serialized]).size;
    if (size > 5 * 1024 * 1024) { // 5MB warning
      console.warn(`Large storage operation: ${key} is ${Math.round(size / 1024)}KB`);
    }
    
    localStorage.setItem(key, serialized);
    
    // Verify the write succeeded
    const verification = localStorage.getItem(key);
    if (verification !== serialized) {
      console.error(`Storage verification failed for "${key}"`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to save localStorage item "${key}":`, error);
    
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded! Consider cleaning up old data.');
      // Could trigger cleanup here
    }
    
    return false;
  }
}

/**
 * Safe localStorage.removeItem
 */
export function safeRemoveItem(key: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  used: number;
  available: number;
  percentage: number;
  keys: number;
} {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0, keys: 0 };
  }

  let used = 0;
  let keys = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      used += key.length + (value?.length || 0);
      keys++;
    }
  }

  // Typical localStorage quota is ~5-10MB per origin
  const estimatedQuota = 10 * 1024 * 1024; // 10MB
  const available = estimatedQuota - used;
  const percentage = Math.round((used / estimatedQuota) * 100);

  return { used, available, percentage, keys };
}

/**
 * Enhanced storage wrapper with automatic retries and fallbacks
 */
export class SafeStorage {
  private storageKey: string;
  private retryAttempts: number = 3;
  private retryDelay: number = 100; // ms

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  async load<T>(defaultValue: T): Promise<T> {
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      const result = safeGetItem(this.storageKey, defaultValue);
      if (result !== null) {
        return result;
      }
      
      if (attempt < this.retryAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    
    return defaultValue;
  }

  async save<T>(data: T): Promise<boolean> {
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      const success = safeSetItem(this.storageKey, data);
      if (success) {
        return true;
      }
      
      if (attempt < this.retryAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        console.warn(`Retry ${attempt + 1}/${this.retryAttempts} for ${this.storageKey}`);
      }
    }
    
    console.error(`Failed to save ${this.storageKey} after ${this.retryAttempts} attempts`);
    return false;
  }

  remove(): boolean {
    return safeRemoveItem(this.storageKey);
  }
}

/**
 * Hook for React components to use safe storage
 */
export function useSafeStorage(key: string) {
  const storage = new SafeStorage(key);
  
  return {
    load: storage.load.bind(storage),
    save: storage.save.bind(storage),
    remove: storage.remove.bind(storage),
    isAvailable: isStorageAvailable(),
    stats: getStorageStats()
  };
}

// Global error handler for unhandled storage errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error?.name === 'QuotaExceededError') {
      console.error('🚨 Storage quota exceeded globally!');
      console.error('Current usage:', getStorageStats());
    }
  });
}

export default {
  isAvailable: isStorageAvailable,
  get: safeGetItem,
  set: safeSetItem,
  remove: safeRemoveItem,
  stats: getStorageStats,
  SafeStorage,
  useSafeStorage
};