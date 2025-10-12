// Cloud storage utility for cross-device data synchronization
// Works with Vercel KV Redis backend

interface SyncResponse {
  success: boolean
  data?: Record<string, any>
  deviceId?: string
  lastSync?: string
  message?: string
  error?: string
}

class CloudStorage {
  private deviceId: string | null = null
  private syncInProgress = false
  private retryCount = 0
  private maxRetries = 3

  constructor() {
    this.initializeDeviceId()
  }

  private initializeDeviceId() {
    // Try to get existing device ID from localStorage
    this.deviceId = localStorage.getItem('nishen-device-id')
    
    if (!this.deviceId) {
      // Generate new device ID and migrate data
      this.registerDevice().catch(error => {
        console.warn('Cloud sync registration failed, continuing in offline mode:', error)
        // Generate offline device ID for potential future sync
        this.deviceId = 'offline_' + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('nishen-device-id', this.deviceId)
      })
    }
  }

  private async registerDevice(): Promise<string> {
    try {
      // Collect all current localStorage data
      const localStorageData: Record<string, any> = {}
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('nishen-workspace-')) {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              localStorageData[key] = JSON.parse(value)
            } catch {
              localStorageData[key] = value
            }
          }
        }
      }

      const response = await fetch('/api/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localStorageData })
      })

      const result: SyncResponse = await response.json()
      
      if (result.success && result.deviceId) {
        this.deviceId = result.deviceId
        localStorage.setItem('nishen-device-id', this.deviceId)
        localStorage.setItem('last-cloud-sync', result.lastSync || new Date().toISOString())
        console.log('Device registered:', this.deviceId)
        return this.deviceId
      }
      
      throw new Error(result.error || 'Failed to register device')
    } catch (error) {
      console.error('Device registration failed:', error)
      throw error
    }
  }

  async saveToCloud(key: string, data: any): Promise<boolean> {
    if (!this.deviceId || this.syncInProgress) return false
    
    try {
      this.syncInProgress = true
      
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.deviceId,
          key: key.replace('nishen-workspace-', ''),
          data
        })
      })

      const result: SyncResponse = await response.json()
      
      if (result.success) {
        localStorage.setItem('last-cloud-sync', result.lastSync || new Date().toISOString())
        this.retryCount = 0
        return true
      }
      
      throw new Error(result.error || 'Save failed')
    } catch (error) {
      console.error('Cloud save failed:', error)
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        setTimeout(() => this.saveToCloud(key, data), 1000 * this.retryCount)
      }
      
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  async loadFromCloud(): Promise<Record<string, any> | null> {
    if (!this.deviceId) return null
    
    try {
      const response = await fetch(`/api/sync?deviceId=${this.deviceId}`)
      const result: SyncResponse = await response.json()
      
      if (result.success && result.data) {
        localStorage.setItem('last-cloud-sync', result.lastSync || new Date().toISOString())
        return result.data
      }
      
      return null
    } catch (error) {
      console.error('Cloud load failed:', error)
      return null
    }
  }

  async syncWithCloud(): Promise<boolean> {
    if (!this.deviceId || this.syncInProgress) return false
    
    try {
      this.syncInProgress = true
      
      // Load cloud data
      const cloudData = await this.loadFromCloud()
      
      if (cloudData) {
        // Update localStorage with cloud data
        Object.entries(cloudData).forEach(([key, value]) => {
          const fullKey = `nishen-workspace-${key}`
          localStorage.setItem(fullKey, JSON.stringify(value))
        })
        
        // Trigger storage events for components to update
        window.dispatchEvent(new Event('storage'))
        
        console.log('Data synced from cloud:', Object.keys(cloudData).length, 'items')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Cloud sync failed:', error)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  getDeviceId(): string | null {
    return this.deviceId
  }

  getLastSyncTime(): string | null {
    return localStorage.getItem('last-cloud-sync')
  }

  // Auto-sync data when localStorage changes
  setupAutoSync() {
    // Save to cloud whenever localStorage changes
    const originalSetItem = localStorage.setItem
    localStorage.setItem = (key: string, value: string) => {
      originalSetItem.call(localStorage, key, value)
      
      if (key.startsWith('nishen-workspace-')) {
        try {
          const data = JSON.parse(value)
          this.saveToCloud(key, data)
        } catch {
          this.saveToCloud(key, value)
        }
      }
    }

    // Sync from cloud when page loads/becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncWithCloud()
      }
    })

    // Periodic sync every 30 seconds
    setInterval(() => {
      this.syncWithCloud()
    }, 30000)
  }
}

// Export singleton instance
export const cloudStorage = new CloudStorage()

// Utility functions for easy integration
export const saveToCloud = (key: string, data: any) => cloudStorage.saveToCloud(key, data)
export const loadFromCloud = () => cloudStorage.loadFromCloud()
export const syncWithCloud = () => cloudStorage.syncWithCloud()
export const getDeviceId = () => cloudStorage.getDeviceId()
export const getLastSyncTime = () => cloudStorage.getLastSyncTime()
export const setupAutoSync = () => cloudStorage.setupAutoSync()