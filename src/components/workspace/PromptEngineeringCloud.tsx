'use client'

import { useState, useEffect } from 'react'
import {
  createPrompt,
  getPrompts,
  updatePrompt,
  deletePrompt,
  createPromptCategory,
  getPromptCategories,
  updatePromptCategory,
  deletePromptCategory,
  getCurrentUser,
  handleSessionError,
  Prompt,
  PromptCategory
} from '@/lib/back4appService'
import AuthModal from '../auth/AuthModal'
import {
  Brain,
  Plus,
  Edit3,
  Save,
  Search,
  Trash2,
  Copy,
  Star,
  Code,
  MessageSquare,
  Zap,
  Lightbulb,
  File,
  Menu,
  X
} from 'lucide-react'

export default function PromptEngineeringCloud() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<PromptCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile sidebar state

  // Modals
  const [showNewPromptModal, setShowNewPromptModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)

  // Form states
  const [newPromptTitle, setNewPromptTitle] = useState('')
  const [newPromptCategory, setNewPromptCategory] = useState('')
  const [newPromptTags, setNewPromptTags] = useState('')
  const [newPromptType, setNewPromptType] = useState<'system' | 'user' | 'assistant' | 'creative' | 'technical' | 'other'>('user')
  const [newPromptDifficulty, setNewPromptDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // Load user and data on mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedPrompts, fetchedCategories] = await Promise.all([
        getPrompts(),
        getPromptCategories()
      ])
      setPrompts(fetchedPrompts)
      setCategories(fetchedCategories)
      updateCategoryCounts(fetchedPrompts, fetchedCategories)

      // Automatic migration from localStorage to cloud
      if (fetchedPrompts.length === 0 && fetchedCategories.length === 0) {
        await checkAndMigrateLocalStorage()
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to load data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkAndMigrateLocalStorage = async () => {
    try {
      const promptsKey = 'nishen-workspace-prompts'
      const categoriesKey = 'nishen-workspace-prompt-categories'

      const savedPrompts = localStorage.getItem(promptsKey)
      const savedCategories = localStorage.getItem(categoriesKey)

      if (!savedPrompts && !savedCategories) {
        return // No localStorage data to migrate
      }

      const localPrompts = savedPrompts ? JSON.parse(savedPrompts) : []
      const localCategories = savedCategories ? JSON.parse(savedCategories) : []

      if (localPrompts.length === 0 && localCategories.length === 0) {
        return // No valid data to migrate
      }

      const shouldMigrate = confirm(
        `Found ${localPrompts.length} prompt(s) and ${localCategories.length} category(ies) in local storage.\n\n` +
        `Would you like to migrate them to the cloud?\n\n` +
        `This will upload your existing prompts and categories to Back4App cloud storage.`
      )

      if (!shouldMigrate) {
        return
      }

      setSyncing(true)
      let migratedCategories = 0
      let migratedPrompts = 0

      // Migrate categories first
      for (const category of localCategories) {
        try {
          const categoryData: PromptCategory = {
            name: category.name,
            color: category.color || '#6366f1',
            description: category.description || 'Migrated category',
            count: 0
          }
          await createPromptCategory(categoryData)
          migratedCategories++
        } catch (err) {
          console.error('Failed to migrate category:', category.name, err)
        }
      }

      // Migrate prompts
      for (const prompt of localPrompts) {
        try {
          const promptData: Prompt = {
            title: prompt.title,
            content: prompt.content,
            category: prompt.category || 'General',
            tags: prompt.tags || [],
            created: new Date(prompt.created || Date.now()),
            modified: new Date(prompt.modified || Date.now()),
            isPinned: prompt.isPinned || false,
            isArchived: prompt.isArchived || false,
            type: prompt.type || 'user',
            difficulty: prompt.difficulty || 'beginner',
            usageCount: prompt.usageCount || 0,
            rating: prompt.rating || 0
          }
          await createPrompt(promptData)
          migratedPrompts++
        } catch (err) {
          console.error('Failed to migrate prompt:', prompt.title, err)
        }
      }

      if (migratedPrompts > 0 || migratedCategories > 0) {
        await loadData()
        alert(
          `✅ Successfully migrated to the cloud:\n\n` +
          `• ${migratedPrompts} prompt(s)\n` +
          `• ${migratedCategories} category(ies)\n\n` +
          `Your data is now synced to Back4App.`
        )
        // Optionally clear localStorage after successful migration
        // localStorage.removeItem(promptsKey)
        // localStorage.removeItem(categoriesKey)
      }
    } catch (error) {
      console.error('Migration error:', error)
      // Don't alert on migration errors - just log them
    } finally {
      setSyncing(false)
    }
  }

  const updateCategoryCounts = (promptList: Prompt[], categoryList: PromptCategory[]) => {
    const updatedCategories = categoryList.map(category => ({
      ...category,
      count: promptList.filter(p => !p.isArchived && p.category === category.name).length
    }))
    setCategories(updatedCategories)
  }

  const handleCreatePrompt = async () => {
    if (!newPromptTitle.trim()) return

    try {
      setSyncing(true)
      const newPrompt: Prompt = {
        title: newPromptTitle,
        content: `# ${newPromptTitle}\n\nWrite your prompt content here...\n\n## Purpose\n[Describe what this prompt is designed to achieve]\n\n## Usage\n[Explain how to use this prompt effectively]`,
        category: newPromptCategory || 'General',
        tags: newPromptTags ? newPromptTags.split(',').map(tag => tag.trim()) : [],
        created: new Date(),
        modified: new Date(),
        isPinned: false,
        isArchived: false,
        type: newPromptType,
        difficulty: newPromptDifficulty,
        usageCount: 0,
        rating: 0
      }

      const created = await createPrompt(newPrompt)
      setPrompts([created, ...prompts])
      updateCategoryCounts([created, ...prompts], categories)

      setNewPromptTitle('')
      setNewPromptCategory('')
      setNewPromptTags('')
      setShowNewPromptModal(false)
    } catch (error: any) {
      console.error('Error creating prompt:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to create prompt: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setSyncing(true)
      const newCategory: PromptCategory = {
        name: newCategoryName,
        color: newCategoryColor,
        description: newCategoryDescription || 'Custom prompt category',
        count: 0
      }

      const created = await createPromptCategory(newCategory)
      setCategories([...categories, created])

      setNewCategoryName('')
      setNewCategoryDescription('')
      setShowNewCategoryModal(false)
    } catch (error: any) {
      console.error('Error creating category:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to create category: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return

    try {
      setSyncing(true)
      const updated = await updatePrompt(selectedPrompt, {
        title: editTitle,
        content: editContent,
        modified: new Date(),
        usageCount: (prompts.find(p => p.id === selectedPrompt)?.usageCount || 0) + 1
      })

      setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p))
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving prompt:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to save prompt: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      setSyncing(true)
      await deletePrompt(promptId)
      const updatedPrompts = prompts.filter(p => p.id !== promptId)
      setPrompts(updatedPrompts)
      updateCategoryCounts(updatedPrompts, categories)
      if (selectedPrompt === promptId) {
        setSelectedPrompt(null)
      }
    } catch (error: any) {
      console.error('Error deleting prompt:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to delete prompt: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleTogglePin = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId)
      if (!prompt) return

      const updated = await updatePrompt(promptId, { isPinned: !prompt.isPinned })
      setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p))
    } catch (error: any) {
      console.error('Error toggling pin:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
    }
  }

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return <Brain className="w-4 h-4 text-purple-400" />
      case 'user': return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'assistant': return <Zap className="w-4 h-4 text-green-400" />
      case 'creative': return <Lightbulb className="w-4 h-4 text-yellow-400" />
      case 'technical': return <Code className="w-4 h-4 text-red-400" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
    ))
  }

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    if (prompt.isArchived) return false

    const matchesSearch = searchTerm === '' ||
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prompt.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort prompts
  const sortedPrompts = filteredPrompts.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount
    return b.modified.getTime() - a.modified.getTime()
  })

  const selectedPromptData = prompts.find(p => p.id === selectedPrompt)

  const getDifficultyBorderColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#22c55e' // green-500
      case 'intermediate': return '#eab308' // yellow-500
      case 'advanced': return '#ef4444' // red-500
      default: return '#9ca3af' // gray-400
    }
  }

  if (!currentUser) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-300">Prompt Engineering Cloud</h2>
            <p className="text-gray-400 mb-6">Manage your AI prompts with cloud sync across all devices</p>
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
              loadData()
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        {/* Version Info */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>Nishen's AI Workspace v0.1.2</span>
          <span>Prompt Engineering Cloud</span>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-indigo-400">
            <Brain className="w-6 h-6 inline mr-2" />
            Prompt Engineering
          </h1>
          <div className="flex gap-2">
            {syncing && (
              <span className="text-xs text-blue-400 animate-pulse px-3 py-2">Syncing...</span>
            )}
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Category
            </button>
            <button
              onClick={() => setShowNewPromptModal(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Prompt
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none"
              style={{ borderColor: searchTerm ? '#6366f1' : '#374151' }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
          >
            <option value="all">All Categories ({prompts.filter(p => !p.isArchived).length})</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p>Loading prompts...</p>
          </div>
        ) : sortedPrompts.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No prompts found</p>
            <p className="text-xs">Create your first prompt!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="bg-gray-900 border-2 rounded-lg p-4 hover:shadow-lg transition-all"
                style={{ borderColor: getDifficultyBorderColor(prompt.difficulty) }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1">
                    {getTypeIcon(prompt.type)}
                    <h3 className="font-semibold text-white text-sm line-clamp-1 flex-1">
                      {prompt.title}
                    </h3>
                    {prompt.isPinned && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{prompt.content.substring(0, 120)}...</p>

                {/* Category and Difficulty */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300">
                    {prompt.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    prompt.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    prompt.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {prompt.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300 capitalize">
                    {prompt.type}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(prompt.rating)}
                  </div>
                  <span>Used {prompt.usageCount} times</span>
                </div>

                {/* Tags */}
                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prompt.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{prompt.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => copyPrompt(prompt.content)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPrompt(prompt.id || null)
                      setEditTitle(prompt.title)
                      setEditContent(prompt.content)
                      setIsEditing(true)
                    }}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id || '')}
                    className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Prompt Modal */}
      {isEditing && selectedPromptData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-indigo-400">
              Edit Prompt
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-600"
                  rows={20}
                  placeholder="Enter your prompt content here..."
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedPromptData.type)}
                    <span className="capitalize">{selectedPromptData.type}</span>
                  </div>
                  <span className={getDifficultyColor(selectedPromptData.difficulty)}>
                    {selectedPromptData.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(selectedPromptData.rating)}
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePin(selectedPromptData.id || '')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    selectedPromptData.isPinned
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  {selectedPromptData.isPinned ? 'Pinned' : 'Pin'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSavePrompt}
                disabled={syncing}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
              >
                <Save size={16} className="inline mr-1" />
                {syncing ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(selectedPromptData.title)
                  setEditContent(selectedPromptData.content)
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewPromptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-400">New Prompt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prompt Title</label>
                <input
                  type="text"
                  value={newPromptTitle}
                  onChange={(e) => setNewPromptTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  placeholder="Enter prompt title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => setNewPromptCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newPromptType}
                  onChange={(e) => setNewPromptType(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="user">User</option>
                  <option value="system">System</option>
                  <option value="assistant">Assistant</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={newPromptDifficulty}
                  onChange={(e) => setNewPromptDifficulty(e.target.value as any)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPromptTags}
                  onChange={(e) => setNewPromptTags(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  placeholder="ai, automation, scripting"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPromptModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrompt}
                disabled={syncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
              >
                {syncing ? 'Creating...' : 'Create Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-indigo-400">New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-600"
                  rows={3}
                  placeholder="Category description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-full h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={syncing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
              >
                {syncing ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
