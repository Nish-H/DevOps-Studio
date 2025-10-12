// Google Drive API integration for unlimited cloud storage
// Replaces localStorage limitations with proper cloud persistence

interface GoogleDriveFile {
  id: string
  name: string
  content?: string
  mimeType: string
  modifiedTime: string
}

interface DriveAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}

class GoogleDriveService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private appFolderId: string | null = null
  private clientId: string
  private clientSecret: string
  private appName: string

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
    this.appName = process.env.NEXT_PUBLIC_APP_NAME || 'Nishen-AI-Workspace'

    // Load stored tokens
    this.loadStoredTokens()
  }

  private loadStoredTokens() {
    try {
      this.accessToken = localStorage.getItem('google_drive_access_token')
      this.refreshToken = localStorage.getItem('google_drive_refresh_token')
      this.appFolderId = localStorage.getItem('google_drive_app_folder_id')
    } catch (error) {
      console.warn('Could not load stored tokens:', error)
    }
  }

  private saveTokens(accessToken: string, refreshToken?: string) {
    try {
      this.accessToken = accessToken
      localStorage.setItem('google_drive_access_token', accessToken)

      if (refreshToken) {
        this.refreshToken = refreshToken
        localStorage.setItem('google_drive_refresh_token', refreshToken)
      }
    } catch (error) {
      console.warn('Could not save tokens:', error)
    }
  }

  // OAuth2 Authentication Flow
  async authenticate(): Promise<boolean> {
    try {
      const scope = 'https://www.googleapis.com/auth/drive.file'
      const redirectUri = `${window.location.origin}/auth/google-callback`

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`

      // Open popup for authentication
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600')

      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            resolve(this.isAuthenticated())
          }
        }, 1000)

        // Listen for auth completion
        window.addEventListener('message', (event) => {
          if (event.origin === window.location.origin && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed)
            popup?.close()
            this.handleAuthCode(event.data.code).then(resolve)
          }
        })
      })
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    }
  }

  private async handleAuthCode(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/google-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      const tokens: DriveAuthResponse = await response.json()

      if (tokens.access_token) {
        this.saveTokens(tokens.access_token, tokens.refresh_token)
        await this.ensureAppFolder()
        return true
      }

      return false
    } catch (error) {
      console.error('Token exchange failed:', error)
      return false
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch('/api/auth/google-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      const tokens: DriveAuthResponse = await response.json()

      if (tokens.access_token) {
        this.saveTokens(tokens.access_token)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Create app folder in user's Drive
  private async ensureAppFolder(): Promise<string> {
    if (this.appFolderId) return this.appFolderId

    try {
      // Check if folder already exists
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.appName}' and mimeType='application/vnd.google-apps.folder'`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      )

      const searchData = await searchResponse.json()

      if (searchData.files && searchData.files.length > 0) {
        this.appFolderId = searchData.files[0].id
        if (this.appFolderId) {
          localStorage.setItem('google_drive_app_folder_id', this.appFolderId)
          return this.appFolderId
        }
      }

      // Create new folder
      const createResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.appName,
            mimeType: 'application/vnd.google-apps.folder'
          })
        }
      )

      const folder = await createResponse.json()
      this.appFolderId = folder.id
      if (this.appFolderId) {
        localStorage.setItem('google_drive_app_folder_id', this.appFolderId)
        return this.appFolderId
      }
      throw new Error('Failed to create app folder')
    } catch (error) {
      console.error('Failed to create app folder:', error)
      throw error
    }
  }

  // Save workspace data to Google Drive
  async saveWorkspaceData(key: string, data: any): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive')
    }

    try {
      await this.ensureAppFolder()

      const fileName = `${key.replace('nishen-workspace-', '')}.json`
      const content = JSON.stringify(data, null, 2)

      // Check if file exists
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and parents in '${this.appFolderId}'`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      )

      const searchData = await searchResponse.json()
      let fileId = null

      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id
      }

      const metadata = {
        name: fileName,
        parents: [this.appFolderId]
      }

      const form = new FormData()
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      form.append('file', new Blob([content], { type: 'application/json' }))

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

      const response = await fetch(url, {
        method: fileId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: form
      })

      if (response.ok) {
        console.log(`Saved ${fileName} to Google Drive`)
        return true
      }

      throw new Error(`Failed to save: ${response.statusText}`)
    } catch (error) {
      console.error('Save to Drive failed:', error)

      // Try to refresh token and retry once
      if (await this.refreshAccessToken()) {
        return this.saveWorkspaceData(key, data)
      }

      return false
    }
  }

  // Load workspace data from Google Drive
  async loadWorkspaceData(key: string): Promise<any | null> {
    if (!this.isAuthenticated()) return null

    try {
      await this.ensureAppFolder()

      const fileName = `${key.replace('nishen-workspace-', '')}.json`

      // Find the file
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and parents in '${this.appFolderId}'`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      )

      const searchData = await searchResponse.json()

      if (!searchData.files || searchData.files.length === 0) {
        return null // File doesn't exist
      }

      const fileId = searchData.files[0].id

      // Download file content
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      )

      if (downloadResponse.ok) {
        const content = await downloadResponse.text()
        return JSON.parse(content)
      }

      return null
    } catch (error) {
      console.error('Load from Drive failed:', error)

      // Try to refresh token and retry once
      if (await this.refreshAccessToken()) {
        return this.loadWorkspaceData(key)
      }

      return null
    }
  }

  // List all workspace files in Drive
  async listWorkspaceFiles(): Promise<GoogleDriveFile[]> {
    if (!this.isAuthenticated()) return []

    try {
      await this.ensureAppFolder()

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=parents in '${this.appFolderId}'&fields=files(id,name,mimeType,modifiedTime)`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      )

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('List files failed:', error)
      return []
    }
  }

  // Migrate localStorage data to Google Drive
  async migrateFromLocalStorage(): Promise<boolean> {
    if (!this.isAuthenticated()) return false

    try {
      const migrated = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('nishen-workspace-')) {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              const data = JSON.parse(value)
              const success = await this.saveWorkspaceData(key, data)
              if (success) {
                migrated.push(key)
              }
            } catch (error) {
              console.warn(`Failed to migrate ${key}:`, error)
            }
          }
        }
      }

      console.log(`Migrated ${migrated.length} items to Google Drive:`, migrated)
      return migrated.length > 0
    } catch (error) {
      console.error('Migration failed:', error)
      return false
    }
  }

  // Sign out and clear tokens
  signOut() {
    this.accessToken = null
    this.refreshToken = null
    this.appFolderId = null

    try {
      localStorage.removeItem('google_drive_access_token')
      localStorage.removeItem('google_drive_refresh_token')
      localStorage.removeItem('google_drive_app_folder_id')
    } catch (error) {
      console.warn('Could not clear stored tokens:', error)
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService()

// Utility functions
export const authenticateGoogleDrive = () => googleDriveService.authenticate()
export const saveToGoogleDrive = (key: string, data: any) => googleDriveService.saveWorkspaceData(key, data)
export const loadFromGoogleDrive = (key: string) => googleDriveService.loadWorkspaceData(key)
export const migrateToGoogleDrive = () => googleDriveService.migrateFromLocalStorage()
export const isGoogleDriveAuthenticated = () => googleDriveService.isAuthenticated()
export const signOutGoogleDrive = () => googleDriveService.signOut()