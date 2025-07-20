'use client'

import { useState, useEffect } from 'react'
import { 
  Folder, 
  File, 
  Plus, 
  Trash2, 
  Edit3, 
  Home,
  FileText,
  RefreshCw,
  ChevronRight,
  List,
  Grid
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size: number
  modified: Date
  content?: string
}

export default function FileBrowserSimple() {
  const [currentPath, setCurrentPath] = useState('/')
  const [items, setItems] = useState<FileItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showNewModal, setShowNewModal] = useState<'file' | 'folder' | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [editingFile, setEditingFile] = useState<FileItem | null>(null)
  const [fileContent, setFileContent] = useState('')

  // localStorage key for persistence
  const STORAGE_KEY = 'nishen-workspace-file-browser'

  // Load data from localStorage or initialize with demo data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedItems = JSON.parse(savedData).map((item: any) => ({
          ...item,
          modified: new Date(item.modified)
        }))
        setItems(parsedItems)
      } else {
        // Initialize with demo data only if no saved data exists
        const demoItems: FileItem[] = [
          {
            id: '1',
            name: 'Documents',
            type: 'folder',
            path: '/Documents',
            size: 0,
            modified: new Date()
          },
          {
            id: '2',
            name: 'Projects',
            type: 'folder',
            path: '/Projects',
            size: 0,
            modified: new Date()
          },
          {
            id: '3',
            name: 'Notes Export',
            type: 'folder',
            path: '/Notes Export',
            size: 0,
            modified: new Date()
          },
          {
            id: '4',
            name: 'Welcome.txt',
            type: 'file',
            path: '/Welcome.txt',
            size: 284,
            modified: new Date(),
            content: `Welcome to Nishen's AI Workspace File Browser!

This virtual file system allows you to:
• Create and organize files and folders
• Edit text files with the built-in editor
• Manage your workspace documents
• Import/export content between modules

Your files are automatically saved and will persist between sessions.

Try creating a new file or folder to get started!`
          }
        ]
        setItems(demoItems)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoItems))
      }
    } catch (error) {
      console.error('Error loading file browser data:', error)
    }
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving file browser data:', error)
      }
    }
  }, [items])

  // Navigation helper functions
  const navigateToPath = (path: string) => {
    setCurrentPath(path)
    setSelectedItems([])
  }

  const getCurrentItems = () => {
    return items.filter(item => {
      const parentPath = getParentPath(item.path)
      return parentPath === currentPath
    })
  }

  const getParentPath = (path: string): string => {
    if (path === '/') return ''
    const parts = path.split('/').filter((p: any) => p)
    if (parts.length === 1) return '/'
    return '/' + parts.slice(0, -1).join('/')
  }

  const handleCreateItem = () => {
    if (!newItemName.trim() || !showNewModal) return
    
    const newItem: FileItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: showNewModal,
      path: currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`,
      size: showNewModal === 'file' ? 0 : 0,
      modified: new Date(),
      content: showNewModal === 'file' ? '' : undefined
    }
    
    setItems(prev => [...prev, newItem])
    setNewItemName('')
    setShowNewModal(null)
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Delete ${selectedItems.length} item(s)?`)) return
    
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      // Navigate into the folder
      navigateToPath(item.path)
    } else if (item.type === 'file') {
      // Edit the file
      setEditingFile(item)
      setFileContent(item.content || '')
    }
  }

  const handleSaveFile = () => {
    if (!editingFile) return
    
    setItems(prev => prev.map(item => 
      item.id === editingFile.id 
        ? { ...item, content: fileContent, size: fileContent.length, modified: new Date() }
        : item
    ))
    setEditingFile(null)
    setFileContent('')
  }

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-4 h-4 text-yellow-400" />
    }
    return <FileText className="w-4 h-4 text-blue-400" />
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>DevOps Studio v0.1.1</span>
            <span>File Browser</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewModal('folder')}
              className="flex-1 flex items-center justify-center px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              <Folder className="w-3 h-3 mr-1" />
              Folder
            </button>
            <button
              onClick={() => setShowNewModal('file')}
              className="flex-1 flex items-center justify-center px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
            >
              <File className="w-3 h-3 mr-1" />
              File
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Access</h3>
          <div className="space-y-1">
            <button 
              onClick={() => navigateToPath('/')}
              className={`w-full flex items-center p-2 rounded text-sm transition-colors ${
                currentPath === '/' ? 'bg-neon-red/20 text-neon-red' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
            <button 
              onClick={() => navigateToPath('/Documents')}
              className={`w-full flex items-center p-2 rounded text-sm transition-colors ${
                currentPath === '/Documents' ? 'bg-neon-red/20 text-neon-red' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Folder className="w-4 h-4 mr-2" />
              Documents
            </button>
            <button 
              onClick={() => navigateToPath('/Projects')}
              className={`w-full flex items-center p-2 rounded text-sm transition-colors ${
                currentPath === '/Projects' ? 'bg-neon-red/20 text-neon-red' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Folder className="w-4 h-4 mr-2" />
              Projects
            </button>
            <button 
              onClick={() => navigateToPath('/Notes Export')}
              className={`w-full flex items-center p-2 rounded text-sm transition-colors ${
                currentPath === '/Notes Export' ? 'bg-neon-red/20 text-neon-red' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Folder className="w-4 h-4 mr-2" />
              Notes Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {selectedItems.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex bg-gray-800 rounded">
              <button className="p-2 bg-neon-red text-white rounded-l transition-colors">
                <List className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white rounded-r transition-colors">
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {getCurrentItems().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Folder className="w-12 h-12 mb-2" />
              <p>This folder is empty</p>
              <p className="text-sm">Current path: {currentPath}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {getCurrentItems().map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (selectedItems.includes(item.id)) {
                      setSelectedItems(prev => prev.filter(id => id !== item.id))
                    } else {
                      setSelectedItems([item.id])
                    }
                  }}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`cursor-pointer transition-colors rounded p-2 flex items-center ${
                    selectedItems.includes(item.id)
                      ? 'bg-neon-red/20 border border-neon-red'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="mr-3">{getFileIcon(item)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.name}</div>
                  </div>
                  <div className="text-xs text-gray-400 mr-4">{formatSize(item.size)}</div>
                  <div className="text-xs text-gray-400">{formatDate(item.modified)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Item Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">
              Create New {showNewModal === 'folder' ? 'Folder' : 'File'}
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`${showNewModal === 'folder' ? 'Folder' : 'File'} name`}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-red"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowNewModal(null)
                  setNewItemName('')
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="px-4 py-2 bg-neon-red hover:bg-red-600 rounded transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-4/5 h-4/5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Edit: {editingFile.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveFile}
                  className="px-4 py-2 bg-neon-red hover:bg-red-600 rounded transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingFile(null)
                    setFileContent('')
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="flex-1 w-full bg-gray-800 border border-gray-700 rounded p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-neon-red"
              placeholder="Enter file content..."
            />
          </div>
        </div>
      )}
    </div>
  )
}