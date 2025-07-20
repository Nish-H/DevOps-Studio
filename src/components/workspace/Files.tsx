'use client'

import { useState, useEffect, useRef } from 'react'
import { createBulletproofStorage } from '../../lib/bulletproofStorage'
import ContactDetails from './ContactDetails'
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
  BookOpen,
  Download,
  FileDown,
  Upload,
  HardDrive
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

export default function Files() {
  // BULLETPROOF STORAGE - ENTERPRISE GRADE
  const bulletproofStorage = createBulletproofStorage('FILES', 'nishen-workspace-dev')
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [timer, setTimer] = useState<TimerState>({ activeProject: null, startTime: null, currentTime: 0 })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  
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

  // Load data from localStorage or demo data
  useEffect(() => {
    // Try new key first, then fallback to old key for existing users
    let savedData = localStorage.getItem('nishen-workspace-dev')
    if (!savedData) {
      savedData = localStorage.getItem('nishen-workspace-files')
      // If we found old data, migrate it to new key
      if (savedData) {
        localStorage.setItem('nishen-workspace-dev', savedData)
        console.log('✅ Migrated existing files to Dev section')
        console.log('📁 Found projects:', JSON.parse(savedData).length)
        // Show user-friendly notification
        alert('✅ Your existing files have been migrated to the Dev section!')
      }
    }
    
    // BULLETPROOF DATA LOADING - ENTERPRISE GRADE  
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
        name: 'RMS Tools Collection',
        description: 'Professional system administration tools and scripts',
        files: [
          {
            id: 'file-1',
            name: 'password-audit.ps1',
            type: 'script',
            category: 'Security',
            content: '# PowerShell Password Audit Script\n# Author: Nishen Harichunder\n\nParam(\n    [string]$Domain = $env:USERDNSDOMAIN\n)\n\nWrite-Host "Starting password audit for domain: $Domain" -ForegroundColor Green\n\n# Add your audit logic here',
            versions: [],
            created: new Date('2025-06-01'),
            modified: new Date('2025-06-25'),
            timeSpent: 7200 // 2 hours
          },
          {
            id: 'file-2',
            name: 'incident-report.html',
            type: 'html',
            category: 'Reporting',
            content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>RMS Incident Report</title>\n    <style>\n        body { font-family: Arial, sans-serif; }\n        .header { background: #003366; color: white; padding: 20px; }\n    </style>\n</head>\n<body>\n    <div class="header">\n        <h1>RMS Incident Report</h1>\n    </div>\n</body>\n</html>',
            versions: [],
            created: new Date('2025-06-10'),
            modified: new Date('2025-06-28'),
            timeSpent: 5400 // 1.5 hours
          }
        ],
        totalTimeSpent: 12600,
        created: new Date('2025-06-01'),
        isTimerRunning: false
      },
      {
        id: 'proj-2',
        name: 'AI Workspace Development',
        description: 'Next.js workspace development project',
        files: [
          {
            id: 'file-3',
            name: 'workspace-component.tsx',
            type: 'code',
            category: 'Frontend',
            content: "import React from 'react'\n\ninterface WorkspaceProps {\n  theme: 'dark' | 'light'\n}\n\nexport default function Workspace({ theme }: WorkspaceProps) {\n  return (\n    <div className={`workspace ${theme}`}>\n      <h1>Nishen's AI Workspace</h1>\n    </div>\n  )\n}",
            versions: [],
            created: new Date('2025-06-30'),
            modified: new Date('2025-06-30'),
            timeSpent: 3600 // 1 hour
          }
        ],
        totalTimeSpent: 3600,
        created: new Date('2025-06-30'),
        isTimerRunning: false
      }
    ]
    
    // SAFE PATTERN: Merge user data with demo data, preserve user projects
    if (processedProjects.length === 0) {
      // No user data, use demo data
      setProjects(demoProjects)
    } else {
      // Have user data, check if demo projects exist and add them if missing
      const userProjectIds = new Set(processedProjects.map((p: any) => p.id))
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .feature {
            background: rgba(255, 255, 255, 0.1);
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
        <div class="feature">
            <h3>✨ Welcome to your new HTML file!</h3>
            <p>This HTML file was created in Nishen's AI Workspace. You can:</p>
            <ul>
                <li>Edit the content using the editor</li>
                <li>Preview it live using the Preview button</li>
                <li>Save versions for backup</li>
                <li>Track time spent working on it</li>
            </ul>
        </div>
        <div class="feature">
            <h3>🎨 Styling</h3>
            <p>This template includes some modern CSS with glassmorphism effects, gradients, and responsive design.</p>
        </div>
        <div class="feature">
            <h3>🔧 Ready to customize</h3>
            <p>Start building your tool, report, or application!</p>
        </div>
    </div>
    
    <script>
        console.log('HTML file loaded in Nishen\\'s AI Workspace!');
        // Add your JavaScript here
    </script>
</body>
</html>`
        break
      case 'script':
        defaultContent = `# PowerShell Script
# Created in Nishen's AI Workspace
# File: ${newFileName}

param(
    [string]$InputPath = ".",
    [switch]$Verbose
)

# Script description and usage
Write-Host "Starting ${newFileName}..." -ForegroundColor Green

try {
    # Add your script logic here
    Write-Host "Script execution completed successfully!" -ForegroundColor Green
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}`
        break
      case 'code':
        const fileExt = newFileName.split('.').pop()?.toLowerCase()
        if (fileExt === 'js' || fileExt === 'jsx') {
          defaultContent = `// JavaScript/React Component
// Created in Nishen's AI Workspace

/**
 * ${newFileName} - Description of your component/function
 */

export default function ${newFileName.replace(/\.(js|jsx)$/i, '').replace(/[^a-zA-Z0-9]/g, '')}() {
  return (
    <div>
      <h1>Hello from ${newFileName}!</h1>
      <p>Created in Nishen's AI Workspace</p>
    </div>
  );
}`
        } else if (fileExt === 'ts' || fileExt === 'tsx') {
          defaultContent = `// TypeScript Component
// Created in Nishen's AI Workspace

interface Props {
  title?: string;
}

/**
 * ${newFileName} - Description of your component
 */
export default function ${newFileName.replace(/\.(ts|tsx)$/i, '').replace(/[^a-zA-Z0-9]/g, '')}({ title = "Hello World" }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Created in Nishen's AI Workspace</p>
    </div>
  );
}`
        } else {
          defaultContent = `// ${newFileName}
// Created in Nishen's AI Workspace

function main() {
    console.log("Hello from ${newFileName}!");
    // Add your code here
}

main();`
        }
        break
      case 'markdown':
        defaultContent = `# ${newFileName.replace(/\.(md|markdown)$/i, '')}

> **Created in Nishen's AI Workspace** | ${new Date().toLocaleDateString()}

## 📋 Overview

This is a comprehensive markdown document with support for diagrams, code blocks, and rich formatting.

## 🚀 Features Showcase

### Code Blocks
\`\`\`javascript
function greetUser(name) {
    console.log(\`Hello, \${name}! Welcome to Nishen's AI Workspace.\`);
}

greetUser('Developer');
\`\`\`

### Mermaid Diagrams
\`\`\`mermaid
graph TD
    A[Start Project] --> B{Choose File Type}
    B -->|HTML| C[Create HTML File]
    B -->|Markdown| D[Create MD File]
    B -->|Script| E[Create PS1 File]
    C --> F[Edit & Preview]
    D --> G[Edit & Render]
    E --> H[Edit & Execute]
    F --> I[Save Version]
    G --> I
    H --> I
\`\`\`

### System Architecture
\`\`\`mermaid
flowchart LR
    UI[User Interface] --> WS[Workspace]
    WS --> FM[File Manager]
    WS --> TE[Terminal]
    WS --> AI[Claude AI]
    FM --> PV[Preview Engine]
    FM --> VH[Version History]
\`\`\`

### Task Management
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Development
    Planning     :done, des1, 2025-01-01, 2025-01-07
    Implementation :active, des2, 2025-01-08, 2025-01-21
    Testing      :des3, after des2, 7d
    Deployment   :des4, after des3, 3d
\`\`\`

## 📊 Data Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| File Management | ✅ Complete | High | Full CRUD operations |
| HTML Preview | ✅ Complete | High | Live rendering |
| Markdown Rendering | 🚧 In Progress | High | With diagram support |
| Terminal Integration | ✅ Complete | Medium | Command simulation |

## 🎨 Rich Formatting

### Alerts & Callouts
> ⚠️ **Warning**: Always include file extensions for proper type detection
> 
> 💡 **Tip**: Use the preview feature to see your markdown rendered
> 
> ✅ **Success**: Your workspace supports real-time collaboration

### Lists & Checkboxes
- [x] Create markdown file type
- [x] Add syntax highlighting  
- [x] Support mermaid diagrams
- [ ] Add plantuml support
- [ ] Implement live collaboration

### Math Expressions (if supported)
\`\`\`
E = mc²
∑(x) = x₁ + x₂ + ... + xₙ
\`\`\`

## 🔗 Links & References

- [Mermaid Documentation](https://mermaid.js.org/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Nishen's AI Workspace](https://github.com/nishen/workspace)

---

*Generated by Nishen's AI Workspace - Professional Development Environment*`
        break
      case 'document':
        defaultContent = `# ${newFileName.replace(/\.(txt|doc)$/i, '')}

Created in Nishen's AI Workspace on ${new Date().toLocaleDateString()}

## Overview

Document description here.

## Contents

- Section 1
- Section 2
- Section 3

## Notes

Add your documentation content here.`
        break
      default:
        defaultContent = `// ${newFileName}
// Created in Nishen's AI Workspace
// File type: ${newFileType}

Add your content here...`
    }
    
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: actualFileType,
      category: newFileCategory || 'General',
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
    if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
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

  // Export functionality
  const exportFile = (format: 'ps1' | 'docx' | 'html' | 'txt' | 'pdf') => {
    if (!selectedFileData) return
    
    let content = selectedFileData.content
    let filename = selectedFileData.name
    let mimeType = 'text/plain'
    
    // Remove file extension and add new one based on format
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
    
    switch (format) {
      case 'ps1':
        filename = `${nameWithoutExt}.ps1`
        mimeType = 'text/plain'
        if (selectedFileData.type !== 'script') {
          content = `# Exported from Nishen's AI Workspace\n# Original file: ${selectedFileData.name}\n# Type: ${selectedFileData.type}\n\n${content}`
        }
        break
      case 'html':
        filename = `${nameWithoutExt}.html`
        mimeType = 'text/html'
        if (selectedFileData.type !== 'html') {
          content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedFileData.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; border-left: 4px solid #007bff; }
        .header { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${selectedFileData.name}</h1>
            <p>Exported from Nishen's AI Workspace | ${selectedFileData.category} | ${new Date().toLocaleDateString()}</p>
        </div>
        <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
</body>
</html>`
        }
        break
      case 'txt':
        filename = `${nameWithoutExt}.txt`
        mimeType = 'text/plain'
        content = `${selectedFileData.name}
${'='.repeat(selectedFileData.name.length)}
Exported from Nishen's AI Workspace
Category: ${selectedFileData.category}
Type: ${selectedFileData.type}
Created: ${selectedFileData.created.toLocaleDateString()}
Modified: ${selectedFileData.modified.toLocaleDateString()}
Export Date: ${new Date().toLocaleDateString()}

${'='.repeat(50)}

${content}`
        break
      case 'docx':
        // For DOCX, we'll create a simple text version with formatting hints
        filename = `${nameWithoutExt}.docx`
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        content = `TITLE: ${selectedFileData.name}
DOCUMENT TYPE: ${selectedFileData.type.toUpperCase()}
CATEGORY: ${selectedFileData.category}
CREATED: ${selectedFileData.created.toLocaleDateString()}
MODIFIED: ${selectedFileData.modified.toLocaleDateString()}
EXPORTED: ${new Date().toLocaleDateString()}

---

${content}`
        break
      case 'pdf':
        // For PDF, we'll create a text version (actual PDF generation would require a library)
        filename = `${nameWithoutExt}.pdf`
        mimeType = 'application/pdf'
        content = `PDF Export from Nishen's AI Workspace

Title: ${selectedFileData.name}
Type: ${selectedFileData.type}
Category: ${selectedFileData.category}
Created: ${selectedFileData.created.toLocaleDateString()}
Modified: ${selectedFileData.modified.toLocaleDateString()}
Exported: ${new Date().toLocaleDateString()}

${'='.repeat(80)}

${content}

${'='.repeat(80)}

Note: This is a simple text export. For full PDF formatting, 
use a dedicated PDF generation tool.`
        break
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  
  
  

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedFileData = selectedProjectData?.files.find(f => f.id === selectedFile)

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <ContactDetails />
      <div className="flex h-full bg-black text-white">
      {/* Sidebar - Projects & Files */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          {/* Version Info */}
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>DevOps Studio v0.1.1</span>
            <span>Files Module</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>🛠️ Dev Files</h2>
            <div className="flex gap-2">
              
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Project
              </button>
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
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
                  <FolderOpen className="w-4 h-4 mr-2 text-british-silver" />
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
                            title="Delete file"
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
                    <h3 className="font-semibold">{selectedFileData.name}</h3>
                    <div className="text-sm text-gray-400">
                      {selectedFileData.category} • Modified: {selectedFileData.modified.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* HTML/Markdown Preview Button */}
                  {(selectedFileData.type === 'html' || selectedFileData.type === 'markdown') && !isEditing && (
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
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
                  
                  {/* Export Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      title="Export file"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Export
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => { exportFile('ps1'); setShowExportMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4 inline mr-2" />
                            Export as PowerShell (.ps1)
                          </button>
                          <button
                            onClick={() => { exportFile('html'); setShowExportMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4 inline mr-2" />
                            Export as HTML (.html)
                          </button>
                          <button
                            onClick={() => { exportFile('txt'); setShowExportMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4 inline mr-2" />
                            Export as Text (.txt)
                          </button>
                          <button
                            onClick={() => { exportFile('docx'); setShowExportMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4 inline mr-2" />
                            Export as Word (.docx)
                          </button>
                          <button
                            onClick={() => { exportFile('pdf'); setShowExportMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4 inline mr-2" />
                            Export as PDF (.pdf)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setShowVersionModal(true)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save Version
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditContent(selectedFileData.content)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}
                  
                  <div className="text-sm text-gray-400 whitespace-nowrap">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(selectedFileData.timeSpent)}
                  </div>
                </div>
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
                  style={{ borderColor: 'var(--primary-accent)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                  placeholder="Enter your code/content here..."
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
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-sm text-blue-300">
                      📘 <strong>Markdown Rendering:</strong> This is a basic markdown renderer. 
                      For full Mermaid diagram support, consider integrating a complete markdown library.
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
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No File Selected</h3>
              <p className="text-gray-500">Select a file from the project list to view and edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>New Project</h3>
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
                  placeholder="Enter project name"
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
                  placeholder="Project description (optional)"
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
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-accent)' }}>New File</h3>
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
                    newFileType === 'html' ? 'report.html' :
                    newFileType === 'markdown' ? 'documentation.md' :
                    newFileType === 'script' ? 'script.ps1' :
                    newFileType === 'code' ? 'component.js' :
                    newFileType === 'document' ? 'notes.txt' :
                    'filename.ext'
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  ⚠️ Include the file extension (e.g., .html, .ps1, .js, .md) for proper preview/editing
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
                  placeholder="Security, Reporting, Development, etc."
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
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Save Version</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Version Description</label>
                <input
                  type="text"
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  placeholder="What changes did you make?"
                />
              </div>
              <div className="text-sm text-gray-400">
                This will save the current content as a new version with timestamp: {new Date().toLocaleString()}
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
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}