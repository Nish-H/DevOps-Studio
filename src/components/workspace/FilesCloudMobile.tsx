'use client'

import { useState, useEffect, useRef } from 'react'
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getCurrentUser,
  handleSessionError,
  Project,
  ProjectFile
} from '@/lib/back4appService'
import AuthModal from '../auth/AuthModal'
import {
  FolderOpen,
  File,
  Plus,
  Edit3,
  Save,
  Clock,
  Play,
  Square,
  Code,
  FileText,
  Globe,
  Terminal,
  Trash2,
  BookOpen,
  Download,
  Upload,
  Monitor,
  X,
  ArrowLeft
} from 'lucide-react'

interface TimerState {
  activeProject: string | null
  startTime: Date | null
  currentTime: number
}

export default function FilesCloudMobile() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [timer, setTimer] = useState<TimerState>({ activeProject: null, startTime: null, currentTime: 0 })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [viewMode, setViewMode] = useState<'projects' | 'files' | 'editor'>('projects') // Mobile view state

  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewFileModal, setShowNewFileModal] = useState(false)

  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'script' | 'html' | 'document' | 'code' | 'markdown' | 'other'>('script')
  const [newFileCategory, setNewFileCategory] = useState('')

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

  // Load user and projects on mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      loadProjects()
    } else {
      setLoading(false)
    }
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const fetchedProjects = await getProjects()
      setProjects(fetchedProjects)

      // Automatic migration from localStorage to cloud
      if (fetchedProjects.length === 0) {
        await checkAndMigrateLocalStorage()
      }
    } catch (error: any) {
      console.error('Error loading projects:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to load projects: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkAndMigrateLocalStorage = async () => {
    try {
      const localStorageKey = 'nishen-workspace-dev'
      const savedData = localStorage.getItem(localStorageKey)

      if (!savedData) {
        return
      }

      const localProjects = JSON.parse(savedData)
      if (!Array.isArray(localProjects) || localProjects.length === 0) {
        return
      }

      const shouldMigrate = confirm(
        `Found ${localProjects.length} project(s) in local storage. Would you like to migrate them to the cloud?\n\n` +
        `This will upload your existing projects to Back4App cloud storage.`
      )

      if (!shouldMigrate) {
        return
      }

      setSyncing(true)
      let migrated = 0

      for (const project of localProjects) {
        try {
          const projectData: Project = {
            name: project.name,
            description: project.description || '',
            files: project.files || [],
            totalTimeSpent: project.totalTimeSpent || 0,
            created: new Date(project.created || Date.now()),
            isTimerRunning: false
          }
          await createProject(projectData)
          migrated++
        } catch (err) {
          console.error('Failed to migrate project:', project.name, err)
        }
      }

      if (migrated > 0) {
        await loadProjects()
        alert(`✅ Successfully migrated ${migrated} project(s) to the cloud!\n\nYour data is now synced to Back4App.`)
      }
    } catch (error) {
      console.error('Migration error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    try {
      setSyncing(true)
      const newProject: Project = {
        name: newProjectName,
        description: newProjectDesc,
        files: [],
        totalTimeSpent: 0,
        created: new Date(),
        isTimerRunning: false
      }

      const created = await createProject(newProject)
      setProjects([created, ...projects])

      setNewProjectName('')
      setNewProjectDesc('')
      setShowNewProjectModal(false)
    } catch (error: any) {
      console.error('Error creating project:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to create project: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim() || !selectedProject) return

    try {
      setSyncing(true)

      const project = projects.find(p => p.id === selectedProject)
      if (!project) return

      const newFile: ProjectFile = {
        id: `file-${Date.now()}`,
        name: newFileName,
        type: newFileType,
        category: newFileCategory || 'General',
        content: getDefaultContent(newFileType, newFileName),
        versions: [],
        created: new Date(),
        modified: new Date(),
        timeSpent: 0
      }

      const updatedFiles = [...project.files, newFile]
      await updateProject(selectedProject, { files: updatedFiles })

      setProjects(prev => prev.map(p =>
        p.id === selectedProject ? { ...p, files: updatedFiles } : p
      ))

      setNewFileName('')
      setNewFileCategory('')
      setShowNewFileModal(false)
    } catch (error: any) {
      console.error('Error creating file:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to create file: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveFile = async () => {
    if (!selectedFile || !selectedProject) return

    try {
      setSyncing(true)

      const project = projects.find(p => p.id === selectedProject)
      if (!project) return

      const updatedFiles = project.files.map(f =>
        f.id === selectedFile
          ? { ...f, content: editContent, modified: new Date() }
          : f
      )

      await updateProject(selectedProject, { files: updatedFiles })

      setProjects(prev => prev.map(p =>
        p.id === selectedProject ? { ...p, files: updatedFiles } : p
      ))

      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving file:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to save file: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project and all its files?')) return

    try {
      setSyncing(true)
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (selectedProject === projectId) {
        setSelectedProject(null)
        setSelectedFile(null)
        setViewMode('projects')
      }
    } catch (error: any) {
      console.error('Error deleting project:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to delete project: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    if (!selectedProject) return

    try {
      setSyncing(true)

      const project = projects.find(p => p.id === selectedProject)
      if (!project) return

      const updatedFiles = project.files.filter(f => f.id !== fileId)
      await updateProject(selectedProject, { files: updatedFiles })

      setProjects(prev => prev.map(p =>
        p.id === selectedProject ? { ...p, files: updatedFiles } : p
      ))

      if (selectedFile === fileId) {
        setSelectedFile(null)
        setIsEditing(false)
        setViewMode('files')
      }
    } catch (error: any) {
      console.error('Error deleting file:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to delete file: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const startTimer = async (projectId: string) => {
    if (timer.activeProject && timer.startTime) {
      await stopTimer()
    }

    setTimer({
      activeProject: projectId,
      startTime: new Date(),
      currentTime: 0
    })

    try {
      await updateProject(projectId, {
        isTimerRunning: true,
        timerStartTime: new Date()
      })

      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, isTimerRunning: true, timerStartTime: new Date() }
          : { ...p, isTimerRunning: false }
      ))
    } catch (error) {
      console.error('Error starting timer:', error)
    }
  }

  const stopTimer = async () => {
    if (timer.activeProject && timer.startTime) {
      const elapsed = Math.floor((Date.now() - timer.startTime.getTime()) / 1000)

      try {
        const project = projects.find(p => p.id === timer.activeProject)
        if (project) {
          await updateProject(timer.activeProject, {
            totalTimeSpent: (project.totalTimeSpent || 0) + elapsed,
            isTimerRunning: false,
            timerStartTime: undefined
          })

          setProjects(prev => prev.map(p =>
            p.id === timer.activeProject
              ? {
                  ...p,
                  totalTimeSpent: (p.totalTimeSpent || 0) + elapsed,
                  isTimerRunning: false,
                  timerStartTime: undefined
                }
              : p
          ))
        }
      } catch (error) {
        console.error('Error stopping timer:', error)
      }
    }

    setTimer({ activeProject: null, startTime: null, currentTime: 0 })
  }

  const exportProjects = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      projects: projects
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importProjects = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.projects || !Array.isArray(data.projects)) {
        alert('Invalid import file format')
        return
      }

      setSyncing(true)
      let imported = 0

      for (const project of data.projects) {
        const projectData: Project = {
          name: project.name,
          description: project.description || '',
          files: project.files || [],
          totalTimeSpent: project.totalTimeSpent || 0,
          created: new Date(project.created || Date.now()),
          isTimerRunning: false
        }
        await createProject(projectData)
        imported++
      }

      await loadProjects()
      alert(`Successfully imported ${imported} projects!`)
    } catch (error: any) {
      console.error('Error importing:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Import failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'script': return <Terminal className="w-5 h-5 text-indigo-400" />
      case 'html': return <Globe className="w-5 h-5 text-blue-400" />
      case 'code': return <Code className="w-5 h-5 text-green-400" />
      case 'document': return <FileText className="w-5 h-5 text-yellow-400" />
      case 'markdown': return <BookOpen className="w-5 h-5 text-purple-400" />
      default: return <File className="w-5 h-5 text-gray-400" />
    }
  }

  const getDefaultContent = (type: string, filename: string): string => {
    switch (type) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
</head>
<body>
    <h1>Welcome to ${filename}</h1>
    <p>Created in Nishen's AI Workspace</p>
</body>
</html>`
      case 'markdown':
        return `# ${filename}

Created in Nishen's AI Workspace on ${new Date().toLocaleDateString()}

## Overview

Add your documentation here...`
      case 'script':
        return `# PowerShell Script
# Created in Nishen's AI Workspace
# File: ${filename}

Write-Host "Starting ${filename}..." -ForegroundColor Green

# Add your script logic here`
      default:
        return `// ${filename}
// Created in Nishen's AI Workspace

// Add your content here...`
    }
  }

  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedFileData = selectedProjectData?.files.find(f => f.id === selectedFile)

  if (!currentUser) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">📁</div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-300">Dev Files Cloud</h2>
            <p className="text-gray-400 mb-6">Manage your development projects with cloud sync across all devices</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Login / Sign Up
            </button>
            <p className="text-sm text-gray-500 mt-6">Cloud sync powered by Back4App</p>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false)
              const user = getCurrentUser()
              setCurrentUser(user)
              loadProjects()
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          {/* Back button - always visible when not on projects view */}
          <div className="flex items-center gap-2">
            {viewMode !== 'projects' && (
              <button
                onClick={() => {
                  if (viewMode === 'editor') {
                    setViewMode('files')
                    setSelectedFile(null)
                    setIsEditing(false)
                  } else if (viewMode === 'files') {
                    setViewMode('projects')
                    setSelectedProject(null)
                  }
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">DevOps Studio v0.1.2</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-indigo-400">Files Cloud</span>
          </div>

          <div className="flex items-center gap-2">
            {syncing && (
              <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>
            )}
            {viewMode === 'projects' && (
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Project</span>
              </button>
            )}
            {viewMode === 'files' && (
              <button
                onClick={() => setShowNewFileModal(true)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">File</span>
              </button>
            )}
          </div>
        </div>

        {/* Timer Display */}
        {timer.activeProject && (
          <div className="bg-gray-800 p-2 rounded-lg flex items-center justify-between">
            <span className="text-xs text-gray-300">Active Timer</span>
            <span className="text-sm font-mono text-indigo-400">
              {formatTime(timer.currentTime)}
            </span>
            <span className="text-xs text-gray-400 truncate max-w-[150px]">
              {projects.find(p => p.id === timer.activeProject)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Main Content - Card Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : viewMode === 'projects' ? (
          /* Projects Grid */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                Projects ({projects.length})
              </h2>
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="text-xs text-gray-400 hover:text-indigo-400 transition-colors"
              >
                📥 Import/Export
              </button>
            </div>

            {showImportExport && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg flex gap-2">
                <button
                  onClick={exportProjects}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export JSON
                </button>
                <label className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProjects}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No projects yet</p>
                <p className="text-sm">Click "+ Project" to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-indigo-600 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedProject(project.id || null)
                      setViewMode('files')
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-semibold text-white line-clamp-1">{project.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id || '')
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.files.length} file{project.files.length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime((project.totalTimeSpent || 0) + (project.id === timer.activeProject ? timer.currentTime : 0))}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2">
                      {project.isTimerRunning ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            stopTimer()
                          }}
                          className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors text-xs flex items-center justify-center gap-1"
                        >
                          <Square className="w-3 h-3" />
                          Stop Timer
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startTimer(project.id || '')
                          }}
                          className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors text-xs flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Start Timer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === 'files' && selectedProjectData ? (
          /* Files Grid */
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                {selectedProjectData.name}
              </h2>
              {selectedProjectData.description && (
                <p className="text-sm text-gray-400 mt-1">{selectedProjectData.description}</p>
              )}
            </div>

            {selectedProjectData.files.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <File className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No files yet</p>
                <p className="text-sm">Click "+ File" to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedProjectData.files.map(file => (
                  <div
                    key={file.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-indigo-600 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedFile(file.id || null)
                      setEditContent(file.content)
                      setIsEditing(false)
                      setIsPreviewMode(false)
                      setViewMode('editor')
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <h3 className="font-medium text-white text-sm line-clamp-1">{file.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFile(file.id || '')
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">{file.category}</span>
                        <span className="text-gray-500">{file.type}</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Modified: {file.modified.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === 'editor' && selectedFileData ? (
          /* File Editor */
          <div className="h-full flex flex-col">
            <div className="mb-4 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                {getFileIcon(selectedFileData.type)}
                <h3 className="font-semibold text-white">{selectedFileData.name}</h3>
              </div>
              <div className="text-sm text-gray-400">
                {selectedFileData.category} • Modified: {selectedFileData.modified.toLocaleString()}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(selectedFileData.type === 'html' || selectedFileData.type === 'markdown') && !isEditing && (
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isPreviewMode
                        ? 'bg-green-600 hover:bg-green-700'
                        : selectedFileData.type === 'html'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {selectedFileData.type === 'markdown' ? <BookOpen className="w-4 h-4 inline mr-1" /> : <Monitor className="w-4 h-4 inline mr-1" />}
                    {isPreviewMode ? 'Show Code' : selectedFileData.type === 'markdown' ? 'Render' : 'Preview'}
                  </button>
                )}

                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveFile}
                      disabled={syncing}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      {syncing ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(selectedFileData.content)
                      }}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-indigo-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your code/content here..."
                />
              ) : selectedFileData.type === 'html' && isPreviewMode ? (
                <div className="w-full h-full bg-white border border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={selectedFileData.content}
                    className="w-full h-full border-0"
                    title={`Preview of ${selectedFileData.name}`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              ) : (
                <pre className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-auto">
                  {selectedFileData.content}
                </pre>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-400">New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
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
                onClick={handleCreateProject}
                disabled={syncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
              >
                {syncing ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-400">New File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  placeholder={
                    newFileType === 'html' ? 'report.html' :
                    newFileType === 'markdown' ? 'documentation.md' :
                    newFileType === 'script' ? 'script.ps1' :
                    newFileType === 'code' ? 'component.js' :
                    newFileType === 'document' ? 'notes.txt' :
                    'filename.ext'
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File Type</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
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
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
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
                onClick={handleCreateFile}
                disabled={syncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
              >
                {syncing ? 'Creating...' : 'Create File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
