// Import Existing Scripts into Scripts Repository
// This script reads existing script files and imports them into the Scripts Repository

const fs = require('fs');
const path = require('path');

class ScriptImporter {
    constructor() {
        this.scripts = [];
        this.categories = [
            { id: 'infrastructure', name: 'Infrastructure Audit', color: '#ff073a', icon: '🏗️', description: 'System infrastructure monitoring and audit scripts', count: 0 },
            { id: 'data-management', name: 'Data Management', color: '#8B9499', icon: '📊', description: 'Data export, import, and manipulation scripts', count: 0 },
            { id: 'system-admin', name: 'System Administration', color: '#00CC33', icon: '⚙️', description: 'Daily system administration tasks', count: 0 },
            { id: 'backup-recovery', name: 'Backup & Recovery', color: '#FF6B35', icon: '💾', description: 'Backup and recovery operations', count: 0 },
            { id: 'monitoring', name: 'Monitoring & Alerts', color: '#4ECDC4', icon: '📊', description: 'System monitoring and alerting scripts', count: 0 },
            { id: 'deployment', name: 'Deployment & CI/CD', color: '#45B7D1', icon: '🚀', description: 'Deployment and continuous integration scripts', count: 0 }
        ];
    }

    async importScripts() {
        console.log('🔍 Scanning for existing scripts...');

        const scriptPaths = [
            { path: './Audit', category: 'infrastructure' },
            { path: '.', category: 'data-management', pattern: /data-.*\.js$/ },
            { path: './scripts', category: 'backup-recovery' }
        ];

        for (const { path: scanPath, category, pattern } of scriptPaths) {
            if (fs.existsSync(scanPath)) {
                await this.scanDirectory(scanPath, category, pattern);
            }
        }

        console.log(`📦 Found ${this.scripts.length} scripts to import`);
        this.updateCategoryCounts();
        this.saveToLocalStorage();
        this.generateReport();
    }

    async scanDirectory(dirPath, category, pattern = null) {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile()) {
                const shouldInclude = pattern ? pattern.test(file) : this.isScriptFile(file);

                if (shouldInclude) {
                    await this.processScriptFile(filePath, category);
                }
            }
        }
    }

    isScriptFile(filename) {
        const scriptExtensions = ['.ps1', '.js', '.py', '.sh', '.bat', '.cmd'];
        return scriptExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    async processScriptFile(filePath, category) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const filename = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();

            const script = {
                id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: this.extractScriptName(filename, content),
                description: this.extractDescription(content),
                content: content,
                language: this.getLanguageFromExtension(ext),
                category: category,
                tags: this.extractTags(content, filename),
                lastModified: fs.statSync(filePath).mtime.toISOString(),
                version: this.extractVersion(content) || '1.0.0',
                isFavorite: false,
                usageCount: 0,
                parameters: this.extractParameters(content, ext)
            };

            this.scripts.push(script);
            console.log(`✅ Imported: ${script.name} (${script.language})`);

        } catch (error) {
            console.error(`❌ Error importing ${filePath}:`, error.message);
        }
    }

    extractScriptName(filename, content) {
        // Try to extract name from content first
        const lines = content.split('\n').slice(0, 10);

        for (const line of lines) {
            // PowerShell comment patterns
            if (line.match(/^#\s*(.+)/)) {
                const match = line.match(/^#\s*(.+)/);
                if (match && !match[1].includes('=') && match[1].length < 80) {
                    return match[1].trim();
                }
            }

            // JavaScript comment patterns
            if (line.match(/^\/\/\s*(.+)/)) {
                const match = line.match(/^\/\/\s*(.+)/);
                if (match && match[1].length < 80) {
                    return match[1].trim();
                }
            }
        }

        // Fallback to filename without extension
        return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    }

    extractDescription(content) {
        const lines = content.split('\n').slice(0, 20);
        let description = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Look for description in comments
            if (line.match(/^#\s*Description:/i) || line.match(/^\/\/\s*Description:/i)) {
                description = line.replace(/^(#|\/\/)\s*Description:\s*/i, '');
                break;
            }

            // Look for multi-line descriptions
            if (line.match(/^#\s*[A-Z]/) || line.match(/^\/\/\s*[A-Z]/)) {
                const cleanLine = line.replace(/^(#|\/\/)\s*/, '');
                if (cleanLine.length > 20 && cleanLine.length < 200) {
                    description = cleanLine;
                    break;
                }
            }
        }

        return description || 'Imported script - description to be added';
    }

    extractTags(content, filename) {
        const tags = [];
        const lowerContent = content.toLowerCase();
        const lowerFilename = filename.toLowerCase();

        // Common script type tags
        if (lowerContent.includes('audit') || lowerFilename.includes('audit')) tags.push('audit');
        if (lowerContent.includes('backup') || lowerFilename.includes('backup')) tags.push('backup');
        if (lowerContent.includes('monitor') || lowerFilename.includes('monitor')) tags.push('monitoring');
        if (lowerContent.includes('export') || lowerFilename.includes('export')) tags.push('export');
        if (lowerContent.includes('import') || lowerFilename.includes('import')) tags.push('import');
        if (lowerContent.includes('system') || lowerFilename.includes('system')) tags.push('system');
        if (lowerContent.includes('infrastructure')) tags.push('infrastructure');
        if (lowerContent.includes('performance')) tags.push('performance');
        if (lowerContent.includes('security')) tags.push('security');

        return tags.length > 0 ? tags : ['imported'];
    }

    extractVersion(content) {
        const lines = content.split('\n').slice(0, 10);

        for (const line of lines) {
            const versionMatch = line.match(/(?:version|v)\s*:?\s*([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i);
            if (versionMatch) {
                return versionMatch[1];
            }
        }

        return null;
    }

    extractParameters(content, extension) {
        const parameters = [];

        if (extension === '.ps1') {
            // Extract PowerShell parameters
            const paramMatches = content.match(/param\s*\(([\s\S]*?)\)/i);
            if (paramMatches) {
                const paramBlock = paramMatches[1];
                const paramLines = paramBlock.split(',');

                for (const paramLine of paramLines) {
                    const cleanLine = paramLine.trim();
                    const nameMatch = cleanLine.match(/\$(\w+)/);
                    const typeMatch = cleanLine.match(/\[(\w+)\]/);

                    if (nameMatch) {
                        parameters.push({
                            name: nameMatch[1],
                            type: typeMatch ? typeMatch[1] : 'string',
                            required: !cleanLine.includes('='),
                            description: `Parameter ${nameMatch[1]}`
                        });
                    }
                }
            }
        }

        return parameters;
    }

    getLanguageFromExtension(ext) {
        const langMap = {
            '.ps1': 'powershell',
            '.js': 'javascript',
            '.py': 'python',
            '.sh': 'bash',
            '.bat': 'batch',
            '.cmd': 'batch'
        };

        return langMap[ext] || 'text';
    }

    updateCategoryCounts() {
        this.categories.forEach(category => {
            category.count = this.scripts.filter(script => script.category === category.id).length;
        });
    }

    saveToLocalStorage() {
        // In a real browser environment, this would save to localStorage
        // For now, we'll create JSON files that can be imported

        const scriptsJson = JSON.stringify(this.scripts, null, 2);
        const categoriesJson = JSON.stringify(this.categories, null, 2);

        fs.writeFileSync('./imported-scripts.json', scriptsJson);
        fs.writeFileSync('./imported-categories.json', categoriesJson);

        console.log('💾 Exported to imported-scripts.json and imported-categories.json');
        console.log('📝 Copy the contents of these files to localStorage in your browser:');
        console.log('   - nishen-workspace-scripts');
        console.log('   - nishen-workspace-script-categories');
    }

    generateReport() {
        console.log('\n📊 Import Report:');
        console.log('================');

        this.categories.forEach(category => {
            if (category.count > 0) {
                console.log(`${category.icon} ${category.name}: ${category.count} scripts`);
            }
        });

        console.log('\n📋 Imported Scripts:');
        console.log('===================');

        this.scripts.forEach((script, index) => {
            console.log(`${index + 1}. ${script.name} (${script.language}) - ${script.category}`);
        });

        console.log('\n✅ Import completed successfully!');
        console.log('🔄 Load your workspace and the scripts should appear in the Scripts Repository');
    }
}

// Run the import
if (require.main === module) {
    const importer = new ScriptImporter();
    importer.importScripts().catch(console.error);
}

module.exports = ScriptImporter;