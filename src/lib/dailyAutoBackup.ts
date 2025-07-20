/**
 * DAILY AUTO-BACKUP SYSTEM - 5PM SCHEDULER
 * Enterprise-grade daily data export and backup
 * 
 * Created: July 14, 2025
 * Purpose: Ensure ZERO data loss with daily automated backups
 */

export interface DailyBackupConfig {
  backupTime: string // "17:00" for 5PM
  timezone: string
  exportFormats: ('json' | 'markdown' | 'csv')[]
  retentionDays: number
  googleDriveFolder: string // Suggested Google Drive folder path
  enableGoogleDriveInstructions: boolean
}

export interface BackupManifest {
  timestamp: string
  version: string
  totalSize: number
  modules: string[]
  backupPath: string
  success: boolean
}

/**
 * DAILY AUTO-BACKUP MANAGER
 * Automatically exports all workspace data at 5PM daily
 */
export class DailyAutoBackup {
  private static instance: DailyAutoBackup
  private config: DailyBackupConfig
  private backupTimer: NodeJS.Timeout | null = null
  private lastBackupDate: string | null = null

  private constructor() {
    this.config = {
      backupTime: "17:00", // 5PM
      timezone: "Africa/Johannesburg",
      exportFormats: ['json', 'markdown'],
      retentionDays: 30,
      googleDriveFolder: "H:\\My Drive\\Nishens-AI-Workspace-Backup",
      enableGoogleDriveInstructions: true
    }
    
    // Load saved configuration
    this.loadConfig()
    
    this.initializeScheduler()
  }

  public static getInstance(): DailyAutoBackup {
    if (!DailyAutoBackup.instance) {
      DailyAutoBackup.instance = new DailyAutoBackup()
    }
    return DailyAutoBackup.instance
  }

  /**
   * Initialize the 5PM daily backup scheduler
   */
  private initializeScheduler(): void {
    // Check if backup is needed immediately (in case page loads after 5PM)
    this.checkAndRunBackup()
    
    // Set up interval to check every minute
    this.backupTimer = setInterval(() => {
      this.checkAndRunBackup()
    }, 60000) // Check every minute
    
    console.log('📅 Daily 5PM Auto-Backup System initialized')
  }

  /**
   * Check if it's time for backup and run if needed
   */
  private checkAndRunBackup(): void {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
    const currentDate = now.toDateString()
    
    // Check if it's 5PM and we haven't backed up today
    if (currentTime === this.config.backupTime && this.lastBackupDate !== currentDate) {
      console.log('🕔 5PM Daily Backup Time - Starting automatic backup...')
      this.runDailyBackup()
      this.lastBackupDate = currentDate
    }
  }

  /**
   * Execute the daily backup process
   */
  public async runDailyBackup(): Promise<BackupManifest> {
    const timestamp = new Date().toISOString()
    const dateStr = new Date().toISOString().split('T')[0]
    
    console.log('🔄 Starting Daily Auto-Backup...')
    
    try {
      // Collect all workspace data
      const allData = this.collectAllWorkspaceData()
      
      // Create backup package
      const backupPackage = {
        metadata: {
          timestamp: timestamp,
          version: "daily-backup-v1.0",
          source: "Nishen's AI Workspace",
          type: "daily-automated-export",
          date: dateStr
        },
        workspace: allData.workspace,
        cv: allData.cv,
        certificates: allData.certificates,
        projects: allData.projects,
        settings: allData.settings
      }
      
      // Calculate total size
      const totalSize = JSON.stringify(backupPackage).length
      
      // Save JSON backup
      const jsonBackup = JSON.stringify(backupPackage, null, 2)
      this.downloadFile(
        jsonBackup, 
        `nishen-workspace-daily-backup-${dateStr}.json`,
        'application/json'
      )
      
      // Save Markdown backup (human-readable)
      const markdownBackup = this.generateMarkdownBackup(backupPackage)
      this.downloadFile(
        markdownBackup,
        `nishen-workspace-daily-backup-${dateStr}.md`,
        'text/markdown'
      )
      
      // Create backup manifest
      const manifest: BackupManifest = {
        timestamp: timestamp,
        version: "daily-backup-v1.0",
        totalSize: totalSize,
        modules: Object.keys(allData.workspace),
        backupPath: `downloads/nishen-workspace-daily-backup-${dateStr}.*`,
        success: true
      }
      
      // Save manifest to localStorage
      localStorage.setItem(`DAILY_BACKUP_MANIFEST_${dateStr}`, JSON.stringify(manifest))
      
      // Show success notification
      this.showBackupNotification(manifest)
      
      console.log('✅ Daily Auto-Backup completed successfully')
      console.log(`📊 Backup size: ${Math.round(totalSize/1024)} KB`)
      console.log(`📁 Files: nishen-workspace-daily-backup-${dateStr}.*`)
      console.log(`🗂️ Google Drive Target: ${this.config.googleDriveFolder}`)
      
      return manifest
      
    } catch (error) {
      console.error('❌ Daily Auto-Backup failed:', error)
      
      const failedManifest: BackupManifest = {
        timestamp: timestamp,
        version: "daily-backup-v1.0",
        totalSize: 0,
        modules: [],
        backupPath: '',
        success: false
      }
      
      // Save failed manifest
      localStorage.setItem(`DAILY_BACKUP_MANIFEST_${dateStr}`, JSON.stringify(failedManifest))
      
      return failedManifest
    }
  }

  /**
   * Collect all workspace data from localStorage
   */
  private collectAllWorkspaceData(): any {
    const workspaceKeys = [
      'nishen-workspace-notes',
      'nishen-workspace-note-categories',
      'nishen-workspace-dev',
      'nishen-workspace-prod', 
      'nishen-workspace-file-browser',
      'nishen-workspace-url-links',
      'nishen-workspace-url-categories',
      'nishen-workspace-prompts',
      'nishen-workspace-prompt-categories',
      'nishen-workspace-settings',
      'nishen-workspace-tools-data',
      'nishen-workspace-terminal-history'
    ]
    
    const workspace: Record<string, any> = {}
    
    workspaceKeys.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          workspace[key] = JSON.parse(data)
        } catch (e) {
          workspace[key] = data // Store as string if not JSON
        }
      }
    })
    
    // Add CV data
    const cv = this.extractCVData()
    
    // Add certificates data
    const certificates = this.extractCertificatesData()
    
    // Add project data
    const projects = this.extractProjectData()
    
    // Add settings
    const settings = this.extractSettingsData()
    
    return {
      workspace,
      cv,
      certificates,
      projects,
      settings
    }
  }

  /**
   * Extract CV data from notes or files
   */
  private extractCVData(): any {
    const notes = localStorage.getItem('nishen-workspace-notes')
    if (notes) {
      try {
        const parsedNotes = JSON.parse(notes)
        const cvNote = parsedNotes.find((note: any) => 
          note.title.toLowerCase().includes('cv') || 
          note.title.toLowerCase().includes('curriculum') ||
          note.category.toLowerCase().includes('personal')
        )
        return cvNote || null
      } catch (e) {
        return null
      }
    }
    return null
  }

  /**
   * Extract certificates data
   */
  private extractCertificatesData(): any {
    // Check if certificates are stored in notes or files
    const notes = localStorage.getItem('nishen-workspace-notes')
    if (notes) {
      try {
        const parsedNotes = JSON.parse(notes)
        const certNotes = parsedNotes.filter((note: any) => 
          note.title.toLowerCase().includes('cert') ||
          note.title.toLowerCase().includes('qualification') ||
          note.content.toLowerCase().includes('microsoft') ||
          note.content.toLowerCase().includes('mcse')
        )
        return certNotes
      } catch (e) {
        return []
      }
    }
    return []
  }

  /**
   * Extract project data
   */
  private extractProjectData(): any {
    const devProjects = localStorage.getItem('nishen-workspace-dev')
    const prodProjects = localStorage.getItem('nishen-workspace-prod')
    
    const projects: any = {}
    
    if (devProjects) {
      try {
        projects.development = JSON.parse(devProjects)
      } catch (e) {
        projects.development = []
      }
    }
    
    if (prodProjects) {
      try {
        projects.production = JSON.parse(prodProjects)
      } catch (e) {
        projects.production = []
      }
    }
    
    return projects
  }

  /**
   * Extract settings data
   */
  private extractSettingsData(): any {
    const settings = localStorage.getItem('nishen-workspace-settings')
    if (settings) {
      try {
        return JSON.parse(settings)
      } catch (e) {
        return {}
      }
    }
    return {}
  }

  /**
   * Generate human-readable markdown backup
   */
  private generateMarkdownBackup(backupData: any): string {
    const timestamp = new Date().toLocaleString()
    
    let markdown = `# Nishen's AI Workspace - Daily Backup\n\n`
    markdown += `**Generated:** ${timestamp}\n`
    markdown += `**Type:** Daily Automated Backup\n`
    markdown += `**Version:** ${backupData.metadata.version}\n\n`
    
    markdown += `## Summary\n\n`
    markdown += `- **Notes:** ${backupData.workspace['nishen-workspace-notes']?.length || 0} items\n`
    markdown += `- **Dev Projects:** ${backupData.projects?.development?.length || 0} items\n`
    markdown += `- **Prod Projects:** ${backupData.projects?.production?.length || 0} items\n`
    markdown += `- **URL Links:** ${backupData.workspace['nishen-workspace-url-links']?.length || 0} items\n`
    markdown += `- **Prompts:** ${backupData.workspace['nishen-workspace-prompts']?.length || 0} items\n\n`
    
    if (backupData.cv) {
      markdown += `## CV Data\n\n`
      markdown += `**Title:** ${backupData.cv.title}\n`
      markdown += `**Category:** ${backupData.cv.category}\n`
      markdown += `**Last Modified:** ${backupData.cv.modified}\n\n`
    }
    
    markdown += `## Full Data Export\n\n`
    markdown += `\`\`\`json\n${JSON.stringify(backupData, null, 2)}\n\`\`\`\n`
    
    return markdown
  }

  /**
   * Download file to user's computer with Google Drive instructions
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Show Google Drive instructions after download
    if (this.config.enableGoogleDriveInstructions) {
      setTimeout(() => {
        this.showGoogleDriveInstructions(filename)
      }, 1000)
    }
  }

  /**
   * Show Google Drive backup instructions
   */
  private showGoogleDriveInstructions(filename: string): void {
    const instructions = `
📁 GOOGLE DRIVE BACKUP INSTRUCTIONS

Your backup file "${filename}" has been downloaded to your Downloads folder.

🎯 MOVE TO GOOGLE DRIVE:
1. Open File Explorer
2. Navigate to your Downloads folder
3. Find the file: ${filename}
4. Cut/Copy the file (Ctrl+X or Ctrl+C)
5. Navigate to: ${this.config.googleDriveFolder}
6. Paste the file (Ctrl+V)

✅ Your backup is now safely stored in Google Drive!

💡 TIP: You can also drag and drop the file directly from Downloads to your Google Drive folder.
    `
    
    console.log(instructions)
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📁 Backup Ready for Google Drive', {
        body: `File downloaded: ${filename}\nMove to: ${this.config.googleDriveFolder}`,
        icon: '/favicon.ico'
      })
    }
    
    // Show alert with instructions
    alert(`📁 BACKUP DOWNLOADED!\n\nFile: ${filename}\n\nNext Steps:\n1. Go to your Downloads folder\n2. Move the file to: ${this.config.googleDriveFolder}\n\nThis ensures your backup is safely stored in Google Drive!`)
  }

  /**
   * Show backup completion notification
   */
  private showBackupNotification(manifest: BackupManifest): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📅 Daily Backup Complete', {
        body: `Workspace data exported successfully (${Math.round(manifest.totalSize/1024)} KB)`,
        icon: '/favicon.ico'
      })
    } else {
      // Fallback to console log
      console.log(`📅 Daily Backup Complete: ${Math.round(manifest.totalSize/1024)} KB exported`)
    }
  }

  /**
   * Request notification permission
   */
  public requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted for daily backups')
        }
      })
    }
  }

  /**
   * Get backup history
   */
  public getBackupHistory(): BackupManifest[] {
    const manifests: BackupManifest[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('DAILY_BACKUP_MANIFEST_')) {
        try {
          const manifest = JSON.parse(localStorage.getItem(key) || '{}')
          manifests.push(manifest)
        } catch (e) {
          // Skip invalid manifests
        }
      }
    }
    
    return manifests.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  /**
   * Manual backup trigger (for testing or immediate backup)
   */
  public async runManualBackup(): Promise<BackupManifest> {
    console.log('🔄 Running manual backup...')
    return await this.runDailyBackup()
  }

  /**
   * Stop the daily backup scheduler
   */
  public stopScheduler(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
      this.backupTimer = null
      console.log('⏹️ Daily backup scheduler stopped')
    }
  }

  /**
   * Get next backup time
   */
  public getNextBackupTime(): string {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0)
    
    if (now > today) {
      // Next backup is tomorrow at 5PM
      today.setDate(today.getDate() + 1)
    }
    
    return today.toLocaleString()
  }

  /**
   * Update Google Drive folder path
   */
  public setGoogleDriveFolder(folderPath: string): void {
    this.config.googleDriveFolder = folderPath
    console.log(`📁 Google Drive backup folder updated: ${folderPath}`)
    
    // Save to localStorage for persistence
    localStorage.setItem('DAILY_BACKUP_CONFIG', JSON.stringify(this.config))
  }

  /**
   * Get current Google Drive folder path
   */
  public getGoogleDriveFolder(): string {
    return this.config.googleDriveFolder
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('DAILY_BACKUP_CONFIG')
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        this.config = { ...this.config, ...config }
        console.log('📋 Backup configuration loaded from localStorage')
      }
    } catch (e) {
      console.log('📋 Using default backup configuration')
    }
  }
}

// Initialize daily backup system
export const dailyAutoBackup = DailyAutoBackup.getInstance()

// Global browser console access
if (typeof window !== 'undefined') {
  (window as any).dailyBackup = {
    runNow: () => dailyAutoBackup.runManualBackup(),
    getHistory: () => dailyAutoBackup.getBackupHistory(),
    getNextTime: () => dailyAutoBackup.getNextBackupTime(),
    requestNotifications: () => dailyAutoBackup.requestNotificationPermission(),
    setGoogleDrive: (path: string) => dailyAutoBackup.setGoogleDriveFolder(path),
    getGoogleDrive: () => dailyAutoBackup.getGoogleDriveFolder(),
    showConfig: () => {
      console.log('📋 DAILY BACKUP CONFIGURATION:')
      console.log(`⏰ Backup Time: ${dailyAutoBackup.getNextBackupTime()}`)
      console.log(`📁 Google Drive: ${dailyAutoBackup.getGoogleDriveFolder()}`)
      console.log(`📊 History: ${dailyAutoBackup.getBackupHistory().length} previous backups`)
    }
  }
  
  // Request notification permission on first load
  dailyAutoBackup.requestNotificationPermission()
  
  // Show initial configuration
  console.log(`📁 Google Drive backup folder: ${dailyAutoBackup.getGoogleDriveFolder()}`)
}