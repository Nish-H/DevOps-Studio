// Complete Data Export Utility for Migration
// This script extracts all localStorage data from your DevOps Studio

const fs = require('fs');
const path = require('path');

// Create comprehensive data export
function createDataExport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportDir = `secure-migration-backup-${timestamp.slice(0, 15)}`;
    
    // Data export template - user will run this in browser console
    const browserScript = `
// =============================================================================
// DevOps Studio Complete Data Export Script
// Run this in your browser console while on your local DevOps Studio
// =============================================================================

(function() {
    console.log('🔄 Starting complete data export...');
    
    const exportData = {
        timestamp: new Date().toISOString(),
        notes: localStorage.getItem('nishen-workspace-notes'),
        noteCategories: localStorage.getItem('nishen-workspace-note-categories'),
        files: localStorage.getItem('nishen-workspace-files'),
        fileBrowser: localStorage.getItem('nishen-workspace-file-browser'),
        prodData: localStorage.getItem('nishen-workspace-prod-data'),
        urlLinks: localStorage.getItem('nishen-workspace-url-links'),
        urlCategories: localStorage.getItem('nishen-workspace-url-categories'),
        prompts: localStorage.getItem('nishen-workspace-prompts'),
        promptCategories: localStorage.getItem('nishen-workspace-prompt-categories'),
        settings: localStorage.getItem('nishen-workspace-settings'),
        tools: localStorage.getItem('nishen-workspace-tools'),
        backups: localStorage.getItem('nishen-workspace-backups'),
        allKeys: Object.keys(localStorage).filter(key => key.includes('nishen-workspace'))
    };
    
    // Calculate data size
    const dataSize = JSON.stringify(exportData).length;
    
    console.log('📊 Data export summary:');
    console.log('- Notes:', exportData.notes ? 'Found' : 'Empty');
    console.log('- Files:', exportData.files ? 'Found' : 'Empty');
    console.log('- Settings:', exportData.settings ? 'Found' : 'Empty');
    console.log('- All keys found:', exportData.allKeys.length);
    console.log('- Total size:', (dataSize / 1024).toFixed(2), 'KB');
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`devops-studio-data-export-\${new Date().toISOString().slice(0,10)}.json\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Export complete! File downloaded.');
    console.log('🔐 Keep this file safe - it contains ALL your workspace data');
    
    return exportData;
})();
`;

    // Data import template for online version
    const importScript = `
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
    
    console.log(\`✅ Import complete! Imported \${importCount} data sets.`);
    console.log('🔄 Please refresh the page to see your imported data.');
    console.log('📦 Pre-import backup saved as: nishen-workspace-pre-import-backup');
    
})();
`;

    return {
        exportScript: browserScript,
        importScript: importScript
    };
}

// Write the scripts
const scripts = createDataExport();

// Write export script
const exportPath = path.join(__dirname, 'data-export-script.js');
fs.writeFileSync(exportPath, scripts.exportScript);

// Write import script  
const importPath = path.join(__dirname, 'data-import-script.js');
fs.writeFileSync(importPath, scripts.importScript);

console.log('✅ Data migration scripts created:');
console.log('📤 Export script:', exportPath);
console.log('📥 Import script:', importPath);
console.log('');
console.log('Next steps:');
console.log('1. Open your local DevOps Studio in browser');
console.log('2. Open browser console (F12)');
console.log('3. Copy/paste the export script content');
console.log('4. Download will start automatically');
console.log('5. Keep the JSON file safe for import to online version');