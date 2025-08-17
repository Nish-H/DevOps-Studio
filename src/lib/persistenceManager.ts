// Enhanced Data Persistence Manager
// Ensures 100% data persistence with multiple backup strategies

interface PersistenceConfig {
  autoSaveInterval: number // milliseconds
  maxBackups: number
  compressionEnabled: boolean
}

class PersistenceManager {
  private config: PersistenceConfig = {
    autoSaveInterval: 2000, // 2 seconds
    maxBackups: 100,
    compressionEnabled: true
  }

  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map()
  private dataCache: Map<string, any> = new Map()

  constructor() {
    this.initializePeristence()
  }

  private initializePeristence() {
    // Prevent data loss on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handlePageUnload.bind(this))
      window.addEventListener('pagehide', this.handlePageUnload.bind(this))
      
      // Save data every 2 seconds for real-time persistence
      setInterval(() => {
        this.saveAllCachedData()
      }, this.config.autoSaveInterval)

      // Initialize persistence check
      this.verifyDataIntegrity()
    }
  }

  // Enhanced save with multiple safety checks
  public saveData(key: string, data: any, immediate: boolean = false): boolean {
    try {
      // Cache the data in memory
      this.dataCache.set(key, data)

      if (immediate) {
        return this.forceSave(key, data)
      } else {
        this.scheduleSave(key, data)
        return true
      }
    } catch (error) {
      console.error(`❌ Failed to save data for ${key}:`, error)
      return false
    }
  }

  // Force immediate save with backup
  private forceSave(key: string, data: any): boolean {
    try {
      const dataString = JSON.stringify(data)
      const timestamp = Date.now()

      // Primary save
      localStorage.setItem(key, dataString)
      
      // Create timestamped backup
      localStorage.setItem(`${key}-backup-${timestamp}`, dataString)
      
      // Save last update timestamp
      localStorage.setItem(`${key}-last-saved`, timestamp.toString())

      // Clean old backups
      this.cleanOldBackups(key)

      console.log(`✅ Data saved: ${key} (${(dataString.length / 1024).toFixed(2)}KB)`)
      return true
    } catch (error) {
      console.error(`❌ Force save failed for ${key}:`, error)
      return false
    }
  }

  // Schedule auto-save with debouncing
  private scheduleSave(key: string, data: any) {
    // Clear existing timer
    if (this.autoSaveTimers.has(key)) {
      clearTimeout(this.autoSaveTimers.get(key)!)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.forceSave(key, data)
      this.autoSaveTimers.delete(key)
    }, 500) // 500ms debounce

    this.autoSaveTimers.set(key, timer)
  }

  // Load data with recovery options
  public loadData(key: string): any | null {
    try {
      // Try primary data first
      let data = localStorage.getItem(key)
      
      if (data) {
        return JSON.parse(data)
      }

      // Try to recover from backups
      console.warn(`⚠️  Primary data not found for ${key}, attempting recovery...`)
      return this.recoverFromBackup(key)
    } catch (error) {
      console.error(`❌ Failed to load data for ${key}:`, error)
      return this.recoverFromBackup(key)
    }
  }

  // Recovery from backup files
  private recoverFromBackup(key: string): any | null {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(k => k.startsWith(`${key}-backup-`))
        .sort((a, b) => {
          const timeA = parseInt(a.split('-backup-')[1])
          const timeB = parseInt(b.split('-backup-')[1])
          return timeB - timeA // Most recent first
        })

      for (const backupKey of backupKeys) {
        try {
          const backupData = localStorage.getItem(backupKey)
          if (backupData) {
            const parsedData = JSON.parse(backupData)
            console.log(`🔄 Recovered data from backup: ${backupKey}`)
            
            // Restore to primary location
            this.forceSave(key, parsedData)
            return parsedData
          }
        } catch (backupError) {
          console.warn(`⚠️  Backup corrupted: ${backupKey}`)
          continue
        }
      }

      console.error(`❌ No valid backups found for ${key}`)
      return null
    } catch (error) {
      console.error(`❌ Recovery failed for ${key}:`, error)
      return null
    }
  }

  // Clean old backup files
  private cleanOldBackups(key: string) {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter(k => k.startsWith(`${key}-backup-`))
        .sort((a, b) => {
          const timeA = parseInt(a.split('-backup-')[1])
          const timeB = parseInt(b.split('-backup-')[1])
          return timeB - timeA
        })

      // Keep only the latest N backups
      const toDelete = backupKeys.slice(this.config.maxBackups)
      toDelete.forEach(backupKey => {
        localStorage.removeItem(backupKey)
      })

      if (toDelete.length > 0) {
        console.log(`🗑️  Cleaned ${toDelete.length} old backups for ${key}`)
      }
    } catch (error) {
      console.error(`❌ Failed to clean backups for ${key}:`, error)
    }
  }

  // Save all cached data immediately
  private saveAllCachedData() {
    this.dataCache.forEach((data, key) => {
      this.forceSave(key, data)
    })
  }

  // Handle page unload - emergency save
  private handlePageUnload() {
    console.log('🚨 Page unloading - emergency save triggered')
    this.saveAllCachedData()
  }

  // Verify data integrity on startup
  private verifyDataIntegrity() {
    const workspaceKeys = Object.keys(localStorage)
      .filter(key => key.includes('nishen-workspace'))
      .filter(key => !key.includes('-backup-') && !key.includes('-last-saved'))

    console.log('🔍 Verifying data integrity...')
    workspaceKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          JSON.parse(data) // Test if data is valid JSON
          console.log(`✅ ${key}: OK`)
        }
      } catch (error) {
        console.error(`❌ ${key}: CORRUPTED - attempting recovery`)
        this.recoverFromBackup(key)
      }
    })
    console.log('✅ Data integrity check complete')
  }

  // Get storage statistics
  public getStorageStats(): object {
    const stats = {
      totalKeys: 0,
      totalSize: 0,
      workspaceKeys: 0,
      backupKeys: 0,
      lastSaved: new Date().toISOString()
    }

    Object.keys(localStorage).forEach(key => {
      stats.totalKeys++
      const data = localStorage.getItem(key)
      if (data) {
        stats.totalSize += data.length
      }

      if (key.includes('nishen-workspace')) {
        if (key.includes('-backup-')) {
          stats.backupKeys++
        } else {
          stats.workspaceKeys++
        }
      }
    })

    return stats
  }

  // Emergency export all data
  public emergencyExport(): string {
    const exportData: any = {}
    
    Object.keys(localStorage).forEach(key => {
      if (key.includes('nishen-workspace') && !key.includes('-backup-') && !key.includes('-last-saved')) {
        exportData[key] = localStorage.getItem(key)
      }
    })

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'emergency-export',
      data: exportData
    }, null, 2)
  }

  // Import emergency data
  public emergencyImport(exportString: string): boolean {
    try {
      const imported = JSON.parse(exportString)
      
      if (imported.type === 'emergency-export' && imported.data) {
        Object.keys(imported.data).forEach(key => {
          if (imported.data[key]) {
            this.saveData(key, JSON.parse(imported.data[key]), true)
          }
        })
        console.log('✅ Emergency import successful')
        return true
      }
      
      console.error('❌ Invalid emergency export format')
      return false
    } catch (error) {
      console.error('❌ Emergency import failed:', error)
      return false
    }
  }
}

// Global persistence manager instance
export const persistenceManager = new PersistenceManager()

// Enhanced localStorage wrapper with auto-persistence
export class SafeStorage {
  static setItem(key: string, value: any) {
    return persistenceManager.saveData(key, value, false)
  }

  static setItemImmediate(key: string, value: any) {
    return persistenceManager.saveData(key, value, true)
  }

  static getItem(key: string) {
    return persistenceManager.loadData(key)
  }

  static removeItem(key: string) {
    localStorage.removeItem(key)
    // Also remove backups
    Object.keys(localStorage)
      .filter(k => k.startsWith(`${key}-backup-`))
      .forEach(k => localStorage.removeItem(k))
  }
}

// Browser console access for emergency operations
if (typeof window !== 'undefined') {
  (window as any).emergencyDataExport = () => persistenceManager.emergencyExport()
  (window as any).emergencyDataImport = (data: string) => persistenceManager.emergencyImport(data)
  (window as any).storageStats = () => persistenceManager.getStorageStats()
}