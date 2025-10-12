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
    a.download = 'devops-studio-data-export-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Export complete! File downloaded.');
    console.log('🔐 Keep this file safe - it contains ALL your workspace data');
    
    return exportData;
})();