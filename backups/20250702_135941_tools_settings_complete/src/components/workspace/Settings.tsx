'use client'

import { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Palette, 
  Monitor, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Zap,
  Moon,
  Sun,
  Cpu,
  HardDrive,
  Wifi,
  User,
  Key,
  Globe,
  Clock,
  FileText,
  Terminal as TerminalIcon,
  Sliders,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

interface WorkspaceSettings {
  // Appearance
  theme: 'dark' | 'light' | 'auto'
  accentColor: 'red' | 'orange' | 'green' | 'custom'
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
}

export default function Settings() {
  const [settings, setSettings] = useState<WorkspaceSettings>({
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
    backupLocation: './backups'
  })
  
  const [activeTab, setActiveTab] = useState('appearance')
  const [hasChanges, setHasChanges] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('nishen-workspace-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('nishen-workspace-settings', JSON.stringify(settings))
      setHasChanges(false)
      // Show success notification
      setTimeout(() => {
        // Could integrate with a toast system here
      }, 100)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        newSettings[parent as keyof WorkspaceSettings] = {
          ...newSettings[parent as keyof WorkspaceSettings],
          [child]: value
        }
      } else {
        newSettings[key as keyof WorkspaceSettings] = value
      }
      return newSettings
    })
    setHasChanges(true)
  }

  const resetSettings = () => {
    localStorage.removeItem('nishen-workspace-settings')
    window.location.reload()
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nishen-workspace-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          setHasChanges(true)
        } catch (error) {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'performance', name: 'Performance', icon: <Cpu className="w-4 h-4" /> },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', name: 'Data Management', icon: <Database className="w-4 h-4" /> },
    { id: 'advanced', name: 'Advanced', icon: <Sliders className="w-4 h-4" /> }
  ]

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    description?: string
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-white">{label}</div>
        {description && <div className="text-sm text-gray-400 mt-1">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-neon-green' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Theme & Colors
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                { value: 'auto', label: 'Auto', icon: <Monitor className="w-4 h-4" /> }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('theme', option.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${
                    settings.theme === option.value
                      ? 'border-neon-green bg-neon-green/20 text-neon-green'
                      : 'border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'red', label: 'Neon Red', color: '#ff073a' },
                { value: 'orange', label: 'Burnt Orange', color: '#cc5500' },
                { value: 'green', label: 'Neon Green', color: '#00ff41' },
                { value: 'custom', label: 'Custom', color: '#6366f1' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('accentColor', option.value)}
                  className={`p-3 rounded-lg border text-xs font-medium transition-colors ${
                    settings.accentColor === option.value
                      ? 'border-neon-green bg-neon-green/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
            <select
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green"
            >
              <option value="small">Small (12px)</option>
              <option value="medium">Medium (14px)</option>
              <option value="large">Large (16px)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4">Interface Options</h3>
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.animations}
            onChange={(checked) => updateSetting('animations', checked)}
            label="Enable Animations"
            description="Show smooth transitions and neon pulse effects"
          />
          <ToggleSwitch
            checked={settings.compactMode}
            onChange={(checked) => updateSetting('compactMode', checked)}
            label="Compact Mode"
            description="Reduce spacing and padding for more content"
          />
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.enableNotifications}
            onChange={(checked) => updateSetting('enableNotifications', checked)}
            label="Enable Notifications"
            description="Show desktop notifications for important events"
          />
          <ToggleSwitch
            checked={settings.soundEnabled}
            onChange={(checked) => updateSetting('soundEnabled', checked)}
            label="Sound Notifications"
            description="Play sounds for alerts and completion events"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4">Notification Types</h3>
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.notificationTypes.system}
            onChange={(checked) => updateSetting('notificationTypes.system', checked)}
            label="System Alerts"
            description="Resource usage, performance warnings"
          />
          <ToggleSwitch
            checked={settings.notificationTypes.security}
            onChange={(checked) => updateSetting('notificationTypes.security', checked)}
            label="Security Alerts"
            description="Security scans, vulnerability warnings"
          />
          <ToggleSwitch
            checked={settings.notificationTypes.tools}
            onChange={(checked) => updateSetting('notificationTypes.tools', checked)}
            label="Tool Completion"
            description="Tool execution results and status updates"
          />
          <ToggleSwitch
            checked={settings.notificationTypes.files}
            onChange={(checked) => updateSetting('notificationTypes.files', checked)}
            label="File Operations"
            description="File saves, version creations, and changes"
          />
        </div>
      </div>
    </div>
  )

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2" />
          Performance & Auto-Save
        </h3>
        
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.autoSave}
            onChange={(checked) => updateSetting('autoSave', checked)}
            label="Auto-Save"
            description="Automatically save changes to prevent data loss"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Auto-Save Interval: {settings.autoSaveInterval} minutes
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.autoSaveInterval}
              onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max History Items: {settings.maxHistoryItems}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={settings.maxHistoryItems}
              onChange={(e) => updateSetting('maxHistoryItems', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4">System Monitoring</h3>
        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.enableSystemMonitoring}
            onChange={(checked) => updateSetting('enableSystemMonitoring', checked)}
            label="Enable System Monitoring"
            description="Real-time CPU, memory, and network monitoring"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Update Interval: {settings.monitoringInterval} seconds
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.monitoringInterval}
              onChange={(e) => updateSetting('monitoringInterval', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy & Security
        </h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.encryptData}
            onChange={(checked) => updateSetting('encryptData', checked)}
            label="Encrypt Local Data"
            description="Encrypt files and notes stored locally"
          />
          <ToggleSwitch
            checked={settings.autoLock}
            onChange={(checked) => updateSetting('autoLock', checked)}
            label="Auto-Lock Workspace"
            description="Lock workspace after period of inactivity"
          />
          <ToggleSwitch
            checked={settings.clearDataOnExit}
            onChange={(checked) => updateSetting('clearDataOnExit', checked)}
            label="Clear Data on Exit"
            description="Remove temporary files when closing workspace"
          />
          <ToggleSwitch
            checked={settings.anonymousUsage}
            onChange={(checked) => updateSetting('anonymousUsage', checked)}
            label="Anonymous Usage Analytics"
            description="Help improve the workspace by sharing anonymous usage data"
          />
        </div>
      </div>
      
      {settings.autoLock && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Auto-Lock Time: {settings.autoLockTime} minutes
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={settings.autoLockTime}
            onChange={(e) => updateSetting('autoLockTime', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Data Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowExportModal(true)}
            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-neon-green transition-colors"
          >
            <Download className="w-6 h-6 text-neon-green mx-auto mb-2" />
            <div className="font-medium">Export Settings</div>
            <div className="text-sm text-gray-400">Download current configuration</div>
          </button>
          
          <label className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-neon-green transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-burnt-orange mx-auto mb-2" />
            <div className="font-medium">Import Settings</div>
            <div className="text-sm text-gray-400">Upload configuration file</div>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setShowResetModal(true)}
            className="p-4 bg-gray-800 border border-red-500/50 rounded-lg hover:border-red-500 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="font-medium text-red-400">Reset Settings</div>
            <div className="text-sm text-gray-400">Restore default configuration</div>
          </button>
          
          <button className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-neon-green transition-colors">
            <Trash2 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="font-medium">Clear Cache</div>
            <div className="text-sm text-gray-400">Remove temporary files</div>
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4">Backup Location</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={settings.backupLocation}
            onChange={(e) => updateSetting('backupLocation', e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green"
            placeholder="./backups"
          />
          <button className="px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green-bright transition-colors">
            Browse
          </button>
        </div>
      </div>
    </div>
  )

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4 flex items-center">
          <Sliders className="w-5 h-5 mr-2" />
          Advanced Options
        </h3>
        
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.debugMode}
            onChange={(checked) => updateSetting('debugMode', checked)}
            label="Debug Mode"
            description="Enable detailed logging and error reporting"
          />
          <ToggleSwitch
            checked={settings.developerTools}
            onChange={(checked) => updateSetting('developerTools', checked)}
            label="Developer Tools"
            description="Show advanced debugging and development features"
          />
          <ToggleSwitch
            checked={settings.experimentalFeatures}
            onChange={(checked) => updateSetting('experimentalFeatures', checked)}
            label="Experimental Features"
            description="Enable beta features and early previews"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-neon-green mb-4">Custom CSS</h3>
        <textarea
          value={settings.customCSS}
          onChange={(e) => updateSetting('customCSS', e.target.value)}
          className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-neon-green"
          placeholder="/* Add your custom CSS here */&#10;.custom-style {&#10;  color: #00ff41;&#10;}"
        />
        <p className="text-xs text-gray-400 mt-2">
          Advanced users only. Invalid CSS may break the interface.
        </p>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance': return renderAppearanceSettings()
      case 'notifications': return renderNotificationSettings()
      case 'performance': return renderPerformanceSettings()
      case 'privacy': return renderPrivacySettings()
      case 'data': return renderDataSettings()
      case 'advanced': return renderAdvancedSettings()
      default: return renderAppearanceSettings()
    }
  }

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Settings Categories */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-neon-red flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-neon-green neon-pulse" />
            Settings
          </h2>
          <p className="text-xs text-gray-400 mt-1">Customize your workspace</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                    : 'text-gray-300 hover:bg-gray-800 border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </nav>
        
        {/* Save Button */}
        {hasChanges && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={saveSettings}
              className="w-full bg-neon-green text-black px-4 py-2 rounded-lg font-medium hover:bg-neon-green-bright transition-colors flex items-center justify-center neon-glow-green"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {tabs.find(t => t.id === activeTab)?.name}
              </h2>
              <p className="text-gray-400">
                Configure your workspace preferences and behavior
              </p>
            </div>
            
            {hasChanges && (
              <div className="flex items-center space-x-2 text-sm bg-neon-green/10 border border-neon-green/30 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-neon-green" />
                <span className="text-neon-green">Unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-red-500/50">
            <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Reset Settings
            </h3>
            <p className="text-gray-300 mb-6">
              This will reset all settings to their default values. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetSettings}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-neon-green/50">
            <h3 className="text-lg font-semibold mb-4 text-neon-green flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export Settings
            </h3>
            <p className="text-gray-300 mb-6">
              Download your current workspace settings as a JSON file. You can import this file later to restore your preferences.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportSettings}
                className="px-4 py-2 bg-neon-green text-black rounded transition-colors hover:bg-neon-green-bright"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}