// Script to sync production settings to local environment
// Run this in browser console while on localhost:3000

const prodSettings = {
  "theme": "dark",
  "accentColor": "red",
  "customAccentColor": "#6366f1",
  "fontSize": "medium",
  "animations": true,
  "compactMode": false,
  "backgroundTheme": "default",
  "enableNotifications": true,
  "soundEnabled": true,
  "notificationTypes": {
    "system": true,
    "security": true,
    "tools": true,
    "files": false
  },
  "autoSave": true,
  "autoSaveInterval": 5,
  "maxHistoryItems": 100,
  "enableSystemMonitoring": true,
  "monitoringInterval": 3,
  "encryptData": false,
  "autoLock": false,
  "autoLockTime": 30,
  "clearDataOnExit": false,
  "anonymousUsage": false,
  "debugMode": false,
  "developerTools": false,
  "experimentalFeatures": false,
  "customCSS": "",
  "backupLocation": "./backups",
  "timerAutoStart": false,
  "timerShowInHeader": true,
  "timerFormat": "24h",
  "timerPersistOnRefresh": true
}

console.log('🔄 Syncing production settings to local environment...')

try {
  // Apply settings to localStorage
  localStorage.setItem('nishen-workspace-settings', JSON.stringify(prodSettings))

  console.log('✅ Production settings applied successfully!')
  console.log('📊 Settings applied:', Object.keys(prodSettings).length, 'configuration items')

  // Show current accent color
  console.log('🎨 Accent color:', prodSettings.accentColor)
  console.log('🎯 Custom accent color:', prodSettings.customAccentColor)

  // Trigger settings context update by dispatching storage event
  window.dispatchEvent(new Event('storage'))

  console.log('🔄 Page refresh recommended to see all changes')

} catch (error) {
  console.error('❌ Failed to sync settings:', error)
}

// Verification function
console.log('\n📋 To verify settings were applied, run: localStorage.getItem("nishen-workspace-settings")')