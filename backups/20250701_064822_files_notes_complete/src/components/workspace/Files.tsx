'use client'

import { useState, useEffect, useRef } from 'react'
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
  Eye
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
  type: 'script' | 'html' | 'document' | 'code' | 'other'
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
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [timer, setTimer] = useState<TimerState>({ activeProject: null, startTime: null, currentTime: 0 })
  
  // Modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  
  
  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'script' | 'html' | 'document' | 'code' | 'other'>('script')
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
    const savedData = localStorage.getItem('nishen-workspace-files')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Convert date strings back to Date objects
        const processedProjects = parsed.map((p: any) => ({
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
        setProjects(processedProjects)
        setExpandedProjects(new Set(['proj-1']))
        return
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
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
    setProjects(demoProjects)
    setExpandedProjects(new Set(['proj-1']))
  }, [])

  // Save data to localStorage
  const saveToLocalStorage = (projectsData: Project[]) => {
    try {
      localStorage.setItem('nishen-workspace-files', JSON.stringify(projectsData))
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
      case 'html': return <Globe className="w-4 h-4 text-burnt-orange" />
      case 'code': return <Code className="w-4 h-4 text-blue-400" />
      case 'document': return <FileText className="w-4 h-4 text-green-400" />
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
    
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: newFileType,
      category: newFileCategory || 'General',
      content: '// New file created by Nishen\'s AI Workspace\n',
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



  const selectedProjectData = projects.find(p => p.id === selectedProject)
  const selectedFileData = selectedProjectData?.files.find(f => f.id === selectedFile)

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Projects & Files */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neon-red">Project Files</h2>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-neon-red hover:bg-neon-red-bright px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Project
            </button>
          </div>
          
          {/* Timer Display */}
          {timer.activeProject && (
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Active Timer</span>
                <span className="text-lg font-mono text-neon-red">
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
                  <FolderOpen className="w-4 h-4 mr-2 text-burnt-orange" />
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
                    className="p-1 hover:bg-gray-700 rounded text-neon-red"
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
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors relative ${
                        selectedFile === file.id 
                          ? 'bg-neon-red/20 border border-neon-red/40' 
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project.id)
                          setSelectedFile(file.id)
                          setEditContent(file.content)
                          setIsEditing(false)
                        }}
                      >
                        {getFileIcon(file.type)}
                        <div className="ml-2 flex-1">
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-400">
                            {file.category} • {formatTime(file.timeSpent)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mr-2">
                          {file.versions.length} versions
                        </span>
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
                
                <div className="flex items-center space-x-2">
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
                      className="bg-neon-red hover:bg-neon-red-bright px-3 py-1 rounded text-sm font-medium transition-colors"
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

            {/* File Content */}
            <div className="flex-1 p-4">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-neon-red"
                  placeholder="Enter your code/content here..."
                />
              ) : (
                <pre className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-300 font-mono text-sm overflow-auto">
                  {selectedFileData.content}
                </pre>
              )}
            </div>

            {/* Versions Panel */}
            {selectedFileData.versions.length > 0 && (
              <div className="border-t border-gray-800 bg-gray-900 p-4">
                <h4 className="font-semibold mb-3 text-burnt-orange">Version History</h4>
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
                        className="mt-2 text-xs text-neon-red hover:text-neon-red-bright"
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
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
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
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
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
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="example.ps1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">File Type</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                >
                  <option value="script">Script</option>
                  <option value="html">HTML</option>
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
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
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
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
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
  )
}