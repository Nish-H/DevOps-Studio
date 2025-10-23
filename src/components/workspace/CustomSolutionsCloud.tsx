'use client'

import { useState, useEffect } from 'react'
import {
  FileCode2,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  Eye,
  Copy,
  Star,
  Download,
  Upload,
  X,
  Code,
  Globe,
  Calendar,
  Folder,
  FolderPlus,
  Cloud,
  CloudOff,
  History,
  RotateCcw,
  RefreshCw
} from 'lucide-react'
import {
  createScript,
  getScripts,
  updateScript,
  deleteScript,
  createScriptCategory,
  getScriptCategories,
  updateScriptCategory,
  deleteScriptCategory,
  getScriptVersions,
  restoreScriptVersion,
  exportScriptsToJSON,
  importScriptsFromJSON,
  handleSessionError,
  Script,
  ScriptCategory,
  ScriptVersion
} from '@/lib/back4appService'
import { useBack4AppAuth } from '@/contexts/Back4AppAuthContext'

export default function CustomSolutionsCloud() {
  const { currentUser, loading: authLoading, error: authError } = useBack4AppAuth()
  const [scripts, setScripts] = useState<Script[]>([])
  const [categories, setCategories] = useState<ScriptCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'script' | 'report'>('script')
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'modified' | 'usage' | 'rating'>('modified')

  // Version history
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [scriptVersions, setScriptVersions] = useState<ScriptVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)

  // Modals
  const [showNewScriptModal, setShowNewScriptModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const [showExportImport, setShowExportImport] = useState(false)

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

  // Export/Import
  const [importData, setImportData] = useState('')

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      loadData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [currentUser, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedScripts, fetchedCategories] = await Promise.all([
        getScripts(),
        getScriptCategories()
      ])
      setScripts(fetchedScripts)
      setCategories(fetchedCategories)
    } catch (error: any) {
      console.error('Error loading data:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to load data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateScript = async () => {
    if (!newScriptTitle.trim()) {
      alert('Please enter a script title')
      return
    }

    if (!newScriptCategory) {
      alert('Please select a category')
      return
    }

    try {
      setSyncing(true)

      const newScript: Script = {
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
        category: newScriptCategory,
        tags: newScriptTags ? newScriptTags.split(',').map(tag => tag.trim()) : [],
        version: newScriptVersion,
        isPinned: false,
        usageCount: 0,
        rating: 0
      }

      const created = await createScript(newScript)
      setScripts([created, ...scripts])
      setShowNewScriptModal(false)

      // Reset form
      setNewScriptTitle('')
      setNewScriptDescription('')
      setNewScriptCategory('')
      setNewScriptVersion('1.0')
      setNewScriptTags('')
    } catch (error: any) {
      console.error('Error creating script:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to create script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name')
      return
    }

    try {
      setSyncing(true)

      const newCategory: ScriptCategory = {
        name: newCategoryName,
        color: newCategoryColor,
        description: newCategoryDescription
      }

      const created = await createScriptCategory(newCategory)
      setCategories([...categories, created])
      setShowNewCategoryModal(false)

      // Reset form
      setNewCategoryName('')
      setNewCategoryColor('#ff073a')
      setNewCategoryDescription('')
    } catch (error: any) {
      console.error('Error creating category:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to create category: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveScript = async () => {
    if (!selectedScript || !editTitle.trim()) return

    try {
      setSyncing(true)

      const updates: Partial<Script> = {
        title: editTitle,
        description: editDescription,
        scriptContent: editScriptContent,
        htmlReportContent: editHtmlReportContent,
        version: editVersion,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        category: editCategory
      }

      const updated = await updateScript(selectedScript, updates)
      setScripts(scripts.map(s => s.id === updated.id ? updated : s))
      setIsEditing(false)
      setSelectedScript(null)
    } catch (error: any) {
      console.error('Error saving script:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to save script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm('Are you sure you want to delete this script and all its versions?')) return

    try {
      setSyncing(true)
      await deleteScript(scriptId)
      setScripts(scripts.filter(s => s.id !== scriptId))
      if (selectedScript === scriptId) {
        setSelectedScript(null)
      }
    } catch (error: any) {
      console.error('Error deleting script:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to delete script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleTogglePin = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId)
    if (!script) return

    try {
      setSyncing(true)
      const updated = await updateScript(scriptId, { isPinned: !script.isPinned })
      setScripts(scripts.map(s => s.id === updated.id ? updated : s))
    } catch (error: any) {
      console.error('Error toggling pin:', error)
      alert(`Failed to update script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCopyToClipboard = async (content: string, type: 'script' | 'report', scriptId: string) => {
    navigator.clipboard.writeText(content)
    alert(`${type === 'script' ? 'Script' : 'HTML Report'} copied to clipboard!`)

    // Increment usage count
    const script = scripts.find(s => s.id === scriptId)
    if (script) {
      try {
        setSyncing(true)
        const updated = await updateScript(scriptId, { usageCount: (script.usageCount || 0) + 1 })
        setScripts(scripts.map(s => s.id === updated.id ? updated : s))
      } catch (error) {
        console.error('Error updating usage count:', error)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleUpdateRating = async (scriptId: string, newRating: number) => {
    try {
      setSyncing(true)
      const updated = await updateScript(scriptId, { rating: newRating })
      setScripts(scripts.map(s => s.id === updated.id ? updated : s))
    } catch (error: any) {
      console.error('Error updating rating:', error)
      alert(`Failed to update rating: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const loadVersionHistory = async (scriptId: string) => {
    try {
      setLoadingVersions(true)
      const versions = await getScriptVersions(scriptId)
      setScriptVersions(versions)
      setShowVersionHistory(true)
    } catch (error: any) {
      console.error('Error loading versions:', error)
      alert(`Failed to load version history: ${error.message}`)
    } finally {
      setLoadingVersions(false)
    }
  }

  const handleRestoreVersion = async (scriptId: string, versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new version with the old content.')) return

    try {
      setSyncing(true)
      const restored = await restoreScriptVersion(scriptId, versionId)
      setScripts(scripts.map(s => s.id === restored.id ? restored : s))
      setShowVersionHistory(false)
      alert('Version restored successfully!')
    } catch (error: any) {
      console.error('Error restoring version:', error)
      alert(`Failed to restore version: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleExport = async () => {
    try {
      setSyncing(true)
      const jsonData = await exportScriptsToJSON()

      // Download as file
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `custom-solutions-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Scripts exported successfully!')
    } catch (error: any) {
      console.error('Error exporting:', error)
      alert(`Failed to export: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      alert('Please paste JSON data to import')
      return
    }

    try {
      setSyncing(true)
      const result = await importScriptsFromJSON(importData)

      alert(`Import successful!\nScripts imported: ${result.scriptsImported}\nCategories imported: ${result.categoriesImported}`)

      // Reload data
      await loadData()

      setShowExportImport(false)
      setImportData('')
    } catch (error: any) {
      console.error('Error importing:', error)
      alert(`Failed to import: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const getRatingStars = (rating: number, scriptId?: string, interactive = false) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${interactive ? 'cursor-pointer' : ''} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
        onClick={() => interactive && scriptId ? handleUpdateRating(scriptId, i + 1) : null}
      />
    ))
  }

  // Filter scripts
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
        return (b.usageCount || 0) - (a.usageCount || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'modified':
      default:
        return (b.modified?.getTime() || 0) - (a.modified?.getTime() || 0)
    }
  })

  const selectedScriptData = scripts.find(s => s.id === selectedScript)

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || '#ff073a'
  }

  // Update category counts
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: scripts.filter(s => s.category === cat.name).length
  }))

  // Show loading or error state
  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-spin" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-accent)' }}>
              Connecting to Cloud...
            </h2>
            <p className="text-gray-400">
              Authenticating with Back4App cloud services...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (authError || !currentUser) {
    return (
      <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <CloudOff className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-accent)' }}>
              Cloud Connection Unavailable
            </h2>
            <p className="text-gray-400 mb-4">
              {authError || 'Unable to connect to Back4App cloud services. Cloud features are currently unavailable.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded transition-colors"
              style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        {/* Version Info and Sync Status */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>DevOps Studio v0.1.2</span>
          <div className="flex items-center gap-3">
            {syncing ? (
              <span className="flex items-center gap-1 text-blue-400">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-400">
                <Cloud className="w-3 h-3" />
                Cloud Synced
              </span>
            )}
            <span>Custom Solutions</span>
          </div>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-accent)' }}>
            <FileCode2 className="w-6 h-6 inline mr-2" />
            Custom Solutions
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowExportImport(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm"
              disabled={syncing}
            >
              <Download size={16} />
              Export/Import
            </button>
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm"
              disabled={syncing}
            >
              <FolderPlus size={16} />
              Category
            </button>
            <button
              onClick={() => setShowNewScriptModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
              style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
              disabled={syncing}
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
            {categoriesWithCounts.map(cat => (
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
          {categoriesWithCounts.map(cat => (
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
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-600 animate-spin" />
            <p className="text-gray-400">Loading scripts...</p>
          </div>
        ) : sortedScripts.length === 0 ? (
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
                  setSelectedScript(script.id!)
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

                {/* Cloud sync indicator */}
                <div className="absolute top-2 right-8">
                  <Cloud className="w-3 h-3 text-blue-400" />
                </div>

                {/* Script Title and Version */}
                <div className="mb-2 pr-12">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: getCategoryColor(script.category) }}>
                    {script.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    v{script.version} ({script.currentVersion || 1} revision{(script.currentVersion || 1) > 1 ? 's' : ''})
                  </span>
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
                      {getRatingStars(script.rating || 0)}
                    </div>
                    <span>• {script.usageCount || 0} uses</span>
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
                <div className="grid grid-cols-4 gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleCopyToClipboard(script.scriptContent, 'script', script.id!)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Copy script"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedScript(script.id!)
                      setShowHtmlPreview(true)
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="View report"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => loadVersionHistory(script.id!)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Version history"
                  >
                    <History size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteScript(script.id!)}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors flex items-center justify-center gap-1"
                    title="Delete"
                  >
                    <Trash2 size={12} />
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
                {selectedScriptData.currentVersion && selectedScriptData.currentVersion > 1 && (
                  <span className="text-sm text-gray-400 ml-2">
                    ({selectedScriptData.currentVersion} revisions)
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadVersionHistory(selectedScriptData.id!)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors flex items-center gap-1"
                  disabled={syncing || loadingVersions}
                >
                  <History className="w-3 h-3" />
                  Versions
                </button>
                <button
                  onClick={() => handleTogglePin(selectedScriptData.id!)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    selectedScriptData.isPinned
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  disabled={syncing}
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
                    onClick={() => handleCopyToClipboard(editScriptContent, 'script', selectedScriptData.id!)}
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
                      onClick={() => setShowHtmlPreview(true)}
                      className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleCopyToClipboard(editHtmlReportContent, 'report', selectedScriptData.id!)}
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
                <span>Used {selectedScriptData.usageCount || 0} times</span>
                <div className="flex items-center gap-2">
                  <span>Rating:</span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(selectedScriptData.rating || 0, selectedScriptData.id, true)}
                  </div>
                </div>
              </div>
              <span className="text-xs">Modified: {selectedScriptData.modified?.toLocaleDateString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveScript}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                disabled={syncing}
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {syncing ? 'Saving...' : 'Save Changes'}
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

      {/* Continue in next part due to length... */}

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
                  <label className="block text-sm font-medium mb-2">Category *</label>
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
                onClick={handleCreateScript}
                className="flex-1 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
                disabled={syncing}
              >
                {syncing ? <RefreshCw size={16} className="animate-spin" /> : null}
                {syncing ? 'Creating...' : 'Create Solution'}
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
                onClick={handleCreateCategory}
                className="flex-1 px-4 py-2 rounded transition-colors"
                style={{ backgroundColor: 'var(--primary-accent)', color: 'white' }}
                disabled={syncing}
              >
                {syncing ? 'Creating...' : 'Create Category'}
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
                srcDoc={isEditing ? editHtmlReportContent : selectedScriptData.htmlReportContent}
                className="w-full h-full min-h-[600px] border-0"
                title="HTML Report Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedScriptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                Version History - {selectedScriptData.title}
              </h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {loadingVersions ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-600 animate-spin" />
                <p className="text-gray-400">Loading versions...</p>
              </div>
            ) : scriptVersions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No version history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scriptVersions.map((version, index) => (
                  <div
                    key={version.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
                          v{version.versionLabel}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                            Current
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          Revision #{version.versionNumber}
                        </span>
                      </div>
                      {index > 0 && (
                        <button
                          onClick={() => handleRestoreVersion(selectedScriptData.id!, version.id!)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                          disabled={syncing}
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      )}
                    </div>

                    <div className="text-sm text-gray-400 mb-2">
                      {version.changeDescription || 'No description'}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {version.createdAt?.toLocaleString()}
                      </span>
                      <span>By: {version.createdBy || 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export/Import Modal */}
      {showExportImport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>
                Export / Import Solutions
              </h3>
              <button
                onClick={() => setShowExportImport(false)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Export</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Download all your scripts and categories as a JSON file for backup or sharing.
                </p>
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                  disabled={syncing}
                >
                  {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  {syncing ? 'Exporting...' : 'Export to JSON'}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700"></div>

              {/* Import Section */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Import</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Paste exported JSON data to import scripts and categories.
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste JSON data here..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm resize-none focus:outline-none focus:border-gray-600 mb-4"
                  rows={10}
                  spellCheck={false}
                />
                <button
                  onClick={handleImport}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                  disabled={syncing || !importData.trim()}
                >
                  {syncing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                  {syncing ? 'Importing...' : 'Import from JSON'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
