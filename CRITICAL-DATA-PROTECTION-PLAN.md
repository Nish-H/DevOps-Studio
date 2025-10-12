# 🚨 CRITICAL DATA PROTECTION PLAN

## Production Workspace Data Preservation

**Live URL**: https://dev-ops-studio-jwre.vercel.app/
**Risk**: Production data loss when pushing Scripts Repository updates
**Solution**: Safe data extraction and merging process

## 📋 Step-by-Step Safe Deployment

### STEP 1: Extract Production Data (CRITICAL)

**BEFORE** pushing any changes, you must extract your production data:

#### Option A: Browser Console Extraction (RECOMMENDED)
1. **Open your live workspace**: https://dev-ops-studio-jwre.vercel.app/
2. **Open Browser Developer Tools** (F12)
3. **Go to Console tab**
4. **Run this data extraction script**:

```javascript
// Production Data Extraction Script
const extractWorkspaceData = () => {
    const allData = {};

    // Extract all localStorage keys that start with 'nishen-workspace'
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nishen-workspace')) {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key);
            }
        }
    }

    // Also check for any other workspace-related keys
    const possibleKeys = [
        'workspace-notes', 'workspace-files', 'workspace-scripts',
        'workspace-settings', 'workspace-tools', 'workspace-links',
        'workspace-prompts', 'devops-studio', 'claude-code'
    ];

    possibleKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                allData[key] = JSON.parse(value);
            } catch (e) {
                allData[key] = value;
            }
        }
    });

    console.log('🔍 Found localStorage keys:', Object.keys(allData));
    console.log('📊 Total data size:', JSON.stringify(allData).length, 'characters');

    // Download as JSON file
    const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'production-workspace-data-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return allData;
};

// Run the extraction
const productionData = extractWorkspaceData();
```

5. **Download the JSON file** that gets generated
6. **Save it safely** - this contains ALL your production data

#### Option B: Manual Navigation Check
1. Navigate through all tabs in your live workspace:
   - Notes (check how many notes, categories)
   - Files/Dev (check projects and files)
   - Prod (check production data)
   - Tools (check tools and configurations)
   - Links (check saved links)
   - Prompts (check saved prompts)
   - Settings (check configurations)

2. **Take screenshots** of key sections showing data counts

### STEP 2: Merge Production Data with Local Implementation

Once you have the production data:

1. **Create the merge script**:

```javascript
// File: merge-production-data.js
const fs = require('fs');

// Load your production data (from extracted JSON)
const productionData = JSON.parse(fs.readFileSync('./production-workspace-data.json', 'utf8'));

// Load local demo data
const localScripts = JSON.parse(fs.readFileSync('./imported-scripts.json', 'utf8'));
const localCategories = JSON.parse(fs.readFileSync('./imported-categories.json', 'utf8'));

// Merge function
const mergeData = () => {
    const merged = {};

    // Start with production data (priority)
    Object.keys(productionData).forEach(key => {
        merged[key] = productionData[key];
    });

    // Add local Scripts Repository data if not exists in production
    if (!merged['nishen-workspace-scripts']) {
        merged['nishen-workspace-scripts'] = localScripts;
    } else {
        // Merge scripts - keep production, add new local ones with different IDs
        const existingIds = merged['nishen-workspace-scripts'].map(s => s.id);
        const newScripts = localScripts.filter(s => !existingIds.includes(s.id));
        merged['nishen-workspace-scripts'] = [...merged['nishen-workspace-scripts'], ...newScripts];
    }

    if (!merged['nishen-workspace-script-categories']) {
        merged['nishen-workspace-script-categories'] = localCategories;
    }

    // Update category counts
    if (merged['nishen-workspace-script-categories'] && merged['nishen-workspace-scripts']) {
        merged['nishen-workspace-script-categories'].forEach(category => {
            category.count = merged['nishen-workspace-scripts'].filter(script => script.category === category.id).length;
        });
    }

    return merged;
};

// Create merged data
const mergedData = mergeData();

// Save merged data for local testing
fs.writeFileSync('./merged-workspace-data.json', JSON.stringify(mergedData, null, 2));

console.log('✅ Merged data created - Ready for local testing');
console.log('📊 Total localStorage keys:', Object.keys(mergedData).length);

module.exports = mergedData;
```

### STEP 3: Test Locally with Production Data

2. **Load merged data into local workspace**:
   - Copy merged data to localStorage
   - Test all sections work correctly
   - Verify Scripts Repository appears alongside existing data
   - Ensure no data is lost

### STEP 4: Safe GitHub Push

Only after verifying everything works locally:

1. **Create production data commit**:
```bash
git add .
git commit -m "feat: Add Scripts Repository with production data preservation

- Replaced Claude AI, Terminal, PowerShell tabs with Scripts Repository & PowerShell Manager
- Preserved all existing production workspace data
- Added 11+ imported admin scripts with categorization
- Enhanced PowerShell interface with system monitoring
- Zero data loss migration from production environment

🔧 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

2. **Push to GitHub**:
```bash
git push origin master
```

3. **Monitor Vercel deployment**
4. **Immediately test live workspace** to verify data integrity

## 🔄 Rollback Plan

If anything goes wrong:

1. **Immediate rollback**:
```bash
git revert HEAD
git push origin master
```

2. **Restore from our backup**:
```bash
cd ../workspace-backups/20250929_005609_before_scripts_repository_implementation
rsync -av --exclude=node_modules --exclude=.next . /mnt/x/ClaudeCode/nishens-ai-workspace/
git add .
git commit -m "EMERGENCY: Restore pre-Scripts-Repository state"
git push origin master
```

## 🚨 CRITICAL CHECKPOINTS

- [ ] **EXTRACTED** production data from live workspace
- [ ] **BACKED UP** extracted data securely
- [ ] **MERGED** production data with Scripts Repository
- [ ] **TESTED** merged data locally
- [ ] **VERIFIED** no data loss in local testing
- [ ] **PUSHED** to GitHub only after local verification
- [ ] **CONFIRMED** live workspace retains all data + new features

## 📞 Emergency Protocol

If you lose production data:
1. **STOP** immediately
2. **DO NOT** make more commits
3. Use the rollback plan above
4. Contact me for data recovery assistance

---

**REMEMBER**: Your production data is irreplaceable. Take every precaution.