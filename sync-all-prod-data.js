// Comprehensive script to sync ALL production data to local environment
// Run this in browser console while on localhost:3000

console.log('🚀 Starting comprehensive production data sync...')

// 1. Apply production settings first
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

async function syncProductionData() {
  try {
    console.log('⚙️ Step 1: Applying production settings...')
    localStorage.setItem('nishen-workspace-settings', JSON.stringify(prodSettings))
    console.log('✅ Settings applied')

    console.log('📄 Step 2: Loading merged workspace data...')

    // You'll need to copy the content of merged-workspace-data.json here
    // This script provides the framework - you can paste the actual data when running

    console.log('📋 Available production data files found:')
    console.log('- nishen-workspace-settings-2025-09-29.json ✅ Applied')
    console.log('- merged-workspace-data.json (needs manual import)')
    console.log('- production-workspace-data.json (needs manual import)')
    console.log('- production-workspace-data-2025-09-28T23-43-36-817Z.json (backup)')

    console.log('\n🔄 To complete sync, please:')
    console.log('1. Open merged-workspace-data.json in text editor')
    console.log('2. Copy its contents')
    console.log('3. Run: syncWorkspaceData(copiedData) in console')

    // Trigger settings update
    window.dispatchEvent(new Event('storage'))

    return true

  } catch (error) {
    console.error('❌ Sync failed:', error)
    return false
  }
}

// Helper function to apply workspace data
window.syncWorkspaceData = function(workspaceData) {
  try {
    console.log('📦 Importing workspace data...')

    if (typeof workspaceData === 'string') {
      workspaceData = JSON.parse(workspaceData)
    }

    let importCount = 0

    // Apply each workspace data item
    Object.entries(workspaceData).forEach(([key, value]) => {
      if (key.startsWith('nishen-workspace-')) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
          importCount++
          console.log(`✅ Imported: ${key}`)
        } catch (e) {
          console.warn(`⚠️ Failed to import ${key}:`, e.message)
        }
      }
    })

    console.log(`🎉 Successfully imported ${importCount} workspace items!`)
    console.log('🔄 Triggering app refresh...')

    // Trigger full app refresh
    window.dispatchEvent(new Event('storage'))

    return true
  } catch (error) {
    console.error('❌ Workspace data import failed:', error)
    return false
  }
}

// Start the sync process
syncProductionData().then(success => {
  if (success) {
    console.log('\n🌟 Production settings sync complete!')
    console.log('💾 Next: Import workspace data using syncWorkspaceData(data)')
  }
})

// Quick verification function
window.verifySync = function() {
  console.log('🔍 Verification Report:')
  console.log('Settings:', localStorage.getItem('nishen-workspace-settings') ? '✅' : '❌')
  console.log('Scripts:', localStorage.getItem('nishen-workspace-scripts') ? '✅' : '❌')
  console.log('Notes:', localStorage.getItem('nishen-workspace-notes') ? '✅' : '❌')
  console.log('Files:', localStorage.getItem('nishen-workspace-files') ? '✅' : '❌')
  console.log('Prod:', localStorage.getItem('nishen-workspace-prod') ? '✅' : '❌')
}