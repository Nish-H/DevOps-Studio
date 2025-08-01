// Storage Cleanup Utility
// Handles localStorage management and cleanup for the workspace

export interface StorageStats {
  used: number
  available: number
  percentage: number
  itemCount: number
}

export class StorageCleanup {
  private static instance: StorageCleanup

  private constructor() {}

  static getInstance(): StorageCleanup {
    if (!StorageCleanup.instance) {
      StorageCleanup.instance = new StorageCleanup()
    }
    return StorageCleanup.instance
  }

  // Get current storage usage statistics
  getStorageStats(): StorageStats {
    let totalSize = 0
    let itemCount = 0

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
        itemCount++
      }
    }

    // localStorage typically has 5-10MB limit
    const estimatedLimit = 5 * 1024 * 1024 // 5MB in bytes
    const percentage = (totalSize / estimatedLimit) * 100

    return {
      used: totalSize,
      available: estimatedLimit - totalSize,
      percentage: Math.min(percentage, 100),
      itemCount
    }
  }

  // Get screenshot storage usage
  getScreenshotStorageUsage(): { [section: string]: number } {
    const usage: { [section: string]: number } = {}
    const sections = ['notes', 'files', 'tools']

    sections.forEach(section => {
      const key = `nishen-workspace-screenshots-${section}`
      const data = localStorage.getItem(key)
      usage[section] = data ? data.length : 0
    })

    return usage
  }

  // Clean up old screenshots across all sections
  cleanupAllScreenshots(maxPerSection: number = 20): number {
    const sections = ['notes', 'files', 'tools']
    let totalCleaned = 0

    sections.forEach(section => {
      totalCleaned += this.cleanupSectionScreenshots(section, maxPerSection)
    })

    return totalCleaned
  }

  // Clean up screenshots for a specific section
  cleanupSectionScreenshots(section: string, maxToKeep: number = 20): number {
    const key = `nishen-workspace-screenshots-${section}`
    const data = localStorage.getItem(key)
    
    if (!data) return 0

    try {
      const screenshots = JSON.parse(data)
      if (!Array.isArray(screenshots) || screenshots.length <= maxToKeep) {
        return 0
      }

      // Sort by timestamp (newest first) and keep only the most recent
      const sorted = screenshots.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      const toKeep = sorted.slice(0, maxToKeep)
      const cleaned = screenshots.length - toKeep.length

      localStorage.setItem(key, JSON.stringify(toKeep))
      return cleaned
    } catch (error) {
      console.error(`Failed to cleanup screenshots for ${section}:`, error)
      return 0
    }
  }

  // Clean up backup and temporary data
  cleanupBackupData(): number {
    let cleaned = 0
    const keysToRemove: string[] = []

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        // Remove backup data, emergency data, and temporary items
        if (key.includes('_BACKUP') || 
            key.includes('EMERGENCY_') || 
            key.includes('_CHANGELOG') ||
            key.includes('storage-test-')) {
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      cleaned++
    })

    return cleaned
  }

  // Emergency cleanup - removes all non-essential data
  emergencyCleanup(): { screenshots: number, backups: number, other: number } {
    const result = {
      screenshots: this.cleanupAllScreenshots(2), // Keep only 2 per section
      backups: this.cleanupBackupData(),
      other: 0
    }

    // Remove other large data items if needed
    const stats = this.getStorageStats()
    if (stats.percentage > 80) {
      // Remove additional non-critical data
      const nonCriticalKeys = Object.keys(localStorage).filter(key => 
        !key.startsWith('nishen-workspace-notes') &&
        !key.startsWith('nishen-workspace-files') &&
        !key.startsWith('nishen-workspace-settings')
      )

      nonCriticalKeys.forEach(key => {
        localStorage.removeItem(key)
        result.other++
      })
    }

    return result
  }

  // Format bytes to human readable string
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get storage health status
  getStorageHealth(): 'healthy' | 'warning' | 'critical' {
    const stats = this.getStorageStats()
    
    if (stats.percentage < 60) return 'healthy'
    if (stats.percentage < 85) return 'warning'
    return 'critical'
  }

  // Generate storage report
  generateStorageReport(): string {
    const stats = this.getStorageStats()
    const screenshotUsage = this.getScreenshotStorageUsage()
    const health = this.getStorageHealth()

    let report = `# Storage Report - ${new Date().toLocaleString()}\n\n`
    report += `## Overall Storage\n`
    report += `- Used: ${this.formatBytes(stats.used)} (${stats.percentage.toFixed(1)}%)\n`
    report += `- Available: ${this.formatBytes(stats.available)}\n`
    report += `- Total Items: ${stats.itemCount}\n`
    report += `- Health Status: ${health.toUpperCase()}\n\n`

    report += `## Screenshot Storage by Section\n`
    Object.entries(screenshotUsage).forEach(([section, size]) => {
      report += `- ${section}: ${this.formatBytes(size)}\n`
    })

    report += `\n## Recommendations\n`
    if (health === 'critical') {
      report += `- ⚠️ CRITICAL: Storage is nearly full. Run emergency cleanup immediately.\n`
      report += `- Consider downloading and removing old screenshots.\n`
    } else if (health === 'warning') {
      report += `- ⚠️ WARNING: Storage usage is high. Consider cleanup soon.\n`
    } else {
      report += `- ✅ Storage is healthy.\n`
    }

    return report
  }
}

export default StorageCleanup.getInstance()