'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Play, Edit2, Trash2, Eye, Download, Upload, Star, Filter, Clock, Code2, Folder, ChevronDown, ChevronRight, Copy, Tag } from 'lucide-react'

interface Script {
  id: string
  name: string
  description: string
  content: string
  language: 'powershell' | 'bash' | 'javascript' | 'python' | 'batch'
  category: string
  tags: string[]
  lastModified: string
  version: string
  isFavorite: boolean
  usageCount: number
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    defaultValue?: string
  }>
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description: string
  count: number
}

export default function ScriptsRepository() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'usage'>('modified')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))

  // Initialize demo data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const savedScripts = localStorage.getItem('nishen-workspace-scripts')
    const savedCategories = localStorage.getItem('nishen-workspace-script-categories')

    let processedScripts: Script[] = []
    let processedCategories: Category[] = []

    if (savedScripts) {
      processedScripts = JSON.parse(savedScripts)
    }

    if (savedCategories) {
      processedCategories = JSON.parse(savedCategories)
    }

    // Always ensure default categories exist
    const defaultCategories = [
      { id: 'infrastructure', name: 'Infrastructure Audit', color: '#ff073a', icon: '🏗️', description: 'System infrastructure monitoring and audit scripts', count: 0 },
      { id: 'data-management', name: 'Data Management', color: '#8B9499', icon: '📊', description: 'Data export, import, and manipulation scripts', count: 0 },
      { id: 'system-admin', name: 'System Administration', color: '#00CC33', icon: '⚙️', description: 'Daily system administration tasks', count: 0 },
      { id: 'backup-recovery', name: 'Backup & Recovery', color: '#FF6B35', icon: '💾', description: 'Backup and recovery operations', count: 0 },
      { id: 'monitoring', name: 'Monitoring & Alerts', color: '#4ECDC4', icon: '📊', description: 'System monitoring and alerting scripts', count: 0 },
      { id: 'deployment', name: 'Deployment & CI/CD', color: '#45B7D1', icon: '🚀', description: 'Deployment and continuous integration scripts', count: 0 }
    ]

    defaultCategories.forEach(defaultCat => {
      const exists = processedCategories.some(cat => cat.id === defaultCat.id)
      if (!exists) {
        processedCategories.push(defaultCat)
      }
    })

    // Always ensure demo scripts exist
    const demoScripts: Script[] = [
      {
        id: 'script-1',
        name: 'Master Infrastructure Audit',
        description: 'Comprehensive infrastructure health check and audit script for Windows environments',
        content: `# Master Infrastructure Audit Script V8.8
# Comprehensive system health check and audit

param(
    [string]$OutputPath = "C:\\Audit",
    [switch]$IncludePerformance,
    [switch]$ExportToExcel
)

Write-Host "Starting Infrastructure Audit..." -ForegroundColor Green

# System Information Collection
$SystemInfo = Get-ComputerInfo
$DiskSpace = Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3}
$Services = Get-Service | Where-Object {$_.Status -eq 'Stopped' -and $_.StartType -eq 'Automatic'}

# Generate Report
$Report = @{
    ComputerName = $SystemInfo.CsName
    OS = $SystemInfo.WindowsProductName
    LastBootTime = $SystemInfo.CsBootupState
    TotalRAM = [math]::Round($SystemInfo.CsTotalPhysicalMemory / 1GB, 2)
    AvailableRAM = [math]::Round((Get-Counter "\\Memory\\Available MBytes").CounterSamples.CookedValue / 1024, 2)
    StoppedServices = $Services.Count
    LowDiskSpace = ($DiskSpace | Where-Object {($_.FreeSpace / $_.Size) -lt 0.1}).Count
}

Write-Host "Audit completed. Report generated." -ForegroundColor Green
return $Report`,
        language: 'powershell',
        category: 'infrastructure',
        tags: ['audit', 'system-health', 'infrastructure', 'monitoring'],
        lastModified: '2025-09-29T00:30:00Z',
        version: '8.8',
        isFavorite: true,
        usageCount: 15,
        parameters: [
          { name: 'OutputPath', type: 'string', required: false, description: 'Output directory for audit reports', defaultValue: 'C:\\Audit' },
          { name: 'IncludePerformance', type: 'switch', required: false, description: 'Include performance counters in audit' },
          { name: 'ExportToExcel', type: 'switch', required: false, description: 'Export results to Excel format' }
        ]
      },
      {
        id: 'script-2',
        name: 'Data Export Manager',
        description: 'Export workspace data to various formats with backup capabilities',
        content: `// Data Export Manager
// Exports workspace data with backup and versioning

const fs = require('fs');
const path = require('path');

class DataExportManager {
    constructor() {
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.backupDir = './backups';
    }

    async exportWorkspaceData() {
        console.log('Starting workspace data export...');

        const workspaceData = {
            notes: this.getLocalStorageData('nishen-workspace-notes'),
            files: this.getLocalStorageData('nishen-workspace-files'),
            settings: this.getLocalStorageData('nishen-workspace-settings'),
            scripts: this.getLocalStorageData('nishen-workspace-scripts'),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        const exportPath = path.join(this.backupDir, \`workspace-export-\${this.timestamp}.json\`);

        try {
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
            }

            fs.writeFileSync(exportPath, JSON.stringify(workspaceData, null, 2));
            console.log(\`Export completed: \${exportPath}\`);
            return exportPath;
        } catch (error) {
            console.error('Export failed:', error.message);
            throw error;
        }
    }

    getLocalStorageData(key) {
        if (typeof window !== 'undefined' && window.localStorage) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        }
        return null;
    }
}

module.exports = DataExportManager;`,
        language: 'javascript',
        category: 'data-management',
        tags: ['export', 'backup', 'data-management', 'workspace'],
        lastModified: '2025-09-28T14:20:00Z',
        version: '1.2.0',
        isFavorite: false,
        usageCount: 8,
        parameters: [
          { name: 'outputFormat', type: 'string', required: false, description: 'Export format (json, csv, xml)', defaultValue: 'json' },
          { name: 'includeMedia', type: 'boolean', required: false, description: 'Include media files in export' }
        ]
      },
      {
        id: 'script-3',
        name: 'System Backup Script',
        description: 'Automated system backup with compression and cloud sync capabilities',
        content: `#!/bin/bash
# System Backup Script
# Automated backup with compression and cloud sync

BACKUP_DIR="/backups"
SOURCE_DIRS=("/home" "/etc" "/var/www")
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="system_backup_\$TIMESTAMP"
LOG_FILE="\$BACKUP_DIR/backup.log"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

log_message() {
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\$LOG_FILE"
}

create_backup() {
    log_message "\${GREEN}Starting system backup...\${NC}"

    # Create backup directory
    mkdir -p "\$BACKUP_DIR"

    # Create compressed archive
    tar -czf "\$BACKUP_DIR/\$BACKUP_NAME.tar.gz" "\${SOURCE_DIRS[@]}" 2>/dev/null

    if [ \$? -eq 0 ]; then
        log_message "\${GREEN}Backup completed: \$BACKUP_NAME.tar.gz\${NC}"

        # Generate checksum
        md5sum "\$BACKUP_DIR/\$BACKUP_NAME.tar.gz" > "\$BACKUP_DIR/\$BACKUP_NAME.md5"

        # Cleanup old backups (keep last 7 days)
        find "\$BACKUP_DIR" -name "system_backup_*.tar.gz" -mtime +7 -delete

        log_message "\${GREEN}Backup process completed successfully\${NC}"
    else
        log_message "\${RED}Backup failed\${NC}"
        exit 1
    fi
}

# Execute backup
create_backup`,
        language: 'bash',
        category: 'backup-recovery',
        tags: ['backup', 'automation', 'compression', 'system'],
        lastModified: '2025-09-27T09:15:00Z',
        version: '2.1.0',
        isFavorite: true,
        usageCount: 23,
        parameters: [
          { name: 'backup_dir', type: 'string', required: false, description: 'Backup destination directory', defaultValue: '/backups' },
          { name: 'compression_level', type: 'number', required: false, description: 'Compression level (1-9)', defaultValue: '6' },
          { name: 'include_logs', type: 'boolean', required: false, description: 'Include system logs in backup' }
        ]
      },
      {
        id: 'script-4',
        name: 'Performance Monitor',
        description: 'Real-time system performance monitoring with alerting capabilities',
        content: `import psutil
import time
import json
import smtplib
from datetime import datetime
from email.mime.text import MIMEText

class PerformanceMonitor:
    def __init__(self, config_file='monitor_config.json'):
        self.config = self.load_config(config_file)
        self.alerts_sent = {}

    def load_config(self, config_file):
        """Load monitoring configuration"""
        default_config = {
            "cpu_threshold": 80,
            "memory_threshold": 85,
            "disk_threshold": 90,
            "check_interval": 60,
            "alert_cooldown": 300,
            "email_alerts": True,
            "smtp_server": "smtp.gmail.com",
            "smtp_port": 587
        }

        try:
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        except FileNotFoundError:
            print(f"Config file {config_file} not found, using defaults")

        return default_config

    def check_system_health(self):
        """Check system performance metrics"""
        timestamp = datetime.now().isoformat()

        # CPU Usage
        cpu_percent = psutil.cpu_percent(interval=1)

        # Memory Usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent

        # Disk Usage
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100

        # Network I/O
        network = psutil.net_io_counters()

        metrics = {
            'timestamp': timestamp,
            'cpu_percent': cpu_percent,
            'memory_percent': memory_percent,
            'disk_percent': disk_percent,
            'network_bytes_sent': network.bytes_sent,
            'network_bytes_recv': network.bytes_recv
        }

        # Check thresholds and send alerts
        self.check_thresholds(metrics)

        return metrics

    def check_thresholds(self, metrics):
        """Check if metrics exceed thresholds and send alerts"""
        alerts = []

        if metrics['cpu_percent'] > self.config['cpu_threshold']:
            alerts.append(f"HIGH CPU: {metrics['cpu_percent']:.1f}%")

        if metrics['memory_percent'] > self.config['memory_threshold']:
            alerts.append(f"HIGH MEMORY: {metrics['memory_percent']:.1f}%")

        if metrics['disk_percent'] > self.config['disk_threshold']:
            alerts.append(f"HIGH DISK: {metrics['disk_percent']:.1f}%")

        if alerts and self.config['email_alerts']:
            self.send_alert_email(alerts, metrics)

    def send_alert_email(self, alerts, metrics):
        """Send email alerts for threshold violations"""
        current_time = time.time()
        alert_key = str(alerts)

        # Check cooldown period
        if alert_key in self.alerts_sent:
            if current_time - self.alerts_sent[alert_key] < self.config['alert_cooldown']:
                return

        self.alerts_sent[alert_key] = current_time
        print(f"ALERT: {', '.join(alerts)}")

    def monitor_continuous(self):
        """Run continuous monitoring"""
        print("Starting performance monitoring...")
        print(f"Check interval: {self.config['check_interval']} seconds")

        try:
            while True:
                metrics = self.check_system_health()
                print(f"[{metrics['timestamp']}] CPU: {metrics['cpu_percent']:.1f}% | "
                      f"RAM: {metrics['memory_percent']:.1f}% | "
                      f"DISK: {metrics['disk_percent']:.1f}%")

                time.sleep(self.config['check_interval'])

        except KeyboardInterrupt:
            print("\\nMonitoring stopped by user")

if __name__ == "__main__":
    monitor = PerformanceMonitor()
    monitor.monitor_continuous()`,
        language: 'python',
        category: 'monitoring',
        tags: ['monitoring', 'performance', 'alerts', 'automation'],
        lastModified: '2025-09-26T16:45:00Z',
        version: '3.0.0',
        isFavorite: false,
        usageCount: 12,
        parameters: [
          { name: 'config_file', type: 'string', required: false, description: 'Configuration file path', defaultValue: 'monitor_config.json' },
          { name: 'email_alerts', type: 'boolean', required: false, description: 'Enable email alerts' },
          { name: 'check_interval', type: 'number', required: false, description: 'Check interval in seconds', defaultValue: '60' }
        ]
      }
    ]

    demoScripts.forEach(demoScript => {
      const exists = processedScripts.some(script => script.id === demoScript.id)
      if (!exists) {
        processedScripts.push(demoScript)
      }
    })

    // Update category counts
    processedCategories.forEach(category => {
      category.count = processedScripts.filter(script => script.category === category.id).length
    })

    setScripts(processedScripts)
    setCategories(processedCategories)

    // Save to localStorage with error handling
    try {
      localStorage.setItem('nishen-workspace-scripts', JSON.stringify(processedScripts))
      localStorage.setItem('nishen-workspace-script-categories', JSON.stringify(processedCategories))
    } catch (error) {
      console.warn('localStorage full, consider upgrading to cloud storage')
      // Show user notification about storage limits
      alert('Storage limit reached. Consider enabling cloud storage in Settings.')
    }
  }

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory
    const matchesLanguage = selectedLanguage === 'all' || script.language === selectedLanguage

    return matchesSearch && matchesCategory && matchesLanguage
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'usage':
        return b.usageCount - a.usageCount
      case 'modified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })

  const handleRunScript = (script: Script) => {
    // Increment usage count
    const updatedScripts = scripts.map(s =>
      s.id === script.id ? { ...s, usageCount: s.usageCount + 1 } : s
    )
    setScripts(updatedScripts)
    localStorage.setItem('nishen-workspace-scripts', JSON.stringify(updatedScripts))

    // Here you would typically integrate with PowerShell Manager or execution engine
    console.log('Executing script:', script.name)
  }

  const toggleFavorite = (scriptId: string) => {
    const updatedScripts = scripts.map(script =>
      script.id === scriptId ? { ...script, isFavorite: !script.isFavorite } : script
    )
    setScripts(updatedScripts)
    localStorage.setItem('nishen-workspace-scripts', JSON.stringify(updatedScripts))
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    // You could add a toast notification here
  }

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'powershell': return '🔷'
      case 'bash': return '🐧'
      case 'javascript': return '📜'
      case 'python': return '🐍'
      case 'batch': return '⚡'
      default: return '📄'
    }
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'powershell': return '#0078d4'
      case 'bash': return '#4EAA25'
      case 'javascript': return '#F7DF1E'
      case 'python': return '#3776AB'
      case 'batch': return '#C1F12E'
      default: return '#666666'
    }
  }

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-accent)' }}>
            Nishen's AI Workspace v1.2.4 - Scripts Repository
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search scripts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-800">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="all">All Languages</option>
                <option value="powershell">PowerShell</option>
                <option value="bash">Bash</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="batch">Batch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'modified' | 'usage')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="modified">Last Modified</option>
                <option value="name">Name</option>
                <option value="usage">Usage Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-300 mb-3">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                style={{
                  backgroundColor: selectedCategory === 'all' ? 'var(--primary-accent)' : undefined,
                }}
              >
                <span>📁</span>
                <span>All Scripts</span>
                <span className="ml-auto text-sm bg-gray-700 px-2 py-1 rounded">
                  {scripts.length}
                </span>
              </button>

              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? 'var(--primary-accent)' : undefined,
                  }}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                  <span className="ml-auto text-xs bg-gray-700 px-2 py-1 rounded">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex space-x-2">
            <button
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus className="w-4 h-4" />
              <span>New Script</span>
            </button>
            <button className="flex items-center justify-center px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedCategory === 'all' ? 'All Scripts' :
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-sm text-gray-400">
                {filteredScripts.length} scripts found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="p-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
              >
                {viewMode === 'list' ? '⊞' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Scripts List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredScripts.map(script => (
              <div
                key={script.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span style={{ color: getLanguageColor(script.language) }}>
                        {getLanguageIcon(script.language)}
                      </span>
                      <h3 className="font-semibold text-white">{script.name}</h3>
                      {script.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{script.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>v{script.version}</span>
                      <span>Used {script.usageCount} times</span>
                      <span>{new Date(script.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(script.id)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Star className={`w-4 h-4 ${script.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {script.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRunScript(script)}
                    className="flex items-center space-x-1 px-3 py-1 text-white rounded text-sm transition-colors"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedScript(script)
                      setIsPreviewOpen(true)
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(script.content)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button className="p-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredScripts.length === 0 && (
            <div className="text-center py-12">
              <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No scripts found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first script'}
              </p>
              <button
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Create New Script
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedScript.name}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
              {selectedScript.content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}