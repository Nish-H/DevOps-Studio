'use client'

import { useState, useEffect } from 'react'
import {
  createURLLink,
  getURLLinks,
  updateURLLink,
  deleteURLLink,
  incrementLinkClickCount,
  URLLink as URLLinkType
} from '@/lib/back4appService'
import { useBack4AppAuth } from '@/contexts/Back4AppAuthContext'
import {
  Link,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Star,
  StarOff,
  Download,
  Upload,
  Cloud,
  CloudOff,
  RefreshCw,
  List,
  LayoutGrid
} from 'lucide-react'

interface URLCategory {
  id: string
  name: string
  color: string
}

const defaultCategories: URLCategory[] = [
  { id: 'web', name: 'Web', color: '#3B82F6' },
  { id: 'ai', name: 'AI Tools', color: '#F59E0B' },
  { id: 'dev', name: 'Dev Tools', color: '#06B6D4' },
  { id: 'admin', name: 'Admin', color: '#EF4444' },
  { id: 'media', name: 'Media', color: '#8B5CF6' },
  { id: 'other', name: 'Other', color: '#6B7280' }
]

export default function URLLinksCloud() {
  const { currentUser, loading: authLoading, error: authError } = useBack4AppAuth()
  const [links, setLinks] = useState<URLLinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<URLLinkType | null>(null)
  const [showImportExport, setShowImportExport] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'web',
    tags: '',
    isPinned: false
  })

  // Load links when user is authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      loadLinks()
    } else if (!authLoading) {
      setLoading(false)
    }

    // Load view mode preference
    const savedViewMode = localStorage.getItem('devops-studio-urllinks-cloud-viewmode')
    if (savedViewMode === 'list' || savedViewMode === 'compact') {
      setViewMode(savedViewMode)
    }
  }, [currentUser, authLoading])

  const loadLinks = async () => {
    try {
      setLoading(true)
      const fetchedLinks = await getURLLinks()
      setLinks(fetchedLinks)
    } catch (error: any) {
      console.error('Error loading links:', error)
      alert(`Failed to load links: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Please enter both title and URL')
      return
    }

    try {
      setSyncing(true)

      const linkData: URLLinkType = {
        title: formData.title,
        url: formData.url,
        description: formData.description,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        isPinned: formData.isPinned,
        clickCount: 0
      }

      if (editingLink && editingLink.id) {
        // Update existing link
        const updated = await updateURLLink(editingLink.id, linkData)
        setLinks(links.map(l => l.id === updated.id ? updated : l))
      } else {
        // Create new link
        const newLink = await createURLLink(linkData)
        setLinks([newLink, ...links])
      }

      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        category: 'web',
        tags: '',
        isPinned: false
      })
      setShowAddModal(false)
      setEditingLink(null)
    } catch (error: any) {
      console.error('Error saving link:', error)
      alert(`Failed to save link: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      setSyncing(true)
      await deleteURLLink(linkId)
      setLinks(links.filter(l => l.id !== linkId))
    } catch (error: any) {
      console.error('Error deleting link:', error)
      alert(`Failed to delete link: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleEdit = (link: URLLinkType) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
      category: link.category,
      tags: link.tags?.join(', ') || '',
      isPinned: link.isPinned || false
    })
    setShowAddModal(true)
  }

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await incrementLinkClickCount(linkId)
      // Update local state
      setLinks(links.map(l =>
        l.id === linkId
          ? { ...l, clickCount: (l.clickCount || 0) + 1, lastVisited: new Date() }
          : l
      ))
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error tracking click:', error)
      window.open(url, '_blank')
    }
  }

  const togglePin = async (link: URLLinkType) => {
    if (!link.id) return

    try {
      const updated = await updateURLLink(link.id, { isPinned: !link.isPinned })
      setLinks(links.map(l => l.id === updated.id ? updated : l))
    } catch (error: any) {
      console.error('Error toggling pin:', error)
    }
  }

  const toggleViewMode = (mode: 'list' | 'compact') => {
    setViewMode(mode)
    localStorage.setItem('devops-studio-urllinks-cloud-viewmode', mode)
  }

  const exportLinks = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      links: links
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `url-links-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importLinks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.links || !Array.isArray(data.links)) {
        alert('Invalid import file format')
        return
      }

      setSyncing(true)

      // Import links one by one
      for (const link of data.links) {
        await createURLLink({
          title: link.title,
          url: link.url,
          description: link.description || '',
          category: link.category || 'web',
          tags: link.tags || [],
          isPinned: link.isPinned || false
        })
      }

      await loadLinks()
      alert(`Successfully imported ${data.links.length} links!`)
    } catch (error: any) {
      console.error('Error importing:', error)
      alert(`Import failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const migrateFromLocalStorage = async () => {
    if (!confirm('This will import links from localStorage to Back4App. Continue?')) return

    try {
      setSyncing(true)
      const localLinks = localStorage.getItem('devops-studio-url-links')

      if (!localLinks) {
        alert('No localStorage links found')
        return
      }

      const parsedLinks = JSON.parse(localLinks)
      let imported = 0

      for (const link of parsedLinks) {
        await createURLLink({
          title: link.title,
          url: link.url,
          description: link.description || '',
          category: link.category || 'web',
          tags: link.tags || [],
          isPinned: link.isFavorite || false
        })
        imported++
      }

      await loadLinks()
      alert(`Successfully migrated ${imported} links from localStorage!`)
    } catch (error: any) {
      console.error('Migration error:', error)
      alert(`Migration failed: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const getFilteredLinks = () => {
    return links.filter(link => {
      if (selectedCategory !== 'all' && link.category !== selectedCategory) return false
      if (showPinnedOnly && !link.isPinned) return false
      if (searchTerm && !link.title.toLowerCase().includes(searchTerm.toLowerCase())
          && !link.url.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }

  const filteredLinks = getFilteredLinks()
  const categories = Array.from(new Set(links.map(l => l.category)))

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
    <div className="flex-1 flex flex-col">
      {/* Header with Indigo theme */}
      <div className="p-4 border-b border-gray-800" style={{ backgroundColor: '#1a1625' }}>
        {/* Version Info */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>DevOps Studio v1.2.4</span>
          <span>Links Module</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Link className="mr-2" size={20} style={{ color: '#6366f1' }} />
              URL Links
            </h2>
            <p className="text-sm text-gray-400">
              Manage your bookmarks with cloud sync • {filteredLinks.length} links
            </p>
          </div>
          <div className="flex items-center gap-3">
            {syncing && (
              <span className="text-xs animate-pulse" style={{ color: '#6366f1' }}>
                <Cloud size={16} className="inline mr-1" />
                Syncing...
              </span>
            )}
            <div className="flex items-center bg-gray-800 rounded p-1">
              <button
                onClick={() => toggleViewMode('list')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => toggleViewMode('compact')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Compact View"
              >
                <LayoutGrid className="h-4 w-4" />
                Compact
              </button>
            </div>
            <button
              onClick={() => setShowImportExport(!showImportExport)}
              className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              <Download size={16} className="inline mr-1" />
              Import/Export
            </button>
            <button
              onClick={loadLinks}
              className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditingLink(null)
                setFormData({
                  title: '',
                  url: '',
                  description: '',
                  category: 'web',
                  tags: '',
                  isPinned: false
                })
                setShowAddModal(true)
              }}
              className="px-4 py-2 text-white rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#6366f1' }}
            >
              <Plus size={16} className="inline mr-1" />
              Add Link
            </button>
          </div>
        </div>

        {/* Import/Export Menu */}
        {showImportExport && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3">Import/Export</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportLinks}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                <Download size={16} className="inline mr-1" />
                Export to JSON
              </button>
              <label className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm cursor-pointer">
                <Upload size={16} className="inline mr-1" />
                Import from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={importLinks}
                  className="hidden"
                />
              </label>
              <button
                onClick={migrateFromLocalStorage}
                className="px-4 py-2 text-white rounded hover:opacity-80 transition-opacity text-sm"
                style={{ backgroundColor: '#6366f1' }}
              >
                <Cloud size={16} className="inline mr-1" />
                Migrate from localStorage
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none text-sm focus:border-indigo-500"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              showPinnedOnly ? 'text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            style={showPinnedOnly ? { backgroundColor: '#6366f1' } : {}}
          >
            <Star size={16} className="inline mr-1" />
            Pinned
          </button>
        </div>
      </div>

      {/* Links Grid/List */}
      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#0f0d15' }}>
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading links...</div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No links found. Click "Add Link" to create one.
          </div>
        ) : viewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map(link => (
              <div
                key={link.id}
                className="bg-gray-900 border rounded-lg p-4 hover:border-indigo-500 transition-colors"
                style={{ borderColor: '#374151' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 flex items-center">
                      <ExternalLink size={14} className="mr-2" style={{ color: '#6366f1' }} />
                      {link.title}
                    </h3>
                    <a
                      href={link.url}
                      onClick={(e) => {
                        e.preventDefault()
                        link.id && handleLinkClick(link.id, link.url)
                      }}
                      className="text-xs text-indigo-400 hover:underline block truncate"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    onClick={() => togglePin(link)}
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    {link.isPinned ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                  </button>
                </div>

                {link.description && (
                  <p className="text-sm text-gray-400 mb-2">{link.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="px-2 py-0.5 bg-gray-800 rounded" style={{ color: '#6366f1' }}>
                    {link.category}
                  </span>
                  {link.clickCount && link.clickCount > 0 && (
                    <span className="text-gray-500">
                      {link.clickCount} {link.clickCount === 1 ? 'click' : 'clicks'}
                    </span>
                  )}
                </div>

                {link.tags && link.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {link.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                        <Tag size={10} className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(link)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    <Edit2 size={12} className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => link.id && handleDelete(link.id)}
                    className="flex-1 px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredLinks.map(link => (
              <div
                key={link.id}
                className="bg-gray-900 border rounded-lg p-4 hover:border-indigo-500 transition-colors flex items-center justify-between"
                style={{ borderColor: '#374151' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white flex items-center">
                      <ExternalLink size={14} className="mr-2" style={{ color: '#6366f1' }} />
                      {link.title}
                    </h3>
                    <button
                      onClick={() => togglePin(link)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {link.isPinned ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs" style={{ color: '#6366f1' }}>
                      {link.category}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    onClick={(e) => {
                      e.preventDefault()
                      link.id && handleLinkClick(link.id, link.url)
                    }}
                    className="text-xs text-indigo-400 hover:underline block truncate mb-2"
                  >
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-sm text-gray-400 mb-2">{link.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    {link.clickCount && link.clickCount > 0 && (
                      <span className="text-gray-500">
                        {link.clickCount} {link.clickCount === 1 ? 'click' : 'clicks'}
                      </span>
                    )}
                    {link.tags && link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {link.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                            <Tag size={10} className="inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(link)}
                    className="px-3 py-1.5 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    <Edit2 size={12} className="inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => link.id && handleDelete(link.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#6366f1' }}>
              <Link className="mr-2" size={20} />
              {editingLink ? 'Edit Link' : 'Add New Link'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none"
                  required
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPinned" className="text-sm">Pin this link</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={syncing}
                  className="flex-1 px-4 py-2 text-white rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#6366f1' }}
                >
                  {syncing ? 'Saving...' : (editingLink ? 'Update Link' : 'Create Link')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingLink(null)
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
