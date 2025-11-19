'use client'

import { useState, useEffect } from 'react'
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  createNoteCategory,
  getNoteCategories,
  deleteNoteCategory,
  handleSessionError,
  Note as NoteType,
  NoteCategory as NoteCategoryType
} from '@/lib/back4appService'
import { useBack4AppAuth } from '@/contexts/Back4AppAuthContext'
import {
  FileText,
  Plus,
  Edit3,
  Save,
  Search,
  Tag,
  Trash2,
  Clock,
  BookOpen,
  StickyNote,
  Monitor,
  Globe,
  Code,
  File,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  Menu,
  X,
  List,
  LayoutGrid,
  Star,
  StarOff
} from 'lucide-react'

const DEFAULT_CATEGORIES: NoteCategoryType[] = [
  { name: 'Work', color: '#ff073a' },
  { name: 'Personal', color: '#00CC33' },
  { name: 'Project', color: '#8B9499' },
  { name: 'Ideas', color: '#0ea5e9' },
  { name: 'Documentation', color: '#cc5500' }
]

export default function NotesCloud() {
  const { currentUser, loading: authLoading, error: authError } = useBack4AppAuth()
  const [notes, setNotes] = useState<NoteType[]>([])
  const [categories, setCategories] = useState<NoteCategoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile sidebar state

  // Modals
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showCategoryManagement, setShowCategoryManagement] = useState(false)

  // Form states
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [newNoteType, setNewNoteType] = useState<'markdown' | 'html' | 'document' | 'code' | 'other'>('markdown')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')

  // Load data when user is authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      loadData()
    } else if (!authLoading) {
      setLoading(false)
    }

    // Load view mode preference
    const savedViewMode = localStorage.getItem('devops-studio-notes-cloud-viewmode')
    if (savedViewMode === 'list' || savedViewMode === 'compact') {
      setViewMode(savedViewMode)
    }
  }, [currentUser, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fetchedNotes, fetchedCategories] = await Promise.all([
        getNotes(),
        getNoteCategories()
      ])

      setNotes(fetchedNotes)

      // If no categories exist, create default ones
      if (fetchedCategories.length === 0) {
        const created = await Promise.all(
          DEFAULT_CATEGORIES.map(cat => createNoteCategory(cat))
        )
        setCategories(created)
      } else {
        setCategories(fetchedCategories)
      }
    } catch (error: any) {
      console.error('Error loading data:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Failed to load notes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return

    try {
      setSyncing(true)

      // Generate default content based on type
      let defaultContent = ''
      switch (newNoteType) {
        case 'html':
          defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${newNoteTitle}</title>
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
        }
        h1 { color: #fff; text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 ${newNoteTitle}</h1>
        <p>Start building your HTML content here...</p>
    </div>
</body>
</html>`
          break
        case 'markdown':
          defaultContent = `# ${newNoteTitle}

> **Created in Nishen's AI Workspace** | ${new Date().toLocaleDateString()}

## 📋 Overview

Start writing your markdown content here...

## 🔧 Features

- **Rich formatting** with markdown syntax
- **Code blocks** with syntax highlighting
- **Lists and tables**
- **Links and images**

## 📝 Notes

Add your notes and documentation here.`
          break
        case 'code':
          defaultContent = `// ${newNoteTitle}
// Created in Nishen's AI Workspace

/**
 * ${newNoteTitle} - Description
 */

function main() {
    console.log("Hello from ${newNoteTitle}!");
    // Add your code here
}

main();`
          break
        case 'document':
          defaultContent = `${newNoteTitle}
${'='.repeat(newNoteTitle.length)}

Created in Nishen's AI Workspace on ${new Date().toLocaleDateString()}

Overview:
---------
Document description here.

Contents:
---------
- Section 1
- Section 2
- Section 3

Notes:
------
Add your documentation content here.`
          break
        default:
          defaultContent = `# ${newNoteTitle}

Start writing your note here...`
      }

      const newNote = await createNote({
        title: newNoteTitle,
        content: defaultContent,
        category: newNoteCategory || 'General',
        tags: newNoteTags ? newNoteTags.split(',').map(tag => tag.trim()) : [],
        isPinned: false,
        isArchived: false,
        type: newNoteType
      })

      setNotes([newNote, ...notes])
      setSelectedNote(newNote.id || null)
      setNewNoteTitle('')
      setNewNoteCategory('')
      setNewNoteTags('')
      setNewNoteType('markdown')
      setShowNewNoteModal(false)
    } catch (error: any) {
      console.error('Error creating note:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Failed to create note: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setSyncing(true)
      const newCategory = await createNoteCategory({
        name: newCategoryName,
        color: newCategoryColor
      })

      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setNewCategoryColor('#6366f1')
      setShowNewCategoryModal(false)
    } catch (error: any) {
      console.error('Error creating category:', error)

      // Handle session errors
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

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Don't delete if there are notes in this category
    const notesInCategory = notes.filter(note => note.category === categoryName && !note.isArchived)
    if (notesInCategory.length > 0) {
      alert(`Cannot delete category "${categoryName}" because it contains ${notesInCategory.length} note(s). Please move or delete the notes first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
      return
    }

    try {
      setSyncing(true)
      await deleteNoteCategory(categoryId)
      setCategories(categories.filter(cat => cat.id !== categoryId))

      if (selectedCategory === categoryName) {
        setSelectedCategory('all')
      }
    } catch (error: any) {
      console.error('Error deleting category:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Failed to delete category: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedNote) return

    try {
      setSyncing(true)
      const updated = await updateNote(selectedNote, {
        title: editTitle,
        content: editContent
      })

      setNotes(notes.map(note =>
        note.id === selectedNote ? updated : note
      ))

      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving note:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Failed to save note: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      setSyncing(true)
      await deleteNote(noteId)
      setNotes(notes.filter(note => note.id !== noteId))

      if (selectedNote === noteId) {
        setSelectedNote(null)
      }
    } catch (error: any) {
      console.error('Error deleting note:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Failed to delete note: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleTogglePin = async (note: NoteType) => {
    if (!note.id) return

    try {
      const updated = await updateNote(note.id, { isPinned: !note.isPinned })
      setNotes(notes.map(n => n.id === updated.id ? updated : n))
    } catch (error: any) {
      console.error('Error toggling pin:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
    }
  }

  const toggleViewMode = (mode: 'list' | 'compact') => {
    setViewMode(mode)
    localStorage.setItem('devops-studio-notes-cloud-viewmode', mode)
  }

  const exportNotes = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      notes: notes,
      categories: categories
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.notes || !Array.isArray(data.notes)) {
        alert('Invalid import file format')
        return
      }

      setSyncing(true)

      // Import notes one by one
      for (const note of data.notes) {
        await createNote({
          title: note.title,
          content: note.content,
          category: note.category || 'General',
          tags: note.tags || [],
          isPinned: note.isPinned || false,
          isArchived: note.isArchived || false,
          type: note.type || 'markdown'
        })
      }

      await loadData()
      alert(`Successfully imported ${data.notes.length} notes!`)
    } catch (error: any) {
      console.error('Error importing:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Import failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const migrateFromLocalStorage = async () => {
    if (!confirm('This will import notes from localStorage to Back4App. Continue?')) return

    try {
      setSyncing(true)
      const localNotes = localStorage.getItem('nishen-workspace-notes')
      const localCategories = localStorage.getItem('nishen-workspace-categories')

      if (!localNotes) {
        alert('No localStorage notes found')
        return
      }

      const parsedNotes = JSON.parse(localNotes)
      const parsedCategories = localCategories ? JSON.parse(localCategories) : []

      let imported = 0

      // Import categories first
      for (const cat of parsedCategories) {
        await createNoteCategory({
          name: cat.name,
          color: cat.color
        })
      }

      // Import notes
      for (const note of parsedNotes) {
        await createNote({
          title: note.title,
          content: note.content,
          category: note.category || 'General',
          tags: note.tags || [],
          isPinned: note.isPinned || false,
          isArchived: note.isArchived || false,
          type: note.type || 'markdown'
        })
        imported++
      }

      await loadData()
      alert(`Successfully migrated ${imported} notes from localStorage!`)
    } catch (error: any) {
      console.error('Migration error:', error)

      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }

      alert(`Migration failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  // Helper function to get file type icon
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'html': return <Globe className="w-4 h-4 text-blue-400" />
      case 'markdown': return <BookOpen className="w-4 h-4 text-purple-400" />
      case 'code': return <Code className="w-4 h-4 text-green-400" />
      case 'document': return <FileText className="w-4 h-4 text-gray-400" />
      default: return <File className="w-4 h-4 text-gray-400" />
    }
  }

  // Simple markdown renderer
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

      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)\n```/gim, '<pre class="bg-gray-800 p-4 rounded mb-4 overflow-x-auto"><code class="text-green-400 text-sm">$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-700 px-2 py-1 rounded text-green-300">$1</code>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')

      // Lists
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-green-400 mr-2">✅</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center mb-1"><span class="text-gray-500 mr-2">☐</span><span class="text-gray-300">$1</span></div>')
      .replace(/^- (.*$)/gim, '<div class="flex items-start mb-1"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">$1</span></div>')

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

    return html
  }

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    if (note.isArchived) return false

    const matchesSearch = searchTerm === '' ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort notes: pinned first, then by modified date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    const aDate = a.modified || a.updatedAt || new Date(0)
    const bDate = b.modified || b.updatedAt || new Date(0)
    return bDate.getTime() - aDate.getTime()
  })

  const selectedNoteData = notes.find(n => n.id === selectedNote)

  // Calculate category counts
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: notes.filter(n => n.category === cat.name && !n.isArchived).length
  }))

  // Show loading or error state
  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#1a1625' }}>
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-spin" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#6366f1' }}>
            Connecting to Cloud...
          </h2>
          <p className="text-gray-400">
            Authenticating with Back4App cloud services...
          </p>
        </div>
      </div>
    )
  }

  if (authError || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#1a1625' }}>
        <div className="text-center">
          <CloudOff className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#6366f1' }}>
            Cloud Connection Unavailable
          </h2>
          <p className="text-gray-400 mb-4">
            {authError || 'Unable to connect to Back4App cloud services. Cloud features are currently unavailable.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded transition-colors text-white"
            style={{ backgroundColor: '#6366f1' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full text-white overflow-hidden" style={{ backgroundColor: '#0f0d15' }}>
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

      <div className="flex h-full">
        {/* Sidebar - Categories & Notes */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-80 lg:w-80 border-r border-gray-800 flex-shrink-0 flex-col
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ backgroundColor: '#1a1625', display: 'flex' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
              <span>DevOps Studio v1.2.4</span>
              <span>Notes Module</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#6366f1' }}>Notes</h2>
              <div className="flex items-center gap-2">
                {syncing && (
                  <span className="text-xs animate-pulse" style={{ color: '#6366f1' }}>
                    <Cloud size={14} className="inline" />
                  </span>
                )}
                <div className="flex items-center bg-gray-800 rounded p-0.5">
                  <button
                    onClick={() => toggleViewMode('list')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleViewMode('compact')}
                    className={`p-1 rounded transition-colors ${
                      viewMode === 'compact'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Compact View"
                  >
                    <LayoutGrid className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => setShowNewNoteModal(true)}
                  className="px-3 py-1 rounded text-sm font-medium transition-colors hover:opacity-80 text-white"
                  style={{ backgroundColor: '#6366f1' }}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Note
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
                placeholder="Search notes..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Import/Export */}
            <div className="mb-4">
              <button
                onClick={() => setShowImportExport(!showImportExport)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-sm"
              >
                <Download size={14} className="inline mr-1" />
                Import/Export
              </button>

              {showImportExport && (
                <div className="mt-2 p-3 bg-gray-800 rounded-lg space-y-2">
                  <button
                    onClick={exportNotes}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-xs"
                  >
                    <Download size={12} className="inline mr-1" />
                    Export to JSON
                  </button>
                  <label className="w-full block">
                    <span className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-xs cursor-pointer flex items-center justify-center">
                      <Upload size={12} className="inline mr-1" />
                      Import from JSON
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importNotes}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={migrateFromLocalStorage}
                    className="w-full px-3 py-2 text-white rounded hover:opacity-80 transition-opacity text-xs"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    <Cloud size={12} className="inline mr-1" />
                    Migrate from localStorage
                  </button>
                </div>
              )}
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Categories</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCategoryManagement(!showCategoryManagement)}
                    className="text-xs text-gray-400 hover:text-indigo-400"
                    title="Manage Categories"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setShowNewCategoryModal(true)}
                    className="text-xs text-gray-400 hover:text-indigo-400"
                    title="Add Category"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  style={selectedCategory === 'all' ? { backgroundColor: '#6366f1' } : {}}
                >
                  <span>All Notes</span>
                  <span className="text-xs">{notes.filter(n => !n.isArchived).length}</span>
                </button>

                {categoriesWithCounts.map(category => (
                  <div key={category.id} className="flex items-center group">
                    <button
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex-1 flex items-center justify-between p-2 rounded text-sm transition-colors ${
                        selectedCategory === category.name
                          ? 'text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      style={selectedCategory === category.name ? { backgroundColor: '#6366f1' } : {}}
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
                    {showCategoryManagement && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          category.id && handleDeleteCategory(category.id, category.name)
                        }}
                        className="ml-1 p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title={`Delete ${category.name} category`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {loading ? (
              <div className="text-center text-gray-500 mt-8">
                <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin opacity-50" />
                <p>Loading notes...</p>
              </div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notes found</p>
                <p className="text-xs">Create your first note!</p>
              </div>
            ) : viewMode === 'compact' ? (
              <div className="grid grid-cols-2 gap-2">
                {sortedNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedNote === note.id
                        ? 'border-indigo-500'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    }`}
                    style={selectedNote === note.id ? { backgroundColor: '#6366f1' + '30' } : {}}
                    onClick={() => {
                      setSelectedNote(note.id || null)
                      setEditTitle(note.title)
                      setEditContent(note.content)
                      setIsEditing(false)
                      setIsSidebarOpen(false) // Close sidebar on mobile after selection
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                      {note.isPinned && (
                        <div className="text-yellow-400 ml-2">
                          <StickyNote className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {note.content.replace(/#+\s/g, '').substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: categoriesWithCounts.find(c => c.name === note.category)?.color + '20',
                            color: categoriesWithCounts.find(c => c.name === note.category)?.color
                          }}
                        >
                          {note.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getFileTypeIcon(note.type || 'markdown')}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(note.modified || note.updatedAt || '').toLocaleDateString()}
                      </div>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      selectedNote === note.id
                        ? 'border-indigo-500'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    }`}
                    style={selectedNote === note.id ? { backgroundColor: '#6366f1' + '30' } : {}}
                    onClick={() => {
                      setSelectedNote(note.id || null)
                      setEditTitle(note.title)
                      setEditContent(note.content)
                      setIsEditing(false)
                      setIsSidebarOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                      {note.isPinned && (
                        <div className="text-yellow-400 ml-2">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {note.content.replace(/#+\s/g, '').substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: categoriesWithCounts.find(c => c.name === note.category)?.color + '20',
                            color: categoriesWithCounts.find(c => c.name === note.category)?.color
                          }}
                        >
                          {note.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getFileTypeIcon(note.type || 'markdown')}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(note.modified || note.updatedAt || '').toLocaleDateString()}
                      </div>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Note Editor or Cards View */}
        <div className="flex-1 flex flex-col w-full lg:w-auto overflow-hidden">
          {!selectedNoteData ? (
            /* All Notes Grid View */
            <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0f0d15' }}>
              <div className="p-4 border-b border-gray-800" style={{ backgroundColor: '#1a1625' }}>
                <h2 className="text-xl font-bold">
                  {selectedCategory === 'all' ? 'All Notes' : `${selectedCategory} Notes`}
                </h2>
                <p className="text-sm text-gray-400">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                  <div className="text-center text-gray-500 py-12">
                    <RefreshCw className="w-12 h-12 mx-auto mb-2 animate-spin opacity-50" />
                    <p>Loading notes...</p>
                  </div>
                ) : sortedNotes.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notes found</p>
                    <p className="text-xs mt-2">Create your first note!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedNotes.map(note => (
                      <div
                        key={note.id}
                        className="p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] border border-gray-700 hover:border-indigo-500"
                        style={{ backgroundColor: '#1a1625' }}
                        onClick={() => {
                          setSelectedNote(note.id || null)
                          setEditTitle(note.title)
                          setEditContent(note.content)
                          setIsEditing(false)
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{note.title}</h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span
                                className="px-2 py-1 rounded"
                                style={{
                                  backgroundColor: categoriesWithCounts.find(c => c.name === note.category)?.color + '20',
                                  color: categoriesWithCounts.find(c => c.name === note.category)?.color
                                }}
                              >
                                {note.category}
                              </span>
                              <div className="flex items-center">
                                {getFileTypeIcon(note.type || 'markdown')}
                              </div>
                            </div>
                          </div>
                          {note.isPinned && (
                            <div className="text-yellow-400">
                              <StickyNote className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                          {note.content.replace(/#+\s/g, '').replace(/[*_`]/g, '').substring(0, 150)}...
                        </p>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {note.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 4 && (
                              <span className="text-xs text-gray-500">+{note.tags.length - 4}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(note.modified || note.updatedAt || '').toLocaleDateString()}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedNote(note.id || null)
                              setEditTitle(note.title)
                              setEditContent(note.content)
                              setIsEditing(false)
                            }}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            View →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Note Editor View */}
              {/* Note Header */}
              <div className="p-4 border-b border-gray-800" style={{ backgroundColor: '#1a1625' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedNote(null)}
                      className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
                      title="Back to all notes"
                    >
                      ← Back
                    </button>
                    <FileText className="w-5 h-5" style={{ color: '#6366f1' }} />
                    <div>
                      {isEditing ? (
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-indigo-500"
                        />
                      ) : (
                        <h3 className="font-semibold">{selectedNoteData.title}</h3>
                      )}
                      <div className="text-sm text-gray-400">
                        {selectedNoteData.category} • Modified: {new Date(selectedNoteData.modified || selectedNoteData.updatedAt || '').toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* Preview Button for HTML/Markdown */}
                    {(selectedNoteData.type === 'html' || selectedNoteData.type === 'markdown') && !isEditing && (
                      <button
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                          isPreviewMode
                            ? 'bg-green-600 hover:bg-green-700'
                            : selectedNoteData.type === 'html'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {selectedNoteData.type === 'markdown' ? (
                          <BookOpen className="w-4 h-4 inline mr-1" />
                        ) : (
                          <Monitor className="w-4 h-4 inline mr-1" />
                        )}
                        {isPreviewMode ? 'Show Code' : selectedNoteData.type === 'markdown' ? 'Render' : 'Preview'}
                      </button>
                    )}

                    <button
                      onClick={() => handleTogglePin(selectedNoteData)}
                      className={`p-2 rounded transition-colors ${
                        selectedNoteData.isPinned
                          ? 'text-yellow-400 bg-yellow-400/20'
                          : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800'
                      }`}
                      title={selectedNoteData.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveNote}
                          disabled={syncing}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 inline mr-1" />
                          {syncing ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setEditTitle(selectedNoteData.title)
                            setEditContent(selectedNoteData.content)
                          }}
                          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap text-white hover:opacity-80"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        <Edit3 className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => selectedNoteData.id && handleDeleteNote(selectedNoteData.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
                    placeholder="Write your note here... You can use Markdown formatting!"
                  />
                ) : selectedNoteData.type === 'html' && isPreviewMode ? (
                  <div className="w-full h-full bg-white border border-gray-700 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={selectedNoteData.content}
                      className="w-full h-full border-0"
                      title={`Preview of ${selectedNoteData.title}`}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                ) : selectedNoteData.type === 'markdown' && isPreviewMode ? (
                  <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg p-6 overflow-auto">
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(selectedNoteData.content)
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                    <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                      {selectedNoteData.content}
                    </pre>
                  </div>
                )}
              </div>

              {/* Note Metadata */}
              <div className="border-t border-gray-800 p-4" style={{ backgroundColor: '#1a1625' }}>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Created: {new Date(selectedNoteData.created || selectedNoteData.createdAt || '').toLocaleString()}</span>
                    <span>•</span>
                    <span>Modified: {new Date(selectedNoteData.modified || selectedNoteData.updatedAt || '').toLocaleString()}</span>
                  </div>

                  {selectedNoteData.tags && selectedNoteData.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <div className="flex space-x-1">
                        {selectedNoteData.tags.map(tag => (
                          <span key={tag} className="bg-gray-700 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="border border-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1a1625' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#6366f1' }}>
              <FileText className="mr-2" size={20} />
              New Note
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Note Title *</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-indigo-500"
                  placeholder="Enter note title"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-indigo-500"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note Type</label>
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-indigo-500"
                >
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                  <option value="code">Code</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-indigo-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateNote}
                disabled={!newNoteTitle.trim() || syncing}
                className="flex-1 px-4 py-2 text-white rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#6366f1' }}
              >
                {syncing ? 'Creating...' : 'Create Note'}
              </button>
              <button
                onClick={() => {
                  setShowNewNoteModal(false)
                  setNewNoteTitle('')
                  setNewNoteCategory('')
                  setNewNoteTags('')
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
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
          <div className="border border-gray-800 rounded-lg p-6 w-96" style={{ backgroundColor: '#1a1625' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#6366f1' }}>New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex space-x-2">
                  {['#6366f1', '#ff073a', '#cc5500', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded border-2 ${
                        newCategoryColor === color ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
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
                className="px-4 py-2 rounded transition-opacity hover:opacity-80 text-white disabled:opacity-50"
                style={{ backgroundColor: '#6366f1' }}
                disabled={!newCategoryName.trim() || syncing}
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
