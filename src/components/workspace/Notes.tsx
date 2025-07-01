'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  Search, 
  Calendar, 
  Tag,
  Trash2,
  Eye,
  Clock,
  BookOpen,
  StickyNote,
  Archive
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created: Date
  modified: Date
  isPinned: boolean
  isArchived: boolean
}

interface NoteCategory {
  id: string
  name: string
  color: string
  count: number
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<NoteCategory[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Modals
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  
  // Form states
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#ff073a')

  // Load data from localStorage or demo data
  useEffect(() => {
    const savedNotes = localStorage.getItem('nishen-workspace-notes')
    const savedCategories = localStorage.getItem('nishen-workspace-categories')
    
    if (savedNotes && savedCategories) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((n: any) => ({
          ...n,
          created: new Date(n.created),
          modified: new Date(n.modified)
        }))
        setNotes(parsedNotes)
        setCategories(JSON.parse(savedCategories))
        return
      } catch (error) {
        console.error('Error loading saved notes:', error)
      }
    }

    // Default demo data if no saved data
    const demoCategories: NoteCategory[] = [
      { id: 'cat-1', name: 'System Admin', color: '#ff073a', count: 0 },
      { id: 'cat-2', name: 'Development', color: '#cc5500', count: 0 },
      { id: 'cat-3', name: 'Documentation', color: '#0ea5e9', count: 0 },
      { id: 'cat-4', name: 'Ideas', color: '#10b981', count: 0 }
    ]

    const demoNotes: Note[] = [
      {
        id: 'note-1',
        title: 'PowerShell Best Practices',
        content: `# PowerShell Best Practices for System Administration

## Key Guidelines:
- Always use approved verbs (Get-, Set-, New-, Remove-)
- Use proper error handling with try/catch blocks
- Implement parameter validation
- Use Write-Output instead of Write-Host for data
- Always test scripts in development environment first

## Security Considerations:
- Use execution policies appropriately
- Avoid hardcoded credentials
- Implement proper logging
- Use constrained endpoints when possible

## Performance Tips:
- Use pipeline efficiently
- Avoid unnecessary object creation
- Filter left, format right
- Use specific property selection`,
        category: 'System Admin',
        tags: ['powershell', 'best-practices', 'security'],
        created: new Date('2025-06-15'),
        modified: new Date('2025-06-30'),
        isPinned: true,
        isArchived: false
      },
      {
        id: 'note-2',
        title: 'Next.js 14 Project Setup',
        content: `# Next.js 14 Project Setup Notes

## Installation:
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features in v14:
- App Router (stable)
- Server Components by default
- Improved TypeScript support
- Turbopack (beta)

## Essential Dependencies:
- tailwindcss
- @types/node
- lucide-react for icons

## Configuration Tips:
- Use exact versions to avoid compatibility issues
- Configure tailwind.config.ts for custom colors
- Set up proper ESLint rules`,
        category: 'Development',
        tags: ['nextjs', 'react', 'setup'],
        created: new Date('2025-06-20'),
        modified: new Date('2025-06-28'),
        isPinned: false,
        isArchived: false
      },
      {
        id: 'note-3',
        title: 'Workspace Color Scheme',
        content: `# Nishen's AI Workspace Color Palette

## Primary Colors:
- **Neon Red**: #ff073a (primary actions, highlights)
- **Burnt Orange**: #cc5500 (secondary actions, accents)
- **Background**: #000000 (main background)
- **Secondary BG**: #0a0a0a (card backgrounds)

## Usage Guidelines:
- Use neon red for primary CTAs and active states
- Burnt orange for secondary actions and hover states
- Gray scale for text hierarchy
- Maintain WCAG contrast ratios

## Implementation:
- Defined in globals.css as CSS variables
- Extended in tailwind.config.ts
- Applied consistently across components`,
        category: 'Documentation',
        tags: ['design', 'colors', 'branding'],
        created: new Date('2025-06-25'),
        modified: new Date('2025-06-25'),
        isPinned: false,
        isArchived: false
      }
    ]

    setNotes(demoNotes)
    setCategories(demoCategories)
  }, [])

  // Save data to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('nishen-workspace-notes', JSON.stringify(notes))
      localStorage.setItem('nishen-workspace-categories', JSON.stringify(categories))
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  // Auto-save whenever notes or categories change
  useEffect(() => {
    if (notes.length > 0 || categories.length > 0) {
      saveToLocalStorage()
    }
  }, [notes, categories])

  // Update category counts
  useEffect(() => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      count: notes.filter(note => note.category === cat.name && !note.isArchived).length
    })))
  }, [notes])

  const createNote = () => {
    if (!newNoteTitle.trim()) return
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: '# ' + newNoteTitle + '\n\nStart writing your note here...',
      category: newNoteCategory || 'General',
      tags: newNoteTags ? newNoteTags.split(',').map(tag => tag.trim()) : [],
      created: new Date(),
      modified: new Date(),
      isPinned: false,
      isArchived: false
    }
    
    setNotes(prev => [newNote, ...prev])
    setSelectedNote(newNote.id)
    setNewNoteTitle('')
    setNewNoteCategory('')
    setNewNoteTags('')
    setShowNewNoteModal(false)
  }

  const createCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: NoteCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      color: newCategoryColor,
      count: 0
    }
    
    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
    setNewCategoryColor('#ff073a')
    setShowNewCategoryModal(false)
  }

  const saveNote = () => {
    if (!selectedNote) return
    
    setNotes(prev => prev.map(note => 
      note.id === selectedNote
        ? { ...note, title: editTitle, content: editContent, modified: new Date() }
        : note
    ))
    
    setIsEditing(false)
  }

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId))
      if (selectedNote === noteId) {
        setSelectedNote(null)
      }
    }
  }

  const togglePin = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    if (note.isArchived) return false
    
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Sort notes: pinned first, then by modified date
  const sortedNotes = filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.modified.getTime() - a.modified.getTime()
  })

  const selectedNoteData = notes.find(n => n.id === selectedNote)

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Categories & Notes */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neon-red">Notes</h2>
            <button
              onClick={() => setShowNewNoteModal(true)}
              className="bg-neon-red hover:bg-neon-red-bright px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Note
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-red"
            />
          </div>
          
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Categories</span>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="text-xs text-gray-400 hover:text-neon-red"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-neon-red/20 text-neon-red' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span>All Notes</span>
                <span className="text-xs">{notes.filter(n => !n.isArchived).length}</span>
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    selectedCategory === category.name 
                      ? 'bg-neon-red/20 text-neon-red' 
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

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedNotes.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <StickyNote className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes found</p>
              <p className="text-xs">Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedNote === note.id 
                      ? 'bg-neon-red/20 border-neon-red/40' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                  }`}
                  onClick={() => {
                    setSelectedNote(note.id)
                    setEditTitle(note.title)
                    setEditContent(note.content)
                    setIsEditing(false)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                    {note.isPinned && (
                      <div className="text-burnt-orange ml-2">
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
                          backgroundColor: categories.find(c => c.name === note.category)?.color + '20',
                          color: categories.find(c => c.name === note.category)?.color
                        }}
                      >
                        {note.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {note.modified.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {note.tags.length > 0 && (
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

      {/* Main Content - Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNoteData ? (
          <>
            {/* Note Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-neon-red" />
                  <div>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:border-neon-red"
                      />
                    ) : (
                      <h3 className="font-semibold">{selectedNoteData.title}</h3>
                    )}
                    <div className="text-sm text-gray-400">
                      {selectedNoteData.category} • Modified: {selectedNoteData.modified.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePin(selectedNoteData.id)}
                    className={`p-2 rounded transition-colors ${
                      selectedNoteData.isPinned 
                        ? 'text-burnt-orange bg-burnt-orange/20' 
                        : 'text-gray-400 hover:text-burnt-orange hover:bg-gray-800'
                    }`}
                    title={selectedNoteData.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveNote}
                        className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        <Save className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(selectedNoteData.title)
                          setEditContent(selectedNoteData.content)
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
                  
                  <button
                    onClick={() => deleteNote(selectedNoteData.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 p-4">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-neon-red"
                  placeholder="Write your note here... You can use Markdown formatting!"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {selectedNoteData.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Note Metadata */}
            <div className="border-t border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>Created: {selectedNoteData.created.toLocaleString()}</span>
                  <span>•</span>
                  <span>Modified: {selectedNoteData.modified.toLocaleString()}</span>
                </div>
                
                {selectedNoteData.tags.length > 0 && (
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
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Note Selected</h3>
              <p className="text-gray-500">Select a note from the sidebar to view and edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New Note</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note Title</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="Enter note title"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
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
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNote}
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
                disabled={!newNoteTitle.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-neon-red">New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-neon-red"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex space-x-2">
                  {['#ff073a', '#cc5500', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b'].map(color => (
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
                onClick={createCategory}
                className="px-4 py-2 bg-neon-red hover:bg-neon-red-bright rounded transition-colors"
                disabled={!newCategoryName.trim()}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}