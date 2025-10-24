'use client'

import { useState, useEffect } from 'react'
import {
  FileCode2,
  Plus,
  Edit3,
  Save,
  Search,
  Tag,
  Trash2,
  Eye,
  Copy,
  Star,
  Filter,
  Download,
  Upload,
  X,
  FileText,
  Code,
  Globe,
  TrendingUp,
  Calendar,
  Folder,
  FolderPlus
} from 'lucide-react'

interface Script {
  id: string
  title: string
  description: string
  scriptContent: string // .ps1 file content
  htmlReportContent: string // HTML report content
  category: string
  tags: string[]
  version: string
  created: Date
  modified: Date
  isPinned: boolean
  usageCount: number
  rating: number
}

interface ScriptCategory {
  id: string
  name: string
  color: string
  count: number
  description: string
}

export default function CustomSolutions() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [categories, setCategories] = useState<ScriptCategory[]>([])
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'script' | 'report'>('script')
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'modified' | 'usage' | 'rating'>('modified')

  // Modals
  const [showNewScriptModal, setShowNewScriptModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)

  // Form states
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editScriptContent, setEditScriptContent] = useState('')
  const [editHtmlReportContent, setEditHtmlReportContent] = useState('')
  const [editVersion, setEditVersion] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editCategory, setEditCategory] = useState('')

  // New script form
  const [newScriptTitle, setNewScriptTitle] = useState('')
  const [newScriptDescription, setNewScriptDescription] = useState('')
  const [newScriptCategory, setNewScriptCategory] = useState('')
  const [newScriptVersion, setNewScriptVersion] = useState('1.0')
  const [newScriptTags, setNewScriptTags] = useState('')

  // New category form
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#ff073a')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // Load data from localStorage or demo data
  useEffect(() => {
    const savedScripts = localStorage.getItem('nishen-workspace-custom-solutions')
    const savedCategories = localStorage.getItem('nishen-workspace-solution-categories')

    if (savedScripts && savedCategories) {
      try {
        const parsedScripts = JSON.parse(savedScripts).map((s: any) => ({
          ...s,
          created: new Date(s.created),
          modified: new Date(s.modified)
        }))
        setScripts(parsedScripts)
        setCategories(JSON.parse(savedCategories))
        return
      } catch (error) {
        console.error('Error loading saved custom solutions:', error)
      }
    }

    // Default demo data if no saved data
    const demoCategories: ScriptCategory[] = [
      { id: 'cat-1', name: 'System Administration', color: '#ff073a', count: 0, description: 'System management and monitoring scripts' },
      { id: 'cat-2', name: 'Security & Compliance', color: '#8b5cf6', count: 0, description: 'Security audits and compliance reporting' },
      { id: 'cat-3', name: 'Network Management', color: '#0ea5e9', count: 0, description: 'Network diagnostics and configuration' },
      { id: 'cat-4', name: 'Active Directory', color: '#10b981', count: 0, description: 'AD user and group management' },
      { id: 'cat-5', name: 'Automation', color: '#f59e0b', count: 0, description: 'Workflow automation and scheduled tasks' },
      { id: 'cat-6', name: 'Reporting', color: '#ec4899', count: 0, description: 'Data collection and HTML reports' }
    ]

    const demoScripts: Script[] = [
      {
        id: 'script-1',
        title: 'System Health Check',
        description: 'Comprehensive system health monitoring with detailed HTML report including CPU, memory, disk, and network metrics.',
        scriptContent: `# System Health Check Script
# Version: 1.0
# Author: DevOps Studio

param(
    [string]$OutputPath = "C:\\Reports",
    [switch]$EmailReport
)

# Initialize report data
$reportData = @{
    ComputerName = $env:COMPUTERNAME
    ScanDate = Get-Date
    CPU = Get-CimInstance Win32_Processor | Select-Object Name, LoadPercentage
    Memory = Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory
    Disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
    Services = Get-Service | Where-Object {$_.Status -eq 'Stopped' -and $_.StartType -eq 'Automatic'}
}

# Generate HTML Report
$htmlPath = Join-Path $OutputPath "SystemHealth_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
$reportData | ConvertTo-Html | Out-File $htmlPath

Write-Host "Report generated: $htmlPath" -ForegroundColor Green`,
        htmlReportContent: `<!DOCTYPE html>
<html>
<head>
    <title>System Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        h1 { color: #ff073a; border-bottom: 2px solid #ff073a; padding-bottom: 10px; }
        .metric { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ff073a; }
        .metric h2 { margin-top: 0; color: #ff073a; font-size: 18px; }
        .status-good { color: #10b981; font-weight: bold; }
        .status-warning { color: #f59e0b; font-weight: bold; }
        .status-critical { color: #ef4444; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #444; }
        th { background: #333; color: #ff073a; }
    </style>
</head>
<body>
    <h1>System Health Report - SERVER01</h1>
    <p><strong>Scan Date:</strong> 2025-10-23 10:30:00</p>

    <div class="metric">
        <h2>CPU Status</h2>
        <p>Load: <span class="status-good">23%</span></p>
        <p>Model: Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz</p>
    </div>

    <div class="metric">
        <h2>Memory Status</h2>
        <p>Available: <span class="status-good">45.2 GB</span> of 64 GB (70% free)</p>
    </div>

    <div class="metric">
        <h2>Disk Status</h2>
        <table>
            <tr><th>Drive</th><th>Total</th><th>Free</th><th>Status</th></tr>
            <tr><td>C:</td><td>500 GB</td><td>125 GB</td><td><span class="status-good">Healthy</span></td></tr>
            <tr><td>D:</td><td>1 TB</td><td>450 GB</td><td><span class="status-good">Healthy</span></td></tr>
        </table>
    </div>

    <div class="metric">
        <h2>Service Status</h2>
        <p class="status-good">All critical services running</p>
    </div>
</body>
</html>`,
        category: 'System Administration',
        tags: ['monitoring', 'health-check', 'reporting', 'diagnostics'],
        version: '1.0',
        created: new Date('2025-09-15'),
        modified: new Date('2025-10-20'),
        isPinned: true,
        usageCount: 127,
        rating: 5
      },
      {
        id: 'script-2',
        title: 'Active Directory User Audit',
        description: 'Complete AD user account audit with HTML report showing inactive accounts, password expiration, and group memberships.',
        scriptContent: `# Active Directory User Audit
# Version: 2.1
# Requires: ActiveDirectory Module

Import-Module ActiveDirectory

param(
    [int]$InactiveDays = 90,
    [string]$OutputPath = "C:\\Reports\\AD"
)

# Get all users
$allUsers = Get-ADUser -Filter * -Properties LastLogonDate, PasswordLastSet, MemberOf, Enabled

# Find inactive users
$inactiveUsers = $allUsers | Where-Object {
    $_.LastLogonDate -lt (Get-Date).AddDays(-$InactiveDays)
}

# Password expiration check
$expiringPasswords = $allUsers | Where-Object {
    $_.PasswordLastSet -lt (Get-Date).AddDays(-75)
}

# Generate report
$reportData = @{
    TotalUsers = $allUsers.Count
    EnabledUsers = ($allUsers | Where-Object {$_.Enabled}).Count
    InactiveUsers = $inactiveUsers.Count
    ExpiringPasswords = $expiringPasswords.Count
}

Write-Host "Audit complete: $($reportData.TotalUsers) users processed" -ForegroundColor Cyan`,
        htmlReportContent: `<!DOCTYPE html>
<html>
<head>
    <title>AD User Audit Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 20px; background: #0f172a; color: #e2e8f0; }
        h1 { color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 15px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .card { background: #1e293b; padding: 20px; border-radius: 10px; border-left: 4px solid #8b5cf6; }
        .card h3 { margin: 0 0 10px 0; color: #8b5cf6; font-size: 16px; }
        .card .value { font-size: 32px; font-weight: bold; color: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #1e293b; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; }
        th { background: #334155; color: #8b5cf6; font-weight: 600; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .badge-active { background: #10b981; color: #fff; }
        .badge-inactive { background: #ef4444; color: #fff; }
    </style>
</head>
<body>
    <h1>Active Directory User Audit Report</h1>
    <p><strong>Domain:</strong> CONTOSO.LOCAL | <strong>Report Date:</strong> 2025-10-23</p>

    <div class="summary">
        <div class="card">
            <h3>Total Users</h3>
            <div class="value">1,247</div>
        </div>
        <div class="card">
            <h3>Enabled Users</h3>
            <div class="value">1,189</div>
        </div>
        <div class="card">
            <h3>Inactive (90+ days)</h3>
            <div class="value">43</div>
        </div>
        <div class="card">
            <h3>Expiring Passwords</h3>
            <div class="value">67</div>
        </div>
    </div>

    <h2 style="color: #8b5cf6; margin-top: 30px;">Inactive User Accounts</h2>
    <table>
        <tr><th>Username</th><th>Last Logon</th><th>Status</th><th>Department</th></tr>
        <tr><td>jsmith</td><td>2025-05-12</td><td><span class="badge badge-inactive">Inactive</span></td><td>Sales</td></tr>
        <tr><td>mjones</td><td>2025-06-03</td><td><span class="badge badge-inactive">Inactive</span></td><td>Marketing</td></tr>
        <tr><td>rbrown</td><td>2025-04-28</td><td><span class="badge badge-inactive">Inactive</span></td><td>IT</td></tr>
    </table>
</body>
</html>`,
        category: 'Active Directory',
        tags: ['ad', 'security', 'audit', 'compliance', 'users'],
        version: '2.1',
        created: new Date('2025-08-10'),
        modified: new Date('2025-10-18'),
        isPinned: true,
        usageCount: 89,
        rating: 5
      },
      {
        id: 'script-3',
        title: 'Network Port Scanner',
        description: 'Multi-threaded network port scanner with service detection and comprehensive HTML vulnerability report.',
        scriptContent: `# Network Port Scanner
# Version: 1.5
# Description: Scan network ranges for open ports

param(
    [Parameter(Mandatory=$true)]
    [string]$IPRange,

    [int[]]$Ports = @(21,22,23,25,53,80,110,143,443,445,3389,8080),

    [int]$Timeout = 1000,

    [string]$OutputPath = "C:\\Reports\\Network"
)

function Test-Port {
    param($IP, $Port, $Timeout)

    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($IP, $Port, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne($Timeout, $false)

    if ($wait) {
        try {
            $tcpClient.EndConnect($connect)
            return $true
        } catch {
            return $false
        }
    } else {
        return $false
    }
}

Write-Host "Starting port scan on $IPRange..." -ForegroundColor Yellow

# Scan logic here
$results = @()

# Generate HTML report
Write-Host "Scan complete. Report saved." -ForegroundColor Green`,
        htmlReportContent: `<!DOCTYPE html>
<html>
<head>
    <title>Network Port Scan Report</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #0a0e27; color: #00ff41; }
        h1 { color: #00ff41; text-shadow: 0 0 10px #00ff41; border-bottom: 2px solid #00ff41; }
        .scan-info { background: #0f1729; padding: 15px; border-radius: 8px; border: 1px solid #00ff41; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #00ff41; }
        th { background: #0f1729; color: #00ff41; font-weight: bold; }
        .port-open { color: #00ff41; font-weight: bold; }
        .port-closed { color: #ff0000; }
        .service { color: #00d4ff; }
        .risk-high { background: #ff0000; color: #fff; padding: 2px 8px; border-radius: 4px; }
        .risk-medium { background: #ff9500; color: #000; padding: 2px 8px; border-radius: 4px; }
        .risk-low { background: #00ff41; color: #000; padding: 2px 8px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>NETWORK PORT SCAN REPORT</h1>

    <div class="scan-info">
        <p><strong>Target Range:</strong> 192.168.1.0/24</p>
        <p><strong>Scan Date:</strong> 2025-10-23 14:45:23</p>
        <p><strong>Total Hosts:</strong> 254 | <strong>Active Hosts:</strong> 47</p>
        <p><strong>Open Ports Found:</strong> 123</p>
    </div>

    <h2 style="color: #00ff41;">Open Ports Summary</h2>
    <table>
        <tr>
            <th>IP Address</th>
            <th>Port</th>
            <th>Service</th>
            <th>Risk Level</th>
        </tr>
        <tr>
            <td>192.168.1.10</td>
            <td class="port-open">22</td>
            <td class="service">SSH</td>
            <td><span class="risk-medium">MEDIUM</span></td>
        </tr>
        <tr>
            <td>192.168.1.10</td>
            <td class="port-open">80</td>
            <td class="service">HTTP</td>
            <td><span class="risk-low">LOW</span></td>
        </tr>
        <tr>
            <td>192.168.1.10</td>
            <td class="port-open">443</td>
            <td class="service">HTTPS</td>
            <td><span class="risk-low">LOW</span></td>
        </tr>
        <tr>
            <td>192.168.1.15</td>
            <td class="port-open">3389</td>
            <td class="service">RDP</td>
            <td><span class="risk-high">HIGH</span></td>
        </tr>
        <tr>
            <td>192.168.1.20</td>
            <td class="port-open">445</td>
            <td class="service">SMB</td>
            <td><span class="risk-high">HIGH</span></td>
        </tr>
    </table>

    <h2 style="color: #ff0000; margin-top: 30px;">Security Recommendations</h2>
    <ul style="line-height: 1.8;">
        <li>Close unnecessary ports on 192.168.1.15 (RDP exposed)</li>
        <li>Implement firewall rules for SMB access</li>
        <li>Consider using VPN for remote access</li>
        <li>Update services to latest security patches</li>
    </ul>
</body>
</html>`,
        category: 'Network Management',
        tags: ['network', 'security', 'scanning', 'ports', 'diagnostics'],
        version: '1.5',
        created: new Date('2025-07-22'),
        modified: new Date('2025-10-15'),
        isPinned: false,
        usageCount: 64,
        rating: 4
      }
    ]

    setCategories(demoCategories)
    setScripts(demoScripts)
    updateCategoryCounts(demoScripts, demoCategories)
  }, [])

  // Update category counts
  const updateCategoryCounts = (scriptList: Script[], categoryList: ScriptCategory[]) => {
    const updatedCategories = categoryList.map(category => ({
      ...category,
      count: scriptList.filter(script => script.category === category.name).length
    }))
    setCategories(updatedCategories)
  }

  // Save data to localStorage
  const saveToLocalStorage = (scriptsData: Script[], categoriesData: ScriptCategory[]) => {
    try {
      console.log(`🛡️ CUSTOM SOLUTIONS SAVE: ${scriptsData.length} scripts, ${categoriesData.length} categories`)
      localStorage.setItem('nishen-workspace-custom-solutions', JSON.stringify(scriptsData))
      localStorage.setItem('nishen-workspace-solution-categories', JSON.stringify(categoriesData))
      console.log('✅ Custom solutions saved successfully')
    } catch (error) {
      console.error('❌ Error saving custom solution data:', error)
    }
  }

  // Auto-save whenever scripts or categories change
  useEffect(() => {
    if (scripts.length > 0 && categories.length > 0) {
      updateCategoryCounts(scripts, categories)
      saveToLocalStorage(scripts, categories)
    }
  }, [scripts, categories])

  const createScript = () => {
    if (!newScriptTitle.trim()) {
      alert('Please enter a script title')
      return
    }

    const newScript: Script = {
      id: `script-${Date.now()}`,
      title: newScriptTitle,
      description: newScriptDescription,
      scriptContent: `# ${newScriptTitle}
# Version: ${newScriptVersion}
# Description: ${newScriptDescription}

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "C:\\Reports"
)

# Your script logic here
Write-Host "Script execution started..." -ForegroundColor Green

# Generate report
Write-Host "Report generated successfully" -ForegroundColor Cyan`,
      htmlReportContent: `<!DOCTYPE html>
<html>
<head>
    <title>${newScriptTitle} - Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: #fff; }
        h1 { color: #ff073a; }
    </style>
</head>
<body>
    <h1>${newScriptTitle} Report</h1>
    <p>Report generated on: ${new Date().toLocaleString()}</p>
    <p>Add your report content here...</p>
</body>
</html>`,
      category: newScriptCategory || 'General',
      tags: newScriptTags ? newScriptTags.split(',').map(tag => tag.trim()) : [],
      version: newScriptVersion,
      created: new Date(),
      modified: new Date(),
      isPinned: false,
      usageCount: 0,
      rating: 0
    }

    setScripts(prev => [newScript, ...prev])
    setShowNewScriptModal(false)

    // Reset form
    setNewScriptTitle('')
    setNewScriptDescription('')
    setNewScriptCategory('')
    setNewScriptVersion('1.0')
    setNewScriptTags('')
  }

  const createCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: ScriptCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor,
      count: 0,
      description: newCategoryDescription
    }

    setCategories(prev => [...prev, newCategory])
    setShowNewCategoryModal(false)

    // Reset form
    setNewCategoryName('')
    setNewCategoryColor('#ff073a')
    setNewCategoryDescription('')
  }

  const saveScript = () => {
    if (!selectedScript || !editTitle.trim()) return

    setScripts(prev => prev.map(script =>
      script.id === selectedScript
        ? {
            ...script,
            title: editTitle,
            description: editDescription,
            scriptContent: editScriptContent,
            htmlReportContent: editHtmlReportContent,
            version: editVersion,
            tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            category: editCategory,
            modified: new Date()
          }
        : script
    ))

    setIsEditing(false)
    setSelectedScript(null)
  }

  const deleteScript = (scriptId: string) => {
    if (confirm('Are you sure you want to delete this script and its report?')) {
      setScripts(prev => prev.filter(script => script.id !== scriptId))
      if (selectedScript === scriptId) {
        setSelectedScript(null)
      }
    }
  }

  const togglePin = (scriptId: string) => {
    setScripts(prev => prev.map(script =>
      script.id === scriptId ? { ...script, isPinned: !script.isPinned } : script
    ))
  }

  const copyToClipboard = (content: string, type: 'script' | 'report') => {
    navigator.clipboard.writeText(content)
    alert(`${type === 'script' ? 'Script' : 'HTML Report'} copied to clipboard!`)
  }

  const incrementUsage = (scriptId: string) => {
    setScripts(prev => prev.map(script =>
      script.id === scriptId ? { ...script, usageCount: script.usageCount + 1 } : script
    ))
  }

  const updateRating = (scriptId: string, newRating: number) => {
    setScripts(prev => prev.map(script =>
      script.id === scriptId ? { ...script, rating: newRating } : script
    ))
  }

  const getRatingStars = (rating: number, scriptId?: string, interactive = false) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${interactive ? 'cursor-pointer' : ''} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
        onClick={() => interactive && scriptId ? updateRating(scriptId, i + 1) : null}
      />
    ))
  }

  // Filter scripts based on search and category
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = searchTerm === '' ||
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      script.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || script.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort scripts
  const sortedScripts = filteredScripts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    switch (sortBy) {
      case 'usage':
        return b.usageCount - a.usageCount
      case 'rating':
        return b.rating - a.rating
      case 'modified':
      default:
        return b.modified.getTime() - a.modified.getTime()
    }
  })

  const selectedScriptData = scripts.find(s => s.id === selectedScript)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || '#ff073a'
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        {/* Version Info */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>DevOps Studio v0.1.2</span>
          <span>Custom Solutions</span>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-accent)' }}>
            <FileCode2 className="w-6 h-6 inline mr-2" />
            Custom Solutions
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm"
            >
              <FolderPlus size={16} />
              Category
            </button>
            <button
              onClick={() => setShowNewScriptModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
              style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
            >
              <Plus size={20} />
              New Solution
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search scripts, descriptions, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none"
          >
            <option value="modified">Recently Modified</option>
            <option value="usage">Most Used</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            All ({scripts.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedCategory === cat.name
                  ? 'text-white font-semibold'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.name ? cat.color : undefined
              }}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {sortedScripts.length === 0 ? (
          <div className="text-center py-12">
            <FileCode2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Scripts Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first PowerShell solution with HTML reporting'}
            </p>
            <button
              onClick={() => setShowNewScriptModal(true)}
              className="px-6 py-3 rounded transition-colors inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
            >
              <Plus size={20} />
              Create New Solution
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedScripts.map(script => (
              <div
                key={script.id}
                className="bg-gray-900 border rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer relative"
                style={{
                  borderColor: getCategoryColor(script.category),
                  borderWidth: '2px'
                }}
                onClick={() => {
                  setSelectedScript(script.id)
                  setEditTitle(script.title)
                  setEditDescription(script.description)
                  setEditScriptContent(script.scriptContent)
                  setEditHtmlReportContent(script.htmlReportContent)
                  setEditVersion(script.version)
                  setEditTags(script.tags.join(', '))
                  setEditCategory(script.category)
                  setIsEditing(true)
                }}
              >
                {/* Pin indicator */}
                {script.isPinned && (
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                )}

                {/* Script Title and Version */}
                <div className="mb-2">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: getCategoryColor(script.category) }}>
                    {script.title}
                  </h3>
                  <span className="text-xs text-gray-500">Version {script.version}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {script.description}
                </p>

                {/* Category */}
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <Folder className="w-3 h-3" style={{ color: getCategoryColor(script.category) }} />
                  <span style={{ color: getCategoryColor(script.category) }}>
                    {script.category}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1">
                      {getRatingStars(script.rating)}
                    </div>
                    <span>• {script.usageCount} uses</span>
                  </div>
                  <Calendar className="w-3 h-3" />
                </div>

                {/* Tags */}
                {script.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {script.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    {script.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{script.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      copyToClipboard(script.scriptContent, 'script')
                      incrementUsage(script.id)
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setSelectedScript(script.id)
                      setShowHtmlPreview(true)
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} />
                    Report
                  </button>
                  <button
                    onClick={() => deleteScript(script.id)}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Script Modal */}
      {isEditing && selectedScriptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                Edit Solution
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(selectedScriptData.id)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    selectedScriptData.isPinned
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  {selectedScriptData.isPinned ? 'Pinned' : 'Pin'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Version</label>
                <input
                  type="text"
                  value={editVersion}
                  onChange={(e) => setEditVersion(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="monitoring, automation, reporting"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-gray-700">
              <button
                onClick={() => setViewMode('script')}
                className={`px-4 py-2 font-medium transition-colors ${
                  viewMode === 'script'
                    ? 'border-b-2 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                style={{ borderColor: viewMode === 'script' ? 'var(--primary-accent)' : 'transparent' }}
              >
                <Code size={16} className="inline mr-2" />
                PowerShell Script
              </button>
              <button
                onClick={() => setViewMode('report')}
                className={`px-4 py-2 font-medium transition-colors ${
                  viewMode === 'report'
                    ? 'border-b-2 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                style={{ borderColor: viewMode === 'report' ? 'var(--primary-accent)' : 'transparent' }}
              >
                <Globe size={16} className="inline mr-2" />
                HTML Report
              </button>
            </div>

            {/* Script Content */}
            {viewMode === 'script' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Script Content (.ps1)</label>
                  <button
                    onClick={() => copyToClipboard(editScriptContent, 'script')}
                    className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1"
                  >
                    <Copy size={12} />
                    Copy Script
                  </button>
                </div>
                <textarea
                  value={editScriptContent}
                  onChange={(e) => setEditScriptContent(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm resize-none focus:outline-none focus:border-gray-600"
                  rows={15}
                  spellCheck={false}
                />
              </div>
            )}

            {/* HTML Report Content */}
            {viewMode === 'report' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">HTML Report Template</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowHtmlPreview(true)
                      }}
                      className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <button
                      onClick={() => copyToClipboard(editHtmlReportContent, 'report')}
                      className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors flex items-center gap-1"
                    >
                      <Copy size={12} />
                      Copy HTML
                    </button>
                  </div>
                </div>
                <textarea
                  value={editHtmlReportContent}
                  onChange={(e) => setEditHtmlReportContent(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm resize-none focus:outline-none focus:border-gray-600"
                  rows={15}
                  spellCheck={false}
                />
              </div>
            )}

            {/* Metadata and Rating */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-4">
                <span>Used {selectedScriptData.usageCount} times</span>
                <div className="flex items-center gap-2">
                  <span>Rating:</span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(selectedScriptData.rating, selectedScriptData.id, true)}
                  </div>
                </div>
              </div>
              <span className="text-xs">Modified: {selectedScriptData.modified.toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={saveScript}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSelectedScript(null)
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Script Modal */}
      {showNewScriptModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                Create New Solution
              </h3>
              <button
                onClick={() => setShowNewScriptModal(false)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Script Title *</label>
                <input
                  type="text"
                  value={newScriptTitle}
                  onChange={(e) => setNewScriptTitle(e.target.value)}
                  placeholder="e.g., System Health Check"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newScriptDescription}
                  onChange={(e) => setNewScriptDescription(e.target.value)}
                  placeholder="Brief description of what this script does and what reports it generates"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newScriptCategory}
                    onChange={(e) => setNewScriptCategory(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Version</label>
                  <input
                    type="text"
                    value={newScriptVersion}
                    onChange={(e) => setNewScriptVersion(e.target.value)}
                    placeholder="1.0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newScriptTags}
                  onChange={(e) => setNewScriptTags(e.target.value)}
                  placeholder="monitoring, automation, reporting"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createScript}
                className="flex-1 px-4 py-2 rounded transition-colors"
                style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
              >
                Create Solution
              </button>
              <button
                onClick={() => setShowNewScriptModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                Create New Category
              </h3>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Database Scripts"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief description of this category"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-12 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createCategory}
                className="flex-1 px-4 py-2 rounded transition-colors"
                style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
              >
                Create Category
              </button>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Preview Modal */}
      {showHtmlPreview && selectedScriptData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                HTML Report Preview - {selectedScriptData.title}
              </h3>
              <button
                onClick={() => setShowHtmlPreview(false)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
              <iframe
                srcDoc={selectedScriptData.htmlReportContent}
                className="w-full h-full min-h-[600px] border-0"
                title="HTML Report Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
