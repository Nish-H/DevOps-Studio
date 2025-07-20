/**
 * Automatic Backup System for Nishen's AI Workspace
 * Prevents data loss by creating automatic backups of localStorage data
 * 
 * Version: 1.0.0
 * Created: July 13, 2025
 * Purpose: Prevent critical data loss incidents
 */

export interface BackupMetadata {
  timestamp: string
  version: string
  moduleCount: number
  totalSize: number
  trigger: 'manual' | 'auto' | 'beforeChange' | 'daily'
}

export interface WorkspaceBackup {
  metadata: BackupMetadata
  data: Record<string, any>
}

/**
 * Automatic backup manager for workspace data
 */
export class AutoBackupManager {
  private static instance: AutoBackupManager
  private backupInterval: NodeJS.Timeout | null = null
  private readonly BACKUP_PREFIX = 'WORKSPACE_BACKUP_'
  private readonly MAX_BACKUPS = 50 // Keep last 50 backups
  private readonly BACKUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
  
  // Workspace storage keys to backup
  private readonly WORKSPACE_KEYS = [
    'nishen-workspace-settings',
    'nishen-workspace-notes',
    'nishen-workspace-note-categories',
    'nishen-workspace-dev', // Files/Dev
    'nishen-workspace-prod', // Production
    'nishen-workspace-file-browser',
    'nishen-workspace-prompts',
    'nishen-workspace-prompt-categories',
    'nishen-workspace-url-links',
    'nishen-workspace-url-categories',
    'nishen-workspace-tools-data',
    'nishen-workspace-terminal-history'
  ]

  private constructor() {
    this.startAutoBackup()
  }

  public static getInstance(): AutoBackupManager {
    if (!AutoBackupManager.instance) {
      AutoBackupManager.instance = new AutoBackupManager()
    }
    return AutoBackupManager.instance
  }

  /**
   * Create immediate backup of all workspace data
   */
  public createBackup(trigger: 'manual' | 'auto' | 'beforeChange' | 'daily' = 'manual'): WorkspaceBackup | null {
    try {
      const data: Record<string, any> = {}
      let totalSize = 0
      let moduleCount = 0

      // Collect all workspace data
      this.WORKSPACE_KEYS.forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          try {
            data[key] = JSON.parse(item)
            totalSize += item.length
            moduleCount++
          } catch (e) {
            // Store as string if not JSON
            data[key] = item
            totalSize += item.length
            moduleCount++
          }
        }
      })

      if (moduleCount === 0) {
        console.warn('⚠️ No workspace data found for backup')
        return null
      }

      const backup: WorkspaceBackup = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          moduleCount,
          totalSize,
          trigger
        },
        data
      }

      // Save backup to localStorage
      const backupKey = `${this.BACKUP_PREFIX}${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(backup))

      // Clean old backups
      this.cleanOldBackups()

      console.log(`✅ Backup created: ${backupKey} (${moduleCount} modules, ${Math.round(totalSize/1024)}KB)`)
      return backup

    } catch (error) {
      console.error('❌ Backup creation failed:', error)
      return null
    }
  }

  /**
   * Restore from a specific backup
   */
  public restoreBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey)
      if (!backupData) {
        console.error('❌ Backup not found:', backupKey)
        return false
      }

      const backup: WorkspaceBackup = JSON.parse(backupData)
      
      // Restore each workspace key
      Object.keys(backup.data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(backup.data[key]))
      })

      console.log(`✅ Restored backup from ${backup.metadata.timestamp}`)
      console.log(`📦 Restored ${backup.metadata.moduleCount} modules`)
      
      // Reload page to reflect changes
      window.location.reload()
      
      return true

    } catch (error) {
      console.error('❌ Backup restore failed:', error)
      return false
    }
  }

  /**
   * List all available backups
   */
  public listBackups(): Array<{key: string, metadata: BackupMetadata}> {
    const backups: Array<{key: string, metadata: BackupMetadata}> = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.BACKUP_PREFIX)) {
        try {
          const backupData = localStorage.getItem(key)
          if (backupData) {
            const backup: WorkspaceBackup = JSON.parse(backupData)
            backups.push({ key, metadata: backup.metadata })
          }
        } catch (e) {
          // Skip invalid backups
        }
      }
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => 
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    )
  }

  /**
   * Create backup before making changes to data
   */
  public backupBeforeChange(moduleName: string): string | null {
    const backup = this.createBackup('beforeChange')
    if (backup) {
      const backupKey = `${this.BACKUP_PREFIX}${Date.now()}_before_${moduleName}`
      localStorage.setItem(backupKey, JSON.stringify(backup))
      console.log(`🛡️ Created safety backup before ${moduleName} changes`)
      return backupKey
    }
    return null
  }

  /**
   * Start automatic backup system
   */
  private startAutoBackup(): void {
    // Create initial backup
    this.createBackup('auto')

    // Set up interval for automatic backups
    this.backupInterval = setInterval(() => {
      this.createBackup('auto')
    }, this.BACKUP_INTERVAL)

    console.log('🔄 Auto-backup system started (5 minute intervals)')
  }

  /**
   * Stop automatic backup system
   */
  public stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval)
      this.backupInterval = null
      console.log('⏹️ Auto-backup system stopped')
    }
  }

  /**
   * Clean old backups to prevent storage bloat
   */
  private cleanOldBackups(): void {
    const backups = this.listBackups()
    
    if (backups.length > this.MAX_BACKUPS) {
      const toDelete = backups.slice(this.MAX_BACKUPS)
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.key)
      })
      console.log(`🧹 Cleaned ${toDelete.length} old backups`)
    }
  }

  /**
   * Export backup to downloadable file
   */
  public exportBackup(backupKey: string): void {
    try {
      const backupData = localStorage.getItem(backupKey)
      if (!backupData) {
        console.error('❌ Backup not found for export')
        return
      }

      const backup: WorkspaceBackup = JSON.parse(backupData)
      const fileName = `nishen-workspace-backup-${backup.metadata.timestamp.replace(/[:.]/g, '-')}.json`
      
      const blob = new Blob([backupData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log(`💾 Backup exported as ${fileName}`)
      
    } catch (error) {
      console.error('❌ Backup export failed:', error)
    }
  }

  /**
   * Import backup from file
   */
  public importBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            resolve(false)
            return
          }
          
          const backup: WorkspaceBackup = JSON.parse(e.target.result as string)
          
          // Validate backup structure
          if (!backup.metadata || !backup.data) {
            console.error('❌ Invalid backup file format')
            resolve(false)
            return
          }
          
          // Create backup key
          const backupKey = `${this.BACKUP_PREFIX}imported_${Date.now()}`
          localStorage.setItem(backupKey, JSON.stringify(backup))
          
          console.log(`📁 Backup imported successfully`)
          console.log(`🔄 Use restoreBackup('${backupKey}') to restore`)
          
          resolve(true)
          
        } catch (error) {
          console.error('❌ Backup import failed:', error)
          resolve(false)
        }
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Get backup statistics
   */
  public getBackupStats(): {
    totalBackups: number
    totalSize: number
    oldestBackup: string | null
    newestBackup: string | null
  } {
    const backups = this.listBackups()
    
    const totalSize = backups.reduce((sum, backup) => {
      const data = localStorage.getItem(backup.key)
      return sum + (data ? data.length : 0)
    }, 0)
    
    return {
      totalBackups: backups.length,
      totalSize: Math.round(totalSize / 1024), // KB
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].metadata.timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].metadata.timestamp : null
    }
  }
}

// Initialize auto-backup system when module loads
export const autoBackupManager = AutoBackupManager.getInstance()

// Global functions for browser console access
if (typeof window !== 'undefined') {
  (window as any).workspaceBackup = {
    create: () => autoBackupManager.createBackup('manual'),
    list: () => autoBackupManager.listBackups(),
    restore: (key: string) => autoBackupManager.restoreBackup(key),
    export: (key: string) => autoBackupManager.exportBackup(key),
    stats: () => autoBackupManager.getBackupStats()
  }
}