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
    <div className="flex h-full bg-black text-white overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all"
        style={{
          backgroundColor: isSidebarOpen ? '#6366f1' : undefined,
        }}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Categories & Prompts */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 lg:w-80 bg-gray-900 border-r border-gray-800 flex-shrink-0 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>DevOps Studio v0.1.2</span>
            <span>Prompts Cloud</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-indigo-400">
              <Brain className="w-5 h-5 inline mr-2" />
              Prompt Engineering
            </h2>
            <div className="flex items-center gap-2">
              {syncing && (
                <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>
              )}
              <button
                onClick={() => setShowNewPromptModal(true)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Prompt
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Categories</span>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="text-xs text-gray-400 hover:text-indigo-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>All Prompts</span>
                <span className="text-xs">{prompts.filter(p => !p.isArchived).length}</span>
              </button>

              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-xs">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading prompts...</div>
          ) : sortedPrompts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No prompts found</p>
              <p className="text-xs">Create your first prompt!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedPrompt === prompt.id
                      ? 'bg-indigo-600/20 border-indigo-600/40'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                  onClick={() => {
                    setSelectedPrompt(prompt.id || null)
                    setEditTitle(prompt.title)
                    setEditContent(prompt.content)
                    setIsEditing(false)
                    setIsSidebarOpen(false) // Close sidebar on mobile after selection
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(prompt.type)}
                      <h3 className="font-medium text-sm line-clamp-1">{prompt.title}</h3>
                      {prompt.isPinned && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-2">
                    <div className="flex items-center justify-between">
                      <span>{prompt.category}</span>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(prompt.rating)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Used {prompt.usageCount} times</span>
                    <span>{prompt.modified.toLocaleDateString()}</span>
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prompt.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                      {prompt.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{prompt.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Prompt Editor */}
      <div className="flex-1 flex flex-col w-full lg:w-auto overflow-hidden">
        {selectedPromptData ? (
          <>
            {/* Prompt Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(selectedPromptData.type)}
                  <div>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-800 border border-indigo-600 rounded px-2 py-1 text-white focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <h3 className="font-semibold">{selectedPromptData.title}</h3>
                    )}
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <span>{selectedPromptData.category}</span>
                      <span>•</span>
                      <span className={getDifficultyColor(selectedPromptData.difficulty)}>
                        {selectedPromptData.difficulty}
                      </span>
                      <span>•</span>
                      <span>Used {selectedPromptData.usageCount} times</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(selectedPromptData.rating)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => copyPrompt(selectedPromptData.content)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                    title="Copy prompt to clipboard"
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    Copy
                  </button>

                  <button
                    onClick={() => handleTogglePin(selectedPromptData.id || '')}
                    className={`p-2 rounded transition-colors ${
                      selectedPromptData.isPinned
                        ? 'text-yellow-400 bg-yellow-400/20'
                        : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                    title={selectedPromptData.isPinned ? 'Unpin prompt' : 'Pin prompt'}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSavePrompt}
                        disabled={syncing}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        {syncing ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(selectedPromptData.title)
                          setEditContent(selectedPromptData.content)
                        }}
                        className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePrompt(selectedPromptData.id || '')}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-indigo-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your prompt content here..."
                />
              ) : (
                <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {selectedPromptData.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Prompt Metadata */}
            <div className="border-t border-gray-800 bg-gray-900 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <div className="flex items-center mt-1">
                    {getTypeIcon(selectedPromptData.type)}
                    <span className="ml-2 capitalize">{selectedPromptData.type}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <div className="mt-1">{selectedPromptData.created.toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-400">Modified:</span>
                  <div className="mt-1">{selectedPromptData.modified.toLocaleDateString()}</div>
                </div>
              </div>

              {selectedPromptData.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPromptData.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Prompt Selected</h3>
              <p className="text-gray-500">Select a prompt from the list to view and edit</p>
            </div>
          </div>
        )}
      </div>

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
