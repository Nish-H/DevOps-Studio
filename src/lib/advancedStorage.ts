// Advanced Storage Solution
// Uses IndexedDB for larger storage capacity when localStorage is full

import { ScreenshotData } from './screenshotManager'

interface StorageAdapter {
  name: string
  available: boolean
  capacity: string
  save(key: string, data: any): Promise<boolean>
  load(key: string): Promise<any>
  remove(key: string): Promise<boolean>
  clear(): Promise<boolean>
  getUsage(): Promise<number>
}

class LocalStorageAdapter implements StorageAdapter {
  name = 'localStorage'
  available = typeof Storage !== 'undefined'
  capacity = '5-10MB (browser limit)'

  async save(key: string, data: any): Promise<boolean> {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.warn('localStorage save failed:', error)
      return false
    }
  }

  async load(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('localStorage load failed:', error)
      return null
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('localStorage remove failed:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('localStorage clear failed:', error)
      return false
    }
  }

  async getUsage(): Promise<number> {
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    return totalSize
  }
}

class IndexedDBAdapter implements StorageAdapter {
  name = 'IndexedDB'
  available = typeof indexedDB !== 'undefined'
  capacity = '50MB+ (much larger)'
  private dbName = 'NishenWorkspaceDB'
  private version = 1
  private db: IDBDatabase | null = null

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('screenshots')) {
          const store = db.createObjectStore('screenshots', { keyPath: 'key' })
          store.createIndex('section', 'section', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async save(key: string, data: any): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readwrite')
      const store = transaction.objectStore('screenshots')
      
      const record = {
        key,
        data,
        section: key.split('-')[2] || 'unknown',
        timestamp: Date.now()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(record)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.warn('IndexedDB save failed:', error)
      return false
    }
  }

  async load(key: string): Promise<any> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readonly')
      const store = transaction.objectStore('screenshots')

      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.data : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB load failed:', error)
      return null
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readwrite')
      const store = transaction.objectStore('screenshots')

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.warn('IndexedDB remove failed:', error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readwrite')
      const store = transaction.objectStore('screenshots')

      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      return true
    } catch (error) {
      console.warn('IndexedDB clear failed:', error)
      return false
    }
  }

  async getUsage(): Promise<number> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readonly')
      const store = transaction.objectStore('screenshots')

      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const records = request.result
          const totalSize = records.reduce((size, record) => {
            return size + JSON.stringify(record.data).length
          }, 0)
          resolve(totalSize)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB usage calculation failed:', error)
      return 0
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.openDB()
      const transaction = db.transaction(['screenshots'], 'readonly')
      const store = transaction.objectStore('screenshots')

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys()
        request.onsuccess = () => resolve(request.result as string[])
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.warn('IndexedDB getAllKeys failed:', error)
      return []
    }
  }
}

export class AdvancedStorageManager {
  private static instance: AdvancedStorageManager
  private adapters: StorageAdapter[]
  private primaryAdapter: StorageAdapter
  private fallbackAdapter: StorageAdapter

  private constructor() {
    this.adapters = [
      new LocalStorageAdapter(),
      new IndexedDBAdapter()
    ]

    // Use localStorage as primary, IndexedDB as fallback
    this.primaryAdapter = this.adapters[0]
    this.fallbackAdapter = this.adapters[1]
  }

  static getInstance(): AdvancedStorageManager {
    if (!AdvancedStorageManager.instance) {
      AdvancedStorageManager.instance = new AdvancedStorageManager()
    }
    return AdvancedStorageManager.instance
  }

  async saveScreenshots(key: string, screenshots: ScreenshotData[]): Promise<boolean> {
    // Try primary storage first
    const primarySuccess = await this.primaryAdapter.save(key, screenshots)
    if (primarySuccess) {
      console.log(`✅ Saved to ${this.primaryAdapter.name}:`, key)
      return true
    }

    // Fall back to secondary storage
    if (this.fallbackAdapter.available) {
      const fallbackSuccess = await this.fallbackAdapter.save(key, screenshots)
      if (fallbackSuccess) {
        console.log(`✅ Saved to ${this.fallbackAdapter.name} (fallback):`, key)
        // Remove from primary to free space
        await this.primaryAdapter.remove(key)
        return true
      }
    }

    console.error('❌ Failed to save to any storage adapter')
    return false
  }

  async loadScreenshots(key: string): Promise<ScreenshotData[]> {
    // Try primary storage first
    let data = await this.primaryAdapter.load(key)
    if (data && Array.isArray(data)) {
      return data
    }

    // Try fallback storage
    if (this.fallbackAdapter.available) {
      data = await this.fallbackAdapter.load(key)
      if (data && Array.isArray(data)) {
        console.log(`📦 Loaded from ${this.fallbackAdapter.name}:`, key)
        return data
      }
    }

    return []
  }

  async removeScreenshots(key: string): Promise<boolean> {
    const primaryRemoved = await this.primaryAdapter.remove(key)
    const fallbackRemoved = await this.fallbackAdapter.remove(key)
    return primaryRemoved || fallbackRemoved
  }

  async getStorageInfo(): Promise<{
    primary: { name: string; available: boolean; capacity: string; usage: number }
    fallback: { name: string; available: boolean; capacity: string; usage: number }
    recommendation: string
  }> {
    const primaryUsage = await this.primaryAdapter.getUsage()
    const fallbackUsage = this.fallbackAdapter.available ? await this.fallbackAdapter.getUsage() : 0

    let recommendation = 'Using localStorage (primary storage)'
    
    if (primaryUsage > 4 * 1024 * 1024) { // > 4MB
      recommendation = 'Consider using IndexedDB for more screenshot storage'
    }

    return {
      primary: {
        name: this.primaryAdapter.name,
        available: this.primaryAdapter.available,
        capacity: this.primaryAdapter.capacity,
        usage: primaryUsage
      },
      fallback: {
        name: this.fallbackAdapter.name,
        available: this.fallbackAdapter.available,
        capacity: this.fallbackAdapter.capacity,
        usage: fallbackUsage
      },
      recommendation
    }
  }

  // Migrate data from localStorage to IndexedDB to free up space
  async migrateToIndexedDB(): Promise<{ migrated: number; errors: number }> {
    const result = { migrated: 0, errors: 0 }

    if (!this.fallbackAdapter.available) {
      console.warn('IndexedDB not available for migration')
      return result
    }

    const screenshotKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('nishen-workspace-screenshots-')
    )

    for (const key of screenshotKeys) {
      try {
        const data = await this.primaryAdapter.load(key)
        if (data) {
          const success = await this.fallbackAdapter.save(key, data)
          if (success) {
            await this.primaryAdapter.remove(key)
            result.migrated++
            console.log(`📦 Migrated ${key} to IndexedDB`)
          } else {
            result.errors++
          }
        }
      } catch (error) {
        console.error(`Migration failed for ${key}:`, error)
        result.errors++
      }
    }

    return result
  }
}

export default AdvancedStorageManager.getInstance()