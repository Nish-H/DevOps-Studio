// Production Data Merge Script
// Safely merges production workspace data with Scripts Repository implementation

const fs = require('fs');
const path = require('path');

class ProductionDataMerger {
    constructor() {
        this.productionDataFile = './production-workspace-data.json';
        this.localScriptsFile = './imported-scripts.json';
        this.localCategoriesFile = './imported-categories.json';
        this.outputFile = './merged-workspace-data.json';
    }

    async mergeData() {
        console.log('🔄 Starting production data merge...');

        // Check if production data exists
        if (!fs.existsSync(this.productionDataFile)) {
            console.error('❌ Production data file not found!');
            console.log('📋 Please extract production data first using the browser console script');
            console.log('💡 See CRITICAL-DATA-PROTECTION-PLAN.md for instructions');
            return false;
        }

        try {
            // Load production data
            const productionData = JSON.parse(fs.readFileSync(this.productionDataFile, 'utf8'));
            console.log('✅ Loaded production data');
            console.log('🔍 Production localStorage keys:', Object.keys(productionData));

            // Load local Scripts Repository data
            let localScripts = [];
            let localCategories = [];

            if (fs.existsSync(this.localScriptsFile)) {
                localScripts = JSON.parse(fs.readFileSync(this.localScriptsFile, 'utf8'));
                console.log('✅ Loaded local scripts:', localScripts.length, 'scripts');
            }

            if (fs.existsSync(this.localCategoriesFile)) {
                localCategories = JSON.parse(fs.readFileSync(this.localCategoriesFile, 'utf8'));
                console.log('✅ Loaded local categories:', localCategories.length, 'categories');
            }

            // Perform the merge
            const mergedData = this.performMerge(productionData, localScripts, localCategories);

            // Save merged data
            fs.writeFileSync(this.outputFile, JSON.stringify(mergedData, null, 2));
            console.log('💾 Merged data saved to:', this.outputFile);

            // Generate report
            this.generateMergeReport(productionData, mergedData);

            return true;

        } catch (error) {
            console.error('❌ Error during merge:', error.message);
            return false;
        }
    }

    performMerge(productionData, localScripts, localCategories) {
        const merged = {};

        // Start with all production data (priority)
        console.log('🔄 Copying production data...');
        Object.keys(productionData).forEach(key => {
            merged[key] = productionData[key];
        });

        // Handle Scripts Repository data
        console.log('🔄 Merging Scripts Repository data...');

        // Categories - merge local with production if exists
        if (!merged['nishen-workspace-script-categories']) {
            merged['nishen-workspace-script-categories'] = localCategories;
            console.log('✅ Added new script categories');
        } else {
            // Merge categories - keep production, add missing local ones
            const existingCategoryIds = merged['nishen-workspace-script-categories'].map(cat => cat.id);
            const newCategories = localCategories.filter(cat => !existingCategoryIds.includes(cat.id));

            if (newCategories.length > 0) {
                merged['nishen-workspace-script-categories'] = [...merged['nishen-workspace-script-categories'], ...newCategories];
                console.log('✅ Merged', newCategories.length, 'new categories');
            }
        }

        // Scripts - merge local with production if exists
        if (!merged['nishen-workspace-scripts']) {
            merged['nishen-workspace-scripts'] = localScripts;
            console.log('✅ Added new scripts repository');
        } else {
            // Merge scripts - keep production, add new local ones with unique IDs
            const existingScriptIds = merged['nishen-workspace-scripts'].map(s => s.id);
            const newScripts = localScripts.filter(s => !existingScriptIds.includes(s.id));

            // Ensure unique IDs for new scripts
            newScripts.forEach(script => {
                if (existingScriptIds.includes(script.id)) {
                    script.id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
            });

            if (newScripts.length > 0) {
                merged['nishen-workspace-scripts'] = [...merged['nishen-workspace-scripts'], ...newScripts];
                console.log('✅ Merged', newScripts.length, 'new scripts');
            } else {
                console.log('ℹ️ No new scripts to merge (all already exist)');
            }
        }

        // Update category counts
        if (merged['nishen-workspace-script-categories'] && merged['nishen-workspace-scripts']) {
            merged['nishen-workspace-script-categories'].forEach(category => {
                category.count = merged['nishen-workspace-scripts'].filter(script => script.category === category.id).length;
            });
            console.log('✅ Updated category counts');
        }

        return merged;
    }

    generateMergeReport(productionData, mergedData) {
        console.log('\n📊 MERGE REPORT');
        console.log('================');

        console.log('\n🔍 Production Data:');
        Object.keys(productionData).forEach(key => {
            const data = productionData[key];
            if (Array.isArray(data)) {
                console.log(`  ${key}: ${data.length} items`);
            } else if (typeof data === 'object') {
                console.log(`  ${key}: object with ${Object.keys(data).length} properties`);
            } else {
                console.log(`  ${key}: ${typeof data}`);
            }
        });

        console.log('\n🔗 Merged Data:');
        Object.keys(mergedData).forEach(key => {
            const data = mergedData[key];
            if (Array.isArray(data)) {
                console.log(`  ${key}: ${data.length} items`);
            } else if (typeof data === 'object') {
                console.log(`  ${key}: object with ${Object.keys(data).length} properties`);
            } else {
                console.log(`  ${key}: ${typeof data}`);
            }
        });

        // Scripts Repository specific report
        if (mergedData['nishen-workspace-scripts']) {
            console.log('\n🔧 Scripts Repository:');
            console.log(`  Total scripts: ${mergedData['nishen-workspace-scripts'].length}`);

            const scriptsByCategory = {};
            mergedData['nishen-workspace-scripts'].forEach(script => {
                scriptsByCategory[script.category] = (scriptsByCategory[script.category] || 0) + 1;
            });

            Object.keys(scriptsByCategory).forEach(category => {
                console.log(`  ${category}: ${scriptsByCategory[category]} scripts`);
            });
        }

        console.log('\n✅ Merge completed successfully!');
        console.log('📂 Next step: Load merged data into local workspace for testing');
        console.log('⚠️  Only push to GitHub after verifying everything works locally');
    }

    generateBrowserScript() {
        const script = `
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
        `;

        fs.writeFileSync('./load-merged-data-browser.js', script.trim());
        console.log('📝 Created browser loading script: load-merged-data-browser.js');
    }
}

// Command line interface
if (require.main === module) {
    const merger = new ProductionDataMerger();

    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Production Data Merger Usage:

1. Extract production data:
   - Open https://dev-ops-studio-jwre.vercel.app/
   - Run the extraction script from CRITICAL-DATA-PROTECTION-PLAN.md
   - Save as production-workspace-data.json

2. Run merge:
   node merge-production-data.js

3. Test locally:
   - Start dev server: npm run dev
   - Load merged data using browser script
   - Verify all data is preserved + Scripts Repository works

4. Deploy safely:
   - Only after local testing passes
   - git add . && git commit && git push
        `);
        process.exit(0);
    }

    merger.mergeData().then(success => {
        if (success) {
            merger.generateBrowserScript();
            console.log('\n🎯 Ready for local testing!');
        } else {
            console.log('\n❌ Merge failed - check errors above');
            process.exit(1);
        }
    });
}

module.exports = ProductionDataMerger;