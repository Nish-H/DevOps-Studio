/**
 * BULLETPROOF DATA STORAGE SYSTEM
 * Enterprise-grade data protection for Nishen's AI Workspace
 * 
 * MISSION CRITICAL: ZERO DATA LOSS TOLERANCE
 * 
 * Created: July 13, 2025
 * Purpose: Eliminate data loss incidents permanently
 * Author: Claude Code - Learning from critical mistakes
 */

export interface DataSnapshot {
  timestamp: string
  operation: string
  beforeData: any
  afterData: any
  component: string
}

export interface BulletproofConfig {
  component: string
  storageKey: string
  backupKey: string
  redundantKey: string
  sessionKey: string
}

/**
 * BULLETPROOF STORAGE MANAGER
 * Multiple redundant storage layers + change tracking + automatic recovery
 */
export class BulletproofStorage {
  private config: BulletproofConfig
  private changeLog: DataSnapshot[] = []
  private readonly MAX_CHANGES = 1000
  private autoSaveInterval: NodeJS.Timeout | null = null

  constructor(config: BulletproofConfig) {
    this.config = config
    this.startAutoSave()
    this.logOperation('INIT', null, null)
  }

  /**
   * SAVE DATA WITH MULTIPLE REDUNDANCY LAYERS
   * 1. Primary localStorage
   * 2. Backup localStorage key  
   * 3. Redundant localStorage key
   * 4. SessionStorage backup
   * 5. Change log tracking
   */
  public saveData(data: any, operation: string = 'SAVE'): void {
    try {
      const beforeData = this.loadPrimaryData()
      const serializedData = JSON.stringify(data)
      const timestamp = new Date().toISOString()
      
      // Layer 1: Primary storage
      localStorage.setItem(this.config.storageKey, serializedData)
      
      // Layer 2: Backup storage
      localStorage.setItem(this.config.backupKey, serializedData)
      
      // Layer 3: Redundant storage with timestamp
      const redundantData = {
        data: data,
        timestamp: timestamp,
        operation: operation,
        component: this.config.component
      }
      localStorage.setItem(this.config.redundantKey, JSON.stringify(redundantData))
      
      // Layer 4: Session storage backup
      sessionStorage.setItem(this.config.sessionKey, serializedData)
      
      // Layer 5: Change log
      this.logOperation(operation, beforeData, data)
      
      // Layer 6: Immediate verification
      this.verifyDataIntegrity(data)
      
      console.log(`🛡️ BULLETPROOF SAVE [${this.config.component}]: ${operation} - ${data.length || 'N/A'} items`)
      
    } catch (error) {
      console.error(`❌ CRITICAL SAVE FAILURE [${this.config.component}]:`, error)
      this.emergencyDataRecovery(data, operation)
    }
  }

  /**
   * LOAD DATA WITH AUTOMATIC RECOVERY
   * Tries multiple storage layers until data is found
   */
  public loadData(defaultData: any[] = []): any {
    const recoveryMethods = [
      () => this.loadPrimaryData(),
      () => this.loadBackupData(),
      () => this.loadRedundantData(),
      () => this.loadSessionData(),
      () => this.loadFromChangeLog(),
      () => defaultData
    ]

    for (let i = 0; i < recoveryMethods.length; i++) {
      try {
        const data = recoveryMethods[i]()
        if (data && data.length >= 0) {
          if (i > 0) {
            console.warn(`🔧 RECOVERED from backup layer ${i} [${this.config.component}]`)
            // If recovered from backup, immediately save to primary
            this.saveData(data, 'RECOVERY')
          }
          return data
        }
      } catch (error) {
        console.warn(`⚠️ Recovery method ${i} failed [${this.config.component}]:`, error)
      }
    }

    console.error(`❌ ALL RECOVERY METHODS FAILED [${this.config.component}] - Using default data`)
    return defaultData
  }

  /**
   * Primary data loading
   */
  private loadPrimaryData(): any {
    const data = localStorage.getItem(this.config.storageKey)
    return data ? JSON.parse(data) : null
  }

  /**
   * Backup data loading
   */
  private loadBackupData(): any {
    const data = localStorage.getItem(this.config.backupKey)
    return data ? JSON.parse(data) : null
  }

  /**
   * Redundant data loading
   */
  private loadRedundantData(): any {
    const data = localStorage.getItem(this.config.redundantKey)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.data || parsed
    }
    return null
  }

  /**
   * Session data loading
   */
  private loadSessionData(): any {
    const data = sessionStorage.getItem(this.config.sessionKey)
    return data ? JSON.parse(data) : null
  }

  /**
   * Change log recovery
   */
  private loadFromChangeLog(): any {
    if (this.changeLog.length > 0) {
      const lastGoodState = this.changeLog
        .reverse()
        .find(change => change.afterData && change.afterData.length > 0)
      return lastGoodState ? lastGoodState.afterData : null
    }
    return null
  }

  /**
   * Log all data operations for forensic analysis
   */
  private logOperation(operation: string, beforeData: any, afterData: any): void {
    const snapshot: DataSnapshot = {
      timestamp: new Date().toISOString(),
      operation: operation,
      beforeData: beforeData,
      afterData: afterData,
      component: this.config.component
    }

    this.changeLog.push(snapshot)
    
    // Keep only recent changes
    if (this.changeLog.length > this.MAX_CHANGES) {
      this.changeLog = this.changeLog.slice(-this.MAX_CHANGES)
    }

    // Save change log to localStorage
    try {
      localStorage.setItem(`${this.config.storageKey}_CHANGELOG`, JSON.stringify(this.changeLog))
    } catch (error) {
      console.warn('Change log save failed:', error)
    }
  }

  /**
   * Verify data integrity after save
   */
  private verifyDataIntegrity(expectedData: any): boolean {
    try {
      const savedData = this.loadPrimaryData()
      const isValid = JSON.stringify(savedData) === JSON.stringify(expectedData)
      
      if (!isValid) {
        console.error(`❌ DATA INTEGRITY FAILURE [${this.config.component}]`)
        this.emergencyDataRecovery(expectedData, 'INTEGRITY_CHECK')
        return false
      }
      
      return true
    } catch (error) {
      console.error(`❌ INTEGRITY CHECK FAILED [${this.config.component}]:`, error)
      return false
    }
  }

  /**
   * Emergency data recovery procedures
   */
  private emergencyDataRecovery(data: any, operation: string): void {
    try {
      // Try alternative storage methods
      const emergencyKey = `EMERGENCY_${this.config.storageKey}_${Date.now()}`
      
      // Store in multiple locations
      localStorage.setItem(emergencyKey, JSON.stringify({
        data: data,
        timestamp: new Date().toISOString(),
        operation: operation,
        component: this.config.component,
        emergencyRecovery: true
      }))
      
      // Store in sessionStorage
      sessionStorage.setItem(emergencyKey, JSON.stringify(data))
      
      // Alert user immediately
      console.error(`🚨 EMERGENCY RECOVERY ACTIVATED [${this.config.component}]`)
      console.error(`Emergency backup saved as: ${emergencyKey}`)
      
      // Try to notify user (if in browser)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert(`⚠️ DATA SAVE ERROR in ${this.config.component}!\nEmergency backup created: ${emergencyKey}\nPlease screenshot this message!`)
        }, 100)
      }
      
    } catch (emergencyError) {
      console.error(`❌ EMERGENCY RECOVERY FAILED [${this.config.component}]:`, emergencyError)
    }
  }

  /**
   * Auto-save every 30 seconds
   */
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      const currentData = this.loadPrimaryData()
      if (currentData) {
        this.saveData(currentData, 'AUTO_SAVE')
      }
    }, 30000) // 30 seconds
  }

  /**
   * Get data forensics for debugging
   */
  public getForensics(): any {
    return {
      component: this.config.component,
      primaryData: this.loadPrimaryData(),
      backupData: this.loadBackupData(),
      redundantData: this.loadRedundantData(),
      sessionData: this.loadSessionData(),
      changeLogEntries: this.changeLog.length,
      lastChange: this.changeLog[this.changeLog.length - 1],
      allStorageKeys: {
        primary: this.config.storageKey,
        backup: this.config.backupKey,
        redundant: this.config.redundantKey,
        session: this.config.sessionKey
      }
    }
  }

  /**
   * Export all data for manual backup
   */
  public exportAllData(): string {
    const forensics = this.getForensics()
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      component: this.config.component,
      forensics: forensics,
      changeLog: this.changeLog
    }, null, 2)
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
  }
}

/**
 * Factory function to create bulletproof storage for components
 */
export function createBulletproofStorage(component: string, storageKey: string): BulletproofStorage {
  const config: BulletproofConfig = {
    component: component,
    storageKey: storageKey,
    backupKey: `${storageKey}_BACKUP`,
    redundantKey: `${storageKey}_REDUNDANT`,
    sessionKey: `${storageKey}_SESSION`
  }
  
  return new BulletproofStorage(config)
}

// Global access for emergency debugging
if (typeof window !== 'undefined') {
  (window as any).bulletproofDebug = {
    getAllForensics: () => {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('nishen-workspace')) {
          keys.push(key)
        }
      }
      return keys.map(key => {
        const storage = createBulletproofStorage('DEBUG', key)
        return storage.getForensics()
      })
    }
  }
}