// Browser script to load merged data into localStorage
// Run this in your browser console after starting local development server

const loadMergedData = async () => {
    try {
        // You'll need to manually paste the merged data here
        // or serve it as a JSON endpoint
        console.log('ℹ️ Please load merged-workspace-data.json manually');
        console.log('📋 Copy the contents and run: loadDataIntoLocalStorage(data)');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
};

const loadDataIntoLocalStorage = (data) => {
    Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
        console.log('✅ Loaded:', key);
    });
    console.log('🔄 Refresh the page to see merged data');
    window.location.reload();
};

// Usage:
// 1. Copy contents of merged-workspace-data.json
// 2. Run: loadDataIntoLocalStorage(YOUR_DATA_OBJECT)
console.log('💡 Use loadDataIntoLocalStorage(data) to load merged data');