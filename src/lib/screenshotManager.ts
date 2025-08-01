// Screenshot Manager Utility
// Handles standardized screenshot processing, storage, and management

import advancedStorage from './advancedStorage'

export interface ScreenshotData {
  id: string
  imageData: string // base64 data URL
  notes: string
  timestamp: string
  section: string // 'notes', 'files', 'tools', etc.
  parentId?: string // ID of parent note/document
  dimensions: {
    width: number
    height: number
    standardWidth: number
    standardHeight: number
  }
}

export interface ScreenshotConfig {
  standardWidth: number
  standardHeight: number
  quality: number
  format: 'jpeg' | 'png'
}

export class ScreenshotManager {
  private static instance: ScreenshotManager
  private config: ScreenshotConfig = {
    standardWidth: 400,  // Reduced from 800 to save space
    standardHeight: 300, // Reduced from 600 to save space
    quality: 0.6,        // Reduced from 0.8 to save space
    format: 'jpeg'       // JPEG is more compressed than PNG
  }

  private constructor() {}

  static getInstance(): ScreenshotManager {
    if (!ScreenshotManager.instance) {
      ScreenshotManager.instance = new ScreenshotManager()
    }
    return ScreenshotManager.instance
  }

  // Process clipboard image and standardize dimensions
  async processClipboardImage(): Promise<ScreenshotData | null> {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.read) {
        throw new Error('Clipboard API not available. Please use HTTPS or localhost.')
      }

      console.log('Reading clipboard...')
      const clipboardItems = await navigator.clipboard.read()
      console.log('Clipboard items:', clipboardItems.length)
      
      for (const item of clipboardItems) {
        console.log('Item types:', item.types)
        
        // Look for any image type
        const imageType = item.types.find(type => type.startsWith('image/'))
        if (imageType) {
          console.log('Found image type:', imageType)
          const imageBlob = await item.getType(imageType)
          console.log('Image blob size:', imageBlob.size)
          return await this.processImageBlob(imageBlob)
        }
      }
      
      console.log('No image found in clipboard')
      return null
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      throw error // Re-throw to show user the specific error
    }
  }

  // Process image blob and standardize dimensions
  private async processImageBlob(blob: Blob): Promise<ScreenshotData> {
    console.log('Processing image blob:', blob.type, blob.size)
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Cannot get canvas context'))
        return
      }

      img.onload = () => {
        try {
          console.log('Image loaded:', img.width, 'x', img.height)
          
          const originalWidth = img.width
          const originalHeight = img.height

          if (originalWidth === 0 || originalHeight === 0) {
            reject(new Error('Invalid image dimensions'))
            return
          }

          // Calculate scaling to fit within standard dimensions while maintaining aspect ratio
          const scaleX = this.config.standardWidth / originalWidth
          const scaleY = this.config.standardHeight / originalHeight
          const scale = Math.min(scaleX, scaleY)

          const scaledWidth = Math.round(originalWidth * scale)
          const scaledHeight = Math.round(originalHeight * scale)

          console.log('Scaling from', originalWidth, 'x', originalHeight, 'to', scaledWidth, 'x', scaledHeight)

          // Set canvas to standard dimensions
          canvas.width = this.config.standardWidth
          canvas.height = this.config.standardHeight

          // Fill with white background
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, this.config.standardWidth, this.config.standardHeight)

          // Center the scaled image
          const offsetX = (this.config.standardWidth - scaledWidth) / 2
          const offsetY = (this.config.standardHeight - scaledHeight) / 2

          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

          const imageData = canvas.toDataURL(`image/${this.config.format}`, this.config.quality)
          console.log('Image processed successfully, data URL length:', imageData.length)

          resolve({
            id: this.generateId(),
            imageData,
            notes: '',
            timestamp: new Date().toISOString(),
            section: '',
            dimensions: {
              width: originalWidth,
              height: originalHeight,
              standardWidth: this.config.standardWidth,
              standardHeight: this.config.standardHeight
            }
          })
        } catch (error) {
          console.error('Error processing image:', error)
          reject(error)
        } finally {
          // Clean up object URL
          URL.revokeObjectURL(img.src)
        }
      }

      img.onerror = (error) => {
        console.error('Image load error:', error)
        URL.revokeObjectURL(img.src)
        reject(new Error('Failed to load image'))
      }

      img.src = URL.createObjectURL(blob)
    })
  }

  // Handle file input for screenshots
  async processFileInput(file: File): Promise<ScreenshotData | null> {
    if (!file.type.startsWith('image/')) {
      return null
    }

    try {
      return await this.processImageBlob(file)
    } catch (error) {
      console.error('Failed to process file input:', error)
      return null
    }
  }

  // Check storage space and cleanup if needed
  private checkStorageSpace(): boolean {
    try {
      // Test if we can store a small item
      const testKey = 'storage-test-' + Date.now()
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  // Clean up old screenshots if storage is full
  private cleanupOldScreenshots(section: string): void {
    const screenshots = this.getScreenshots(section)
    if (screenshots.length > 25) {
      // Keep only the 25 most recent screenshots (was 10)
      const sorted = screenshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const toKeep = sorted.slice(0, 25)
      
      const storageKey = `nishen-workspace-screenshots-${section}`
      localStorage.setItem(storageKey, JSON.stringify(toKeep))
    }
  }

  // Save screenshot to storage (with advanced storage fallback)
  async saveScreenshot(screenshot: ScreenshotData, section: string, parentId?: string): Promise<boolean> {
    const updatedScreenshot = {
      ...screenshot,
      section,
      parentId
    }

    const storageKey = `nishen-workspace-screenshots-${section}`
    const existingScreenshots = this.getScreenshots(section)
    
    const updatedScreenshots = [...existingScreenshots, updatedScreenshot]
    
    // Try advanced storage first (handles localStorage + IndexedDB fallback)
    const advancedSuccess = await advancedStorage.saveScreenshots(storageKey, updatedScreenshots)
    if (advancedSuccess) {
      return true
    }
    
    // Fallback to traditional localStorage with cleanup
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedScreenshots))
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting cleanup and migration...')
        
        // Try to clean up old screenshots
        this.cleanupOldScreenshots(section)
        
        // Try migrating to IndexedDB
        try {
          const migrationResult = await advancedStorage.migrateToIndexedDB()
          console.log(`Migrated ${migrationResult.migrated} items to IndexedDB`)
          
          // Try saving again after migration
          const cleanedScreenshots = this.getScreenshots(section)
          const finalScreenshots = [...cleanedScreenshots, updatedScreenshot]
          const postMigrationSuccess = await advancedStorage.saveScreenshots(storageKey, finalScreenshots)
          if (postMigrationSuccess) {
            return true
          }
        } catch (migrationError) {
          console.error('Migration failed:', migrationError)
        }
        
        // Last resort: try localStorage again
        try {
          const cleanedScreenshots = this.getScreenshots(section)
          const finalScreenshots = [...cleanedScreenshots, updatedScreenshot]
          localStorage.setItem(storageKey, JSON.stringify(finalScreenshots))
          return true
        } catch {
          console.error('Unable to save screenshot even after cleanup and migration')
          return false
        }
      }
      console.error('Failed to save screenshot:', error)
      return false
    }
  }

  // Get screenshots for a specific section
  getScreenshots(section: string, parentId?: string): ScreenshotData[] {
    const storageKey = `nishen-workspace-screenshots-${section}`
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) return []
    
    try {
      const screenshots: ScreenshotData[] = JSON.parse(stored)
      return parentId 
        ? screenshots.filter(s => s.parentId === parentId)
        : screenshots
    } catch {
      return []
    }
  }

  // Update screenshot notes
  updateScreenshotNotes(screenshotId: string, section: string, notes: string): void {
    const storageKey = `nishen-workspace-screenshots-${section}`
    const screenshots = this.getScreenshots(section)
    
    const updatedScreenshots = screenshots.map(screenshot =>
      screenshot.id === screenshotId
        ? { ...screenshot, notes }
        : screenshot
    )
    
    localStorage.setItem(storageKey, JSON.stringify(updatedScreenshots))
  }

  // Delete screenshot
  deleteScreenshot(screenshotId: string, section: string): void {
    const storageKey = `nishen-workspace-screenshots-${section}`
    const screenshots = this.getScreenshots(section)
    
    const updatedScreenshots = screenshots.filter(s => s.id !== screenshotId)
    localStorage.setItem(storageKey, JSON.stringify(updatedScreenshots))
  }

  // Generate unique ID
  private generateId(): string {
    return `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Export screenshots with notes
  exportScreenshots(section: string, parentId?: string): string {
    const screenshots = this.getScreenshots(section, parentId)
    
    const exportData = {
      section,
      parentId,
      exportDate: new Date().toISOString(),
      screenshots: screenshots.map(s => ({
        id: s.id,
        notes: s.notes,
        timestamp: s.timestamp,
        dimensions: s.dimensions,
        // Note: imageData excluded from export for size reasons
        hasImage: !!s.imageData
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Get configuration
  getConfig(): ScreenshotConfig {
    return { ...this.config }
  }

  // Update configuration
  updateConfig(newConfig: Partial<ScreenshotConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

export default ScreenshotManager.getInstance()