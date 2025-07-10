'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface WorkspaceSettings {
  // Appearance
  theme: 'dark' | 'light' | 'auto'
  accentColor: 'red' | 'silver' | 'green' | 'custom'
  fontSize: 'small' | 'medium' | 'large'
  animations: boolean
  compactMode: boolean
  
  // Notifications
  enableNotifications: boolean
  soundEnabled: boolean
  notificationTypes: {
    system: boolean
    security: boolean
    tools: boolean
    files: boolean
  }
  
  // Performance
  autoSave: boolean
  autoSaveInterval: number // minutes
  maxHistoryItems: number
  enableSystemMonitoring: boolean
  monitoringInterval: number // seconds
  
  // Privacy & Security
  encryptData: boolean
  autoLock: boolean
  autoLockTime: number // minutes
  clearDataOnExit: boolean
  anonymousUsage: boolean
  
  // Advanced
  debugMode: boolean
  developerTools: boolean
  experimentalFeatures: boolean
  customCSS: string
  backupLocation: string
  
  // Timer Configuration
  timerAutoStart: boolean
  timerShowInHeader: boolean
  timerFormat: '12h' | '24h' | 'seconds'
  timerPersistOnRefresh: boolean
}

interface SettingsContextType {
  settings: WorkspaceSettings
  updateSetting: (key: string, value: any) => void
  resetSettings: () => void
  exportSettings: () => void
  importSettings: (settings: WorkspaceSettings) => void
  applyTheme: () => void
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const defaultSettings: WorkspaceSettings = {
  // Appearance defaults
  theme: 'dark',
  accentColor: 'red',
  fontSize: 'medium',
  animations: true,
  compactMode: false,
  
  // Notifications defaults
  enableNotifications: true,
  soundEnabled: true,
  notificationTypes: {
    system: true,
    security: true,
    tools: true,
    files: false
  },
  
  // Performance defaults
  autoSave: true,
  autoSaveInterval: 5,
  maxHistoryItems: 100,
  enableSystemMonitoring: true,
  monitoringInterval: 3,
  
  // Privacy defaults
  encryptData: false,
  autoLock: false,
  autoLockTime: 30,
  clearDataOnExit: false,
  anonymousUsage: false,
  
  // Advanced defaults
  debugMode: false,
  developerTools: false,
  experimentalFeatures: false,
  customCSS: '',
  backupLocation: './backups',
  
  // Timer defaults
  timerAutoStart: false,
  timerShowInHeader: true,
  timerFormat: '24h',
  timerPersistOnRefresh: true
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('nishen-workspace-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    // Apply initial theme
    setTimeout(() => {
      applyTheme()
      applyFontSize()
      applyAnimations()
    }, 100)
  }, [])

  // Apply theme to document
  const applyTheme = () => {
    const root = document.documentElement
    const { theme, accentColor } = settings

    console.log('Applying theme:', theme, 'accent:', accentColor) // Debug log

    // Handle system theme preference
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
      root.classList.toggle('light', theme === 'light')
    }

    // Apply accent color to CSS variables
    const accentColors = {
      red: { primary: '#ff073a', secondary: '#ff1744' },
      silver: { primary: '#8B9499', secondary: '#A5ACB1' },
      green: { primary: '#00CC33', secondary: '#00E639' },
      custom: { primary: '#6366f1', secondary: '#818cf8' }
    }

    const colors = accentColors[accentColor]
    root.style.setProperty('--accent-primary', colors.primary)
    root.style.setProperty('--accent-secondary', colors.secondary)
    
    // Update main accent colors based on selection
    root.style.setProperty('--neon-red', colors.primary)
    root.style.setProperty('--neon-red-bright', colors.secondary)
    
    // Update related color variables  
    if (accentColor === 'green') {
      root.style.setProperty('--neon-green', colors.primary)
      root.style.setProperty('--neon-green-bright', colors.secondary)
    } else if (accentColor === 'silver') {
      root.style.setProperty('--british-silver', colors.primary)
      root.style.setProperty('--british-silver-bright', colors.secondary)
    }
    
    // Update primary accent for components to use
    root.style.setProperty('--primary-accent', colors.primary)
    root.style.setProperty('--secondary-accent', colors.secondary)
  }

  // Apply font size
  const applyFontSize = () => {
    const root = document.documentElement
    const fontSizes = {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
    root.style.setProperty('--base-font-size', fontSizes[settings.fontSize])
    root.style.fontSize = fontSizes[settings.fontSize]
  }

  // Apply custom CSS
  const applyCustomCSS = () => {
    let styleElement = document.getElementById('custom-workspace-css')
    
    if (settings.customCSS.trim()) {
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = 'custom-workspace-css'
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = settings.customCSS
    } else if (styleElement) {
      styleElement.remove()
    }
  }

  // Apply animation preferences
  const applyAnimations = () => {
    const root = document.documentElement
    if (settings.animations) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }
  }

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nishen-workspace-settings', JSON.stringify(settings))
      applyTheme()
      applyFontSize()
      applyCustomCSS()
      applyAnimations()
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }, [settings])

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev } as any
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        newSettings[parent] = {
          ...newSettings[parent],
          [child]: value
        }
      } else {
        newSettings[key] = value
      }
      return newSettings as WorkspaceSettings
    })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('nishen-workspace-settings')
    // Force page reload to ensure all changes apply
    setTimeout(() => window.location.reload(), 100)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nishen-workspace-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showNotification('Settings exported successfully!', 'success')
  }

  const importSettings = (newSettings: WorkspaceSettings) => {
    setSettings({ ...defaultSettings, ...newSettings })
    showNotification('Settings imported successfully!', 'success')
  }


  // Notification system
  const showNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (!settings.enableNotifications) return

    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-neon-green text-black border border-neon-green' :
      type === 'error' ? 'bg-red-500 text-white border border-red-600' :
      type === 'warning' ? 'bg-burnt-orange text-white border border-burnt-orange-bright' :
      'bg-gray-800 text-white border border-gray-700'
    }`
    notification.textContent = message

    document.body.appendChild(notification)

    // Slide in
    setTimeout(() => {
      notification.classList.remove('translate-x-full')
    }, 100)

    // Play sound if enabled
    if (settings.soundEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBSuZx/LKey4FKHbJ8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0+ltTx1H8oByB8yO/1bSUFJXfH8OGVPQkSYrXr6KxLEQ0=')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ignore autoplay policy errors
      } catch (error) {
        // Ignore audio errors
      }
    }

    // Slide out and remove
    setTimeout(() => {
      notification.classList.add('translate-x-full')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      exportSettings,
      importSettings,
      applyTheme,
      showNotification
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}