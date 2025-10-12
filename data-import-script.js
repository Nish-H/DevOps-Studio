// =============================================================================
// DevOps Studio Data Import Script  
// Run this in browser console on https://dev-ops-studio-jwre.vercel.app/
// AFTER authentication is implemented
// =============================================================================

// Paste your exported data here (replace the {} with your actual export data)
const importData = {}; // REPLACE THIS WITH YOUR EXPORTED DATA

(function() {
    console.log('🔄 Starting data import...');
    
    if (!importData.timestamp) {
        console.error('❌ No valid import data found. Please paste your exported data.');
        return;
    }
    
    // Create backup of existing data
    const existingBackup = {};
    Object.keys(localStorage).filter(key => key.includes('nishen-workspace')).forEach(key => {
        existingBackup[key] = localStorage.getItem(key);
    });
    
    if (Object.keys(existingBackup).length > 0) {
        console.log('⚠️  Found existing data - creating backup first...');
        localStorage.setItem('nishen-workspace-pre-import-backup', JSON.stringify({
            timestamp: new Date().toISOString(),
            data: existingBackup
        }));
    }
    
    // Import all data
    let importCount = 0;
    Object.keys(importData).forEach(key => {
        if (key !== 'timestamp' && key !== 'allKeys' && importData[key]) {
            const storageKey = key.startsWith('nishen-workspace-') ? key : 'nishen-workspace-' + key;
            localStorage.setItem(storageKey, importData[key]);
            importCount++;
            console.log('✓ Imported: ' + key);
        }
    });
    
    console.log('✅ Import complete! Imported ' + importCount + ' data sets.');
    console.log('🔄 Please refresh the page to see your imported data.');
    console.log('📦 Pre-import backup saved as: nishen-workspace-pre-import-backup');
    
})();