'use client'

import { useState, useEffect, useRef } from 'react'
import { createBulletproofStorage } from '../../lib/bulletproofStorage'
import { 
  FolderOpen, 
  File, 
  Plus, 
  Edit3, 
  Save, 
  Clock, 
  Play, 
  Pause, 
  Square,
  ChevronRight,
  ChevronDown,
  Code,
  FileText,
  Globe,
  Terminal,
  Eye,
  ExternalLink,
  Monitor,
  Trash2,
  BookOpen
} from 'lucide-react'

interface FileVersion {
  id: string
  content: string
  timestamp: Date
  description: string
}

interface ProjectFile {
  id: string
  name: string
  type: 'script' | 'html' | 'document' | 'code' | 'markdown' | 'other'
  category: string
  content: string
  versions: FileVersion[]
  created: Date
  modified: Date
  timeSpent: number // in seconds
}

interface Project {
  id: string
  name: string
  description: string
  files: ProjectFile[]
  totalTimeSpent: number
  created: Date
  isTimerRunning: boolean
  timerStartTime?: Date
}

interface TimerState {
  activeProject: string | null
  startTime: Date | null
  currentTime: number
}

export default function Prod() {
  // BULLETPROOF STORAGE - ENTERPRISE GRADE
  const bulletproofStorage = createBulletproofStorage('PROD', 'nishen-workspace-prod')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [timer, setTimer] = useState<TimerState>({ activeProject: null, startTime: null, currentTime: 0 })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  
  
  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'script' | 'html' | 'document' | 'code' | 'markdown' | 'other'>('script')
  const [newFileCategory, setNewFileCategory] = useState('')
  const [versionDescription, setVersionDescription] = useState('')

  const timerRef = useRef<NodeJS.Timeout>()

  // Timer effect
  useEffect(() => {
    if (timer.activeProject && timer.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timer.startTime!.getTime()) / 1000)
        setTimer(prev => ({ ...prev, currentTime: elapsed }))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timer.activeProject, timer.startTime])

  // BULLETPROOF DATA LOADING - ENTERPRISE GRADE
  useEffect(() => {
    let processedProjects = bulletproofStorage.loadData([])
    
    // Convert date strings back to Date objects if needed
    if (processedProjects.length > 0) {
      processedProjects = processedProjects.map((p: any) => ({
        ...p,
        created: new Date(p.created),
        timerStartTime: p.timerStartTime ? new Date(p.timerStartTime) : undefined,
        files: p.files.map((f: any) => ({
          ...f,
          created: new Date(f.created),
          modified: new Date(f.modified),
          versions: f.versions.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          }))
        }))
      }))
    }

    // Default demo data if no saved data
    const demoProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'Production RMS Tools',
        description: 'Live production system administration tools and scripts',
        files: [
          {
            id: 'file-1',
            name: 'live-monitor.ps1',
            type: 'script',
            category: 'Monitoring',
            content: '# Production Live Monitor Script\n# Author: Nishen Harichunder\n# WARNING: This script runs in production environment\n\nParam(\n    [string]$Environment = "PRODUCTION",\n    [switch]$AlertMode = $true\n)\n\nWrite-Host "Starting production monitor for environment: $Environment" -ForegroundColor Red\n\n# Production monitoring logic here\nif ($AlertMode) {\n    Write-Host "ALERT MODE ENABLED - Will send notifications on issues" -ForegroundColor Yellow\n}\n\n# Add your production monitoring logic here',
            versions: [],
            created: new Date('2025-05-01'),
            modified: new Date('2025-07-08'),
            timeSpent: 14400 // 4 hours
          },
          {
            id: 'file-2',
            name: 'prod-status-dashboard.html',
            type: 'html',
            category: 'Dashboard',
            content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Production Status Dashboard</title>\n    <style>\n        body { font-family: Arial, sans-serif; background: #000; color: #fff; }\n        .header { background: #ff073a; color: white; padding: 20px; text-align: center; }\n        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; padding: 20px; }\n        .status-card { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; }\n        .status-green { border-left: 4px solid #00ff00; }\n        .status-red { border-left: 4px solid #ff0000; }\n        .status-yellow { border-left: 4px solid #ffff00; }\n    </style>\n</head>\n<body>\n    <div class="header">\n        <h1>🚀 Production Status Dashboard</h1>\n        <p>Live system monitoring for RMS Production Environment</p>\n    </div>\n    <div class="status-grid">\n        <div class="status-card status-green">\n            <h3>✅ Web Services</h3>\n            <p>All services operational</p>\n            <small>Last check: 2 minutes ago</small>\n        </div>\n        <div class="status-card status-green">\n            <h3>✅ Database</h3>\n            <p>Performance optimal</p>\n            <small>Response time: 45ms</small>\n        </div>\n        <div class="status-card status-yellow">\n            <h3>⚠️ Storage</h3>\n            <p>85% capacity used</p>\n            <small>Monitoring closely</small>\n        </div>\n        <div class="status-card status-green">\n            <h3>✅ Security</h3>\n            <p>No threats detected</p>\n            <small>Last scan: 1 hour ago</small>\n        </div>\n    </div>\n</body>\n</html>',
            versions: [],
            created: new Date('2025-05-15'),
            modified: new Date('2025-07-08'),
            timeSpent: 7200 // 2 hours
          }
        ],
        totalTimeSpent: 21600,
        created: new Date('2025-05-01'),
        isTimerRunning: false
      }
    ]
    
    // SAFE PATTERN: Merge user data with demo data, preserve user projects
    if (processedProjects.length === 0) {
      // No user data, use demo data
      setProjects(demoProjects)
    } else {
      // Have user data, check if demo projects exist and add them if missing
      const userProjectIds = new Set(processedProjects.map(p => p.id))
      const missingDemoProjects = demoProjects.filter(demo => !userProjectIds.has(demo.id))
      
      if (missingDemoProjects.length > 0) {
        // Add missing demo projects to user data
        setProjects([...processedProjects, ...missingDemoProjects])
      } else {
        // User has all demo projects, keep their data
        setProjects(processedProjects)
      }
    }
    setExpandedProjects(new Set(['proj-1']))
  }, [])

  // BULLETPROOF SAVE - ENTERPRISE GRADE
  const saveToLocalStorage = (projectsData: Project[]) => {
    try {
      bulletproofStorage.saveData(projectsData, 'USER_SAVE')
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  // Auto-save whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      saveToLocalStorage(projects)
    }
  }, [projects])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'script': return <Terminal className="w-4 h-4 text-neon-red" />
      case 'html': return <Globe className="w-4 h-4 text-british-silver" />
      case 'code': return <Code className="w-4 h-4 text-blue-400" />
      case 'document': return <FileText className="w-4 h-4 text-green-400" />
      case 'markdown': return <BookOpen className="w-4 h-4 text-purple-400" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const startTimer = (projectId: string) => {
    // Stop any running timer first
    if (timer.activeProject && timer.startTime) {
      stopTimer()
    }
    
    setTimer({
      activeProject: projectId,
      startTime: new Date(),
      currentTime: 0
    })
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, isTimerRunning: true, timerStartTime: new Date() }
        : { ...p, isTimerRunning: false }
    ))
  }

  const stopTimer = () => {
    if (timer.activeProject && timer.startTime) {
      const elapsed = Math.floor((Date.now() - timer.startTime.getTime()) / 1000)
      
      setProjects(prev => prev.map(p => 
        p.id === timer.activeProject
          ? { 
              ...p, 
              totalTimeSpent: p.totalTimeSpent + elapsed,
              isTimerRunning: false,
              timerStartTime: undefined
            }
          : p
      ))
    }
    
    setTimer({ activeProject: null, startTime: null, currentTime: 0 })
  }

  const createProject = () => {
    if (!newProjectName.trim()) return
    
    const newProjectId = `proj-${Date.now()}`
    const newProject: Project = {
      id: newProjectId,
      name: newProjectName,
      description: newProjectDesc,
      files: [],
      totalTimeSpent: 0,
      created: new Date(),
      isTimerRunning: false
    }
    
    setProjects(prev => [...prev, newProject])
    
    // Auto-select and expand the new project
    setSelectedProject(newProjectId)
    setExpandedProjects(prev => new Set([...prev, newProjectId]))
    
    setNewProjectName('')
    setNewProjectDesc('')
    setShowNewProjectModal(false)
  }

  const createFile = () => {
    if (!newFileName.trim() || !selectedProject) return
    
    // Auto-detect file type from extension if not manually set
    const fileExt = newFileName.split('.').pop()?.toLowerCase()
    let actualFileType = newFileType
    
    // Override file type based on extension for better compatibility
    if (fileExt === 'html' || fileExt === 'htm') {
      actualFileType = 'html'
    } else if (fileExt === 'md' || fileExt === 'markdown') {
      actualFileType = 'markdown'
    } else if (fileExt === 'ps1' || fileExt === 'bat' || fileExt === 'sh') {
      actualFileType = 'script'
    } else if (['js', 'jsx', 'ts', 'tsx', 'py', 'cpp', 'java'].includes(fileExt || '')) {
      actualFileType = 'code'
    } else if (['txt', 'doc'].includes(fileExt || '')) {
      actualFileType = 'document'
    }
    
    // Generate appropriate default content based on actual file type
    let defaultContent = ''
    switch (actualFileType) {
      case 'html':
        defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newFileName.replace(/\.(html|htm)$/i, '')}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #ff073a 0%, #000000 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #fff;
            text-align: center;
            margin-bottom: 30px;
        }
        .prod-warning {
            background: rgba(255, 7, 58, 0.2);
            padding: 20px;
            margin: 15px 0;
            border-radius: 10px;
            border-left: 4px solid #ff073a;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${newFileName.replace(/\.(html|htm)$/i, '')}</h1>
        <div class="prod-warning">
            <h3>🔴 PRODUCTION ENVIRONMENT</h3>
            <p>This file is created in the production workspace. Exercise caution:</p>
            <ul>
                <li>Test changes in development first</li>
                <li>Review code before deployment</li>
                <li>Monitor system after changes</li>
                <li>Have rollback plan ready</li>
            </ul>
        </div>
    </div>
    
    <script>
        console.log('Production HTML file loaded in Nishen\\'s AI Workspace!');
        // Add your production JavaScript here
    </script>
</body>
</html>`
        break
      case 'script':
        defaultContent = `# Production PowerShell Script
# Created in Nishen's AI Workspace - PRODUCTION ENVIRONMENT
# File: ${newFileName}
# WARNING: This script will run in production - use extreme caution

param(
    [string]$Environment = "PRODUCTION",
    [switch]$DryRun = $false
)

# Production safety check
if ($Environment -eq "PRODUCTION" -and -not $DryRun) {
    Write-Host "⚠️  PRODUCTION MODE ENABLED - This will affect live systems!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Starting production script: ${newFileName}" -ForegroundColor Green

try {
    # Add your production script logic here
    Write-Host "Production script execution completed successfully!" -ForegroundColor Green
}
catch {
    Write-Error "Production script failed: $_"
    # Add production error handling/alerting here
    exit 1
}`
        break
      case 'code':
        const fileExt = newFileName.split('.').pop()?.toLowerCase()
        if (fileExt === 'js' || fileExt === 'jsx') {
          defaultContent = `// Production JavaScript/React Component
// Created in Nishen's AI Workspace - PRODUCTION ENVIRONMENT

/**
 * ${newFileName} - Production component
 * WARNING: This code will run in production environment
 */

const ENVIRONMENT = 'PRODUCTION';

export default function ${newFileName.replace(/\.(js|jsx)$/i, '').replace(/[^a-zA-Z0-9]/g, '')}() {
  // Production safety checks
  if (ENVIRONMENT === 'PRODUCTION') {
    console.warn('🔴 Running in production environment');
  }

  return (
    <div className="production-component">
      <h1>🚀 Production: ${newFileName}</h1>
      <p>Created in Nishen's AI Workspace (Production Environment)</p>
      <div className="prod-warning">
        ⚠️ Production Environment - Monitor carefully
      </div>
    </div>
  );
}`
        } else if (fileExt === 'ts' || fileExt === 'tsx') {
          defaultContent = `// Production TypeScript Component
// Created in Nishen's AI Workspace - PRODUCTION ENVIRONMENT

interface Props {
  title?: string;
  environment?: 'development' | 'production';
}

/**
 * ${newFileName} - Production component
 * WARNING: This code will run in production environment
 */
export default function ${newFileName.replace(/\.(ts|tsx)$/i, '').replace(/[^a-zA-Z0-9]/g, '')}({ 
  title = "Production Component",
  environment = "production"
}: Props) {
  
  // Production safety checks
  if (environment === 'production') {
    console.warn('🔴 Running in production environment');
  }

  return (
    <div className="production-component">
      <h1>🚀 {title}</h1>
      <p>Created in Nishen's AI Workspace (Production Environment)</p>
      <div className="prod-warning">
        ⚠️ Production Environment - Monitor carefully
      </div>
    </div>
  );
}`
        } else {
          defaultContent = `// Production ${newFileName}
// Created in Nishen's AI Workspace - PRODUCTION ENVIRONMENT
// WARNING: This code will run in production

const ENVIRONMENT = 'PRODUCTION';

function main() {
    if (ENVIRONMENT === 'PRODUCTION') {
        console.warn('🔴 Running in production environment');
    }
    
    console.log("Production system: ${newFileName}");
    // Add your production code here
}

main();`
        }
        break
      case 'markdown':
        defaultContent = `# ${newFileName.replace(/\.(md|markdown)$/i, '')}

> **⚠️ PRODUCTION ENVIRONMENT** | Created in Nishen's AI Workspace | ${new Date().toLocaleDateString()}

## 🚀 Production Overview

This document is part of the production environment. All changes should be:
- **Tested thoroughly** before implementation
- **Reviewed** by team members
- **Monitored** after deployment
- **Documented** for audit trails

## 📋 Production Checklist

- [ ] Code reviewed and approved
- [ ] Security scan completed
- [ ] Performance tested
- [ ] Backup plan prepared
- [ ] Monitoring alerts configured
- [ ] Documentation updated

## 🔧 Production Features

### System Requirements
- Production-ready infrastructure
- Scalable architecture
- High availability setup
- Security compliance

### Monitoring
- Real-time alerts
- Performance metrics
- Error tracking
- Audit logging

## 📊 Production Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|---------|
| Uptime | 99.9% | 99.95% | ✅ |
| Response Time | <200ms | 45ms | ✅ |
| Error Rate | <0.1% | 0.05% | ✅ |

## 🔒 Security Notes

- All access logged and monitored
- Regular security scans performed
- Compliance requirements met
- Incident response plan active

---

*Production Environment - Nishen's AI Workspace | Handle with Care*`
        break
      case 'document':
        defaultContent = `${newFileName.replace(/\.(txt|doc)$/i, '')}
${'='.repeat(newFileName.length)}

⚠️ PRODUCTION ENVIRONMENT DOCUMENT
Created in Nishen's AI Workspace on ${new Date().toLocaleDateString()}

IMPORTANT: This document relates to production systems.

Overview:
---------
Production document description here.

Production Requirements:
-----------------------
- Change control process followed
- Approval from authorized personnel
- Testing completed in staging environment
- Rollback plan documented

Contents:
---------
- Production procedures
- Emergency contacts
- Escalation procedures
- Monitoring guidelines

Notes:
------
Add your production documentation content here.

Remember: All production changes must be properly documented and approved.`
        break
      default:
        defaultContent = `// Production ${newFileName}
// Created in Nishen's AI Workspace - PRODUCTION ENVIRONMENT
// File type: ${newFileType}

⚠️ PRODUCTION ENVIRONMENT - Handle with care

Add your production content here...`
    }
    
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: actualFileType,
      category: newFileCategory || 'Production',
      content: defaultContent,
      versions: [],
      created: new Date(),
      modified: new Date(),
      timeSpent: 0
    }
    
    setProjects(prev => prev.map(p => 
      p.id === selectedProject
        ? { ...p, files: [...p.files, newFile] }
        : p
    ))
    
    setNewFileName('')
    setNewFileCategory('')
    setShowNewFileModal(false)
  }

  const saveFileVersion = () => {
    if (!selectedFile || !selectedProject) return
    
    const version: FileVersion = {
      id: `ver-${Date.now()}`,
      content: editContent,
      timestamp: new Date(),
      description: versionDescription || 'Auto-saved version'
    }
    
    setProjects(prev => prev.map(p => 
      p.id === selectedProject
        ? {
            ...p,
            files: p.files.map(f => 
              f.id === selectedFile
                ? {
                    ...f,
                    content: editContent,
                    modified: new Date(),
                    versions: [...f.versions, version]
                  }
                : f
            )
          }
        : p
    ))
    
    setVersionDescription('')
    setShowVersionModal(false)
    setIsEditing(false)
  }

  const deleteFile = (fileId: string) => {
    if (confirm('⚠️ PRODUCTION WARNING: Are you sure you want to delete this production file? This action cannot be undone and may affect live systems.')) {
      setProjects(prev => prev.map(p => 
        p.id === selectedProject
          ? { ...p, files: p.files.filter(f => f.id !== fileId) }
          : p
      ))
      
      // Clear selection if deleted file was selected
      if (selectedFile === fileId) {
        setSelectedFile(null)
        setIsEditing(false)
        setIsPreviewMode(false)
      }
    }
  }

  // Simple markdown renderer (basic implementation)
  const renderMarkdown = (content: string): string => {
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-purple-300">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 text-purple-200">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*\*(.*)\*\*\*/gim, '<strong><em class="text-yellow-300">$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="text-gray-300 italic">$1</em>')
      
      // Code blocks (Mermaid special handling)
      .replace(/```mermaid\n([\s\S]*?)\n```/gim, '<div class="mermaid-diagram bg-white p-4 rounded mb-4" data-mermaid="$1">[Mermaid Diagram - Content: $1]</div>')
      .replace(/```(\w+)?\n([\s\S]*?)\n```/gim, '<pre class="bg-gray-800 p-4 rounded mb-4 overflow-x-auto"><code class="text-green-400 text-sm">$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-700 px-2 py-1 rounded text-green-300">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-green-400 mr-2">✅</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-gray-500 mr-2">☐</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- (.*$)/gim, '<div class="flex items-start mb-1"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">$1</span></div>')
      
      // Tables
      .replace(/\|(.+)\|/gim, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim())
        return '<tr>' + cells.map((cell: string) => `<td class="border border-gray-600 px-3 py-2 text-gray-300">${cell}</td>`).join('') + '</tr>'
      })
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 mb-4 text-gray-300 italic bg-gray-800/50 py-2">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-gray-600 my-6">')
      
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-300">')
      .replace(/\n/gim, '<br>')

    // Wrap in paragraph tags
    if (!html.startsWith('<')) {
      html = '<p class="mb-4 text-gray-300">' + html + '</p>'
    }

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>)/gims, '<table class="w-full border-collapse border border-gray-600 mb-4">$1</table>')

    return html
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedFileData = selectedProjectData?.files.find(f => f.id === selectedFile)

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Projects & Files */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
              🚀 Production Files
            </h2>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Project
            </button>
          </div>
          
          {/* Production Warning */}
          <div className="bg-red-900/30 border border-red-600/50 rounded p-2 mb-4">
            <div className="text-xs text-red-300">
              ⚠️ PRODUCTION ENVIRONMENT - Exercise extreme caution
            </div>
          </div>
          
          {/* Timer Display */}
          {timer.activeProject && (
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Active Timer</span>
                <span className="text-lg font-mono" style={{ color: 'var(--primary-accent)' }}>
                  {formatTime(timer.currentTime)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {projects.find(p => p.id === timer.activeProject)?.name}
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4">
          {projects.map(project => (
            <div key={project.id} className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div 
                  className="flex items-center cursor-pointer flex-1"
                  onClick={() => {
                    if (expandedProjects.has(project.id)) {
                      setExpandedProjects(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(project.id)
                        return newSet
                      })
                    } else {
                      setExpandedProjects(prev => new Set([...prev, project.id]))
                    }
                  }}
                >
                  {expandedProjects.has(project.id) ? 
                    <ChevronDown className="w-4 h-4 mr-2" /> : 
                    <ChevronRight className="w-4 h-4 mr-2" />
                  }
                  <FolderOpen className="w-4 h-4 mr-2 text-red-400" />
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatTime(project.totalTimeSpent + (project.id === timer.activeProject ? timer.currentTime : 0))}
                    </div>
                  </div>
                </div>
                
                {/* Timer Controls */}
                <div className="flex space-x-1">
                  {project.isTimerRunning ? (
                    <button
                      onClick={() => stopTimer()}
                      className="p-1 hover:bg-gray-700 rounded text-red-400"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => startTimer(project.id)}
                      className="p-1 hover:bg-gray-700 rounded text-green-400"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedProject(project.id)
                      setShowNewFileModal(true)
                    }}
                    className="p-1 hover:bg-gray-700 rounded"
                    style={{ color: 'var(--primary-accent)' }}
                    title="Add new file to this project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Files List */}
              {expandedProjects.has(project.id) && (
                <div className="ml-6 mt-2 space-y-1">
                  {project.files.map(file => (
                    <div
                      key={file.id}
                      className={`group flex items-center p-2 rounded cursor-pointer transition-colors relative ${
                        selectedFile === file.id 
                          ? 'border' 
                          : 'hover:bg-gray-800'
                      }`}
                      style={{
                        backgroundColor: selectedFile === file.id ? 'var(--primary-accent)' + '20' : undefined,
                        borderColor: selectedFile === file.id ? 'var(--primary-accent)' + '40' : 'transparent'
                      }}
                    >
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project.id)
                          setSelectedFile(file.id)
                          setEditContent(file.content)
                          setIsEditing(false)
                          setIsPreviewMode(false)
                        }}
                      >
                        {getFileIcon(file.type)}
                        <div className="ml-2 flex-1">
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-400">
                            {file.category} • {formatTime(file.timeSpent)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {file.type === 'html' && (
                              <Monitor className="w-3 h-3 text-blue-400" />
                            )}
                            {file.type === 'markdown' && (
                              <BookOpen className="w-3 h-3 text-purple-400" />
                            )}
                            <span className="text-xs text-gray-500">
                              {file.versions.length} versions
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFile(file.id)
                            }}
                            className="p-1 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete production file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - File Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFileData ? (
          <>
            {/* File Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedFileData.type)}
                  <div>
                    <h3 className="font-semibold flex items-center">
                      {selectedFileData.name}
                      <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">PROD</span>
                    </h3>
                    <div className="text-sm text-gray-400">
                      {selectedFileData.category} • Modified: {selectedFileData.modified.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* HTML/Markdown Preview Button */}
                  {(selectedFileData.type === 'html' || selectedFileData.type === 'markdown') && !isEditing && (
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isPreviewMode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : selectedFileData.type === 'html' 
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {selectedFileData.type === 'markdown' ? (
                        <BookOpen className="w-4 h-4 inline mr-1" />
                      ) : (
                        <Monitor className="w-4 h-4 inline mr-1" />
                      )}
                      {isPreviewMode ? 'Show Code' : selectedFileData.type === 'markdown' ? 'Render' : 'Preview'}
                    </button>
                  )}
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setShowVersionModal(true)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save Version
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditContent(selectedFileData.content)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  
                  <div className="text-sm text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(selectedFileData.timeSpent)}
                  </div>
                </div>
              </div>
            </div>

            {/* Production Warning Banner */}
            {isEditing && (
              <div className="bg-red-900/50 border-b border-red-600/50 p-2">
                <div className="text-center text-red-200 text-sm">
                  ⚠️ EDITING PRODUCTION FILE - Changes will affect live systems
                </div>
              </div>
            )}

            {/* File Content */}
            <div className="flex-1 p-4">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-red-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
                  style={{ borderColor: 'var(--primary-accent)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#dc2626'}
                  placeholder="Enter your production code/content here..."
                />
              ) : selectedFileData.type === 'html' && isPreviewMode ? (
                <div className="w-full h-full bg-white border border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={selectedFileData.content}
                    className="w-full h-full border-0"
                    title={`Preview of ${selectedFileData.name}`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    style={{ minHeight: '500px' }}
                  />
                </div>
              ) : selectedFileData.type === 'markdown' && isPreviewMode ? (
                <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg p-6 overflow-auto">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(selectedFileData.content) 
                    }}
                  />
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <p className="text-sm text-red-300">
                      🚀 <strong>Production Markdown:</strong> This content is rendered in the production environment. 
                      Ensure all links and references are production-ready.
                    </p>
                  </div>
                </div>
              ) : (
                <pre className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-auto">
                  {selectedFileData.content}
                </pre>
              )}
            </div>

            {/* Versions Panel */}
            {selectedFileData.versions.length > 0 && (
              <div className="border-t border-gray-800 bg-gray-900 p-4">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--primary-accent)' }}>Version History</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                  {selectedFileData.versions.map((version, index) => (
                    <div key={version.id} className="bg-gray-800 p-3 rounded border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">v{index + 1}</span>
                        <span className="text-xs text-gray-400">
                          {version.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{version.description}</p>
                      <button
                        onClick={() => {
                          setEditContent(version.content)
                          setIsEditing(true)
                        }}
                        className="mt-2 text-xs hover:opacity-80"
                        style={{ color: 'var(--primary-accent)' }}
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        Load Version
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Production File Selected</h3>
              <p className="text-gray-500">Select a file from the project list to view and edit</p>
              <div className="mt-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-sm text-red-300">
                  🚀 <strong>Production Environment:</strong> All files in this section affect live systems.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>
              🚀 New Production Project
            </h3>
            <div className="bg-red-900/30 border border-red-600/50 rounded p-3 mb-4">
              <p className="text-sm text-red-300">
                ⚠️ This project will contain production files that affect live systems.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Enter production project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  rows={3}
                  placeholder="Production project description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="px-4 py-2 rounded transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Create Production Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>
              🚀 New Production File
            </h3>
            <div className="bg-red-900/30 border border-red-600/50 rounded p-3 mb-4">
              <p className="text-sm text-red-300">
                ⚠️ This file will be deployed to production and affect live systems.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder={
                    newFileType === 'html' ? 'prod-dashboard.html' :
                    newFileType === 'markdown' ? 'prod-docs.md' :
                    newFileType === 'script' ? 'prod-deploy.ps1' :
                    newFileType === 'code' ? 'prod-component.js' :
                    newFileType === 'document' ? 'prod-manual.txt' :
                    'prod-filename.ext'
                  }
                />
                <p className="text-xs text-red-400 mt-1">
                  ⚠️ Include file extension for proper preview/editing in production
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File Type</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                >
                  <option value="script">Script</option>
                  <option value="html">HTML</option>
                  <option value="markdown">Markdown</option>
                  <option value="code">Code</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Production, Deployment, Monitoring, etc."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createFile}
                className="px-4 py-2 rounded transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Create Production File
              </button>
            </div>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Save Production Version</h3>
            <div className="bg-red-900/30 border border-red-600/50 rounded p-3 mb-4">
              <p className="text-sm text-red-300">
                ⚠️ This version will be saved for production rollback purposes.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Version Description</label>
                <input
                  type="text"
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="What production changes did you make?"
                />
              </div>
              <div className="text-sm text-gray-400">
                This will save the current content as a new production version with timestamp: {new Date().toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveFileVersion}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Save Production Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}