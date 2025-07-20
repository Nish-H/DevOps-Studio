/**
 * Universal Data Manager for Nishen's AI Workspace
 * Handles localStorage data migration and ensures new demo data is always available
 * 
 * Version: 1.0.0
 * Created: July 12, 2025
 * Purpose: Fix localStorage override issue where new demo data doesn't appear for existing users
 */

export interface DataMigrationConfig<T> {
  storageKey: string
  version: string
  demoData: T[]
  mergeStrategy: 'replace' | 'merge' | 'append'
  uniqueKey: string // Key to identify unique items (e.g., 'id', 'title')
  shouldMigrate?: (savedData: T[], demoData: T[]) => boolean
}

export interface VersionedData<T> {
  version: string
  lastUpdated: string
  data: T[]
}

/**
 * Universal data manager that handles localStorage with version control
 * Ensures new demo data is always merged with existing user data
 */
export class DataManager<T> {
  private config: DataMigrationConfig<T>

  constructor(config: DataMigrationConfig<T>) {
    this.config = config
  }

  /**
   * Load data with automatic migration and demo data merging
   */
  loadData(): T[] {
    try {
      const saved = localStorage.getItem(this.config.storageKey)
      
      if (!saved) {
        // No saved data, use demo data
        this.saveData(this.config.demoData)
        return this.config.demoData
      }

      const parsedData: VersionedData<T> = JSON.parse(saved)
      
      // Check if version migration is needed
      if (parsedData.version !== this.config.version || this.shouldForceUpdate(parsedData)) {
        return this.migrateData(parsedData.data)
      }

      return parsedData.data
    } catch (error) {
      console.error(`Error loading data for ${this.config.storageKey}:`, error)
      // Fallback to demo data on error
      return this.config.demoData
    }
  }

  /**
   * Save data with version information
   */
  saveData(data: T[]): void {
    try {
      const versionedData: VersionedData<T> = {
        version: this.config.version,
        lastUpdated: new Date().toISOString(),
        data
      }
      localStorage.setItem(this.config.storageKey, JSON.stringify(versionedData))
    } catch (error) {
      console.error(`Error saving data for ${this.config.storageKey}:`, error)
    }
  }

  /**
   * Migrate existing data by merging with new demo data
   */
  private migrateData(existingData: T[]): T[] {
    let mergedData: T[] = []

    switch (this.config.mergeStrategy) {
      case 'replace':
        mergedData = this.config.demoData
        break
        
      case 'merge':
        mergedData = this.mergeDataArrays(existingData, this.config.demoData)
        break
        
      case 'append':
        mergedData = [...existingData, ...this.config.demoData]
        break
    }

    // Save migrated data
    this.saveData(mergedData)
    return mergedData
  }

  /**
   * Intelligently merge arrays, avoiding duplicates based on unique key
   */
  private mergeDataArrays(existing: T[], demo: T[]): T[] {
    const merged = [...existing]
    const existingKeys = new Set(existing.map(item => (item as any)[this.config.uniqueKey]))

    for (const demoItem of demo) {
      const demoKey = (demoItem as any)[this.config.uniqueKey]
      if (!existingKeys.has(demoKey)) {
        merged.push(demoItem)
      }
    }

    return merged
  }

  /**
   * Check if forced update is needed based on custom logic
   */
  private shouldForceUpdate(savedData: VersionedData<T>): boolean {
    if (this.config.shouldMigrate) {
      return this.config.shouldMigrate(savedData.data, this.config.demoData)
    }
    return false
  }

  /**
   * Force refresh data with latest demo data (useful for development)
   */
  forceRefresh(): T[] {
    localStorage.removeItem(this.config.storageKey)
    return this.loadData()
  }

  /**
   * Add new item and save
   */
  addItem(item: T): T[] {
    const currentData = this.loadData()
    const updatedData = [...currentData, item]
    this.saveData(updatedData)
    return updatedData
  }

  /**
   * Update existing item and save
   */
  updateItem(updatedItem: T): T[] {
    const currentData = this.loadData()
    const itemKey = (updatedItem as any)[this.config.uniqueKey]
    const updatedData = currentData.map(item => 
      (item as any)[this.config.uniqueKey] === itemKey ? updatedItem : item
    )
    this.saveData(updatedData)
    return updatedData
  }

  /**
   * Remove item and save
   */
  removeItem(itemKey: string): T[] {
    const currentData = this.loadData()
    const updatedData = currentData.filter(item => 
      (item as any)[this.config.uniqueKey] !== itemKey
    )
    this.saveData(updatedData)
    return updatedData
  }
}

/**
 * Factory function to create data managers for different modules
 */
export function createDataManager<T>(config: DataMigrationConfig<T>): DataManager<T> {
  return new DataManager(config)
}

/**
 * Predefined configurations for workspace modules
 */
export const DATA_VERSIONS = {
  NOTES: '1.1.0', // Updated to include Skills Development note
  URL_LINKS: '1.1.0', // Updated version for new demo links
  PROMPTS: '1.1.0', // Updated version for new demo prompts
  FILES: '1.0.0',
  SETTINGS: '1.0.0'
} as const