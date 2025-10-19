'use client'

import { useState, useEffect } from 'react'
import {
  createPowerShellScript,
  getPowerShellScripts,
  updatePowerShellScript,
  deletePowerShellScript,
  createSOP,
  getSOPs,
  updateSOP,
  deleteSOP,
  getCurrentUser,
  handleSessionError,
  PowerShellScript,
  SOP,
  SOPStep
} from '@/lib/back4appService'
import AuthModal from '../auth/AuthModal'
import {
  Terminal,
  FileText,
  Search,
  Copy,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronRight,
  Lock,
  Unlock,
  Pin,
  Code,
  BookOpen,
  Shield,
  RefreshCw,
  Download,
  Upload,
  Menu
} from 'lucide-react'

export default function PowerShellHub() {
  const [activeTab, setActiveTab] = useState<'scripts' | 'sops' | 'admin'>('scripts')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Scripts state
  const [scripts, setScripts] = useState<PowerShellScript[]>([])
  const [filteredScripts, setFilteredScripts] = useState<PowerShellScript[]>([])
  const [scriptSearchTerm, setScriptSearchTerm] = useState('')
  const [scriptCategory, setScriptCategory] = useState<string>('all')
  const [scriptSortOrder, setScriptSortOrder] = useState<'desc' | 'asc'>('desc')
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [editingScript, setEditingScript] = useState<PowerShellScript | null>(null)

  // SOPs state
  const [sops, setSOPs] = useState<SOP[]>([])
  const [filteredSOPs, setFilteredSOPs] = useState<SOP[]>([])
  const [sopSearchTerm, setSOPSearchTerm] = useState('')
  const [sopCategory, setSOPCategory] = useState<string>('all')
  const [sopSortOrder, setSOPSortOrder] = useState<'desc' | 'asc'>('desc')
  const [showSOPModal, setShowSOPModal] = useState(false)
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null)
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null)

  // Form state for Scripts
  const [scriptForm, setScriptForm] = useState({
    title: '',
    code: '',
    description: '',
    category: 'basics' as PowerShellScript['category'],
    tags: '',
    isPinned: false,
    isPublic: false
  })

  // Form state for SOPs
  const [sopForm, setSOPForm] = useState({
    title: '',
    content: '',
    category: 'incident' as SOP['category'],
    tags: '',
    isPinned: false,
    isPublic: false,
    steps: [] as SOPStep[]
  })

  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    command: '',
    notes: ''
  })

  // Load user and data
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
      const [fetchedScripts, fetchedSOPs] = await Promise.all([
        getPowerShellScripts(),
        getSOPs()
      ])

      setScripts(fetchedScripts)
      setSOPs(fetchedSOPs)
      setFilteredScripts(fetchedScripts)
      setFilteredSOPs(fetchedSOPs)
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

  // Filter scripts
  useEffect(() => {
    let filtered = scripts

    if (scriptCategory !== 'all') {
      filtered = filtered.filter(s => s.category === scriptCategory)
    }

    if (scriptSearchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(scriptSearchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(scriptSearchTerm.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(scriptSearchTerm.toLowerCase()))
      )
    }

    // Sort by created date
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return scriptSortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    setFilteredScripts(filtered)
  }, [scripts, scriptSearchTerm, scriptCategory, scriptSortOrder])

  // Filter SOPs
  useEffect(() => {
    let filtered = sops

    if (sopCategory !== 'all') {
      filtered = filtered.filter(s => s.category === sopCategory)
    }

    if (sopSearchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(sopSearchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(sopSearchTerm.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(sopSearchTerm.toLowerCase()))
      )
    }

    // Sort by created date
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sopSortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    setFilteredSOPs(filtered)
  }, [sops, sopSearchTerm, sopCategory, sopSortOrder])

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  // Handle script CRUD
  const handleSaveScript = async () => {
    if (!scriptForm.title.trim() || !scriptForm.code.trim()) {
      alert('Title and code are required')
      return
    }

    try {
      setSyncing(true)
      const scriptData: PowerShellScript = {
        title: scriptForm.title,
        code: scriptForm.code,
        description: scriptForm.description,
        category: scriptForm.category,
        tags: scriptForm.tags.split(',').map(t => t.trim()).filter(t => t),
        isPinned: scriptForm.isPinned,
        isPublic: scriptForm.isPublic,
        copyCount: 0
      }

      if (editingScript && editingScript.id) {
        const updated = await updatePowerShellScript(editingScript.id, scriptData)
        setScripts(scripts.map(s => s.id === updated.id ? updated : s))
      } else {
        const newScript = await createPowerShellScript(scriptData)
        setScripts([newScript, ...scripts])
      }

      resetScriptForm()
      setShowScriptModal(false)
    } catch (error: any) {
      console.error('Error saving script:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to save script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return

    try {
      setSyncing(true)
      await deletePowerShellScript(id)
      setScripts(scripts.filter(s => s.id !== id))
    } catch (error: any) {
      console.error('Error deleting script:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to delete script: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const resetScriptForm = () => {
    setScriptForm({
      title: '',
      code: '',
      description: '',
      category: 'basics',
      tags: '',
      isPinned: false,
      isPublic: false
    })
    setEditingScript(null)
  }

  // Handle SOP CRUD
  const handleSaveSOP = async () => {
    if (!sopForm.title.trim() || !sopForm.content.trim()) {
      alert('Title and content are required')
      return
    }

    try {
      setSyncing(true)
      const sopData: SOP = {
        title: sopForm.title,
        content: sopForm.content,
        category: sopForm.category,
        tags: sopForm.tags.split(',').map(t => t.trim()).filter(t => t),
        steps: sopForm.steps,
        isPinned: sopForm.isPinned,
        isPublic: sopForm.isPublic,
        viewCount: 0
      }

      if (editingSOP && editingSOP.id) {
        const updated = await updateSOP(editingSOP.id, sopData)
        setSOPs(sops.map(s => s.id === updated.id ? updated : s))
      } else {
        const newSOP = await createSOP(sopData)
        setSOPs([newSOP, ...sops])
      }

      resetSOPForm()
      setShowSOPModal(false)
    } catch (error: any) {
      console.error('Error saving SOP:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to save SOP: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteSOP = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SOP?')) return

    try {
      setSyncing(true)
      await deleteSOP(id)
      setSOPs(sops.filter(s => s.id !== id))
      if (selectedSOP?.id === id) setSelectedSOP(null)
    } catch (error: any) {
      console.error('Error deleting SOP:', error)
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        setCurrentUser(null)
        alert('Your session has expired. Please log in again.')
        return
      }
      alert(`Failed to delete SOP: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const resetSOPForm = () => {
    setSOPForm({
      title: '',
      content: '',
      category: 'incident',
      tags: '',
      isPinned: false,
      isPublic: false,
      steps: []
    })
    setEditingSOP(null)
  }

  const addStepToSOP = () => {
    if (!newStep.title.trim()) {
      alert('Step title is required')
      return
    }

    const step: SOPStep = {
      order: sopForm.steps.length + 1,
      title: newStep.title,
      description: newStep.description,
      command: newStep.command,
      notes: newStep.notes
    }

    setSOPForm({
      ...sopForm,
      steps: [...sopForm.steps, step]
    })

    setNewStep({ title: '', description: '', command: '', notes: '' })
  }

  const removeStepFromSOP = (index: number) => {
    setSOPForm({
      ...sopForm,
      steps: sopForm.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }))
    })
  }

  if (!currentUser) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative" style={{ backgroundColor: 'rgb(26, 26, 46)', minHeight: '100vh' }}>
          {/* Cyber Grid Background */}
          <div
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0, 246, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 246, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              zIndex: 0
            }}
          />

          <div className="text-center relative z-10">
            <Terminal className="w-16 h-16 mx-auto mb-6" style={{ color: 'rgb(0, 246, 255)' }} />
            <h2 className="text-3xl font-bold mb-4">
              <span style={{ color: 'rgb(0, 246, 255)' }}>PowerShell</span>
              <span style={{ color: 'rgb(123, 44, 191)' }}>Hub</span>
            </h2>
            <p className="text-gray-300 mb-6">Your AI-powered companion for PowerShell commands and SOPs</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 rounded-lg hover:opacity-80 transition-opacity font-medium"
              style={{ backgroundColor: 'rgb(0, 246, 255)', color: 'rgb(26, 26, 46)' }}
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
    <div className="flex-1 flex flex-col relative" style={{ backgroundColor: 'rgb(26, 26, 46)', minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border transition-all"
        style={{
          backgroundColor: isSidebarOpen ? 'rgb(0, 246, 255)' : 'rgb(31, 41, 55)',
          borderColor: 'rgb(0, 246, 255)'
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

      {/* Cyber Grid Background */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(0, 246, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 246, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          zIndex: 0
        }}
      />

      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b p-6 backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          borderColor: 'rgb(0, 246, 255)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <Terminal className="w-8 h-8" style={{ color: 'rgb(0, 246, 255)' }} />
              <span style={{ color: 'rgb(0, 246, 255)' }}>PowerShell</span>
              <span style={{ color: 'rgb(123, 44, 191)' }}>Hub</span>
            </h1>
            <p className="text-gray-300">Your AI-powered companion for PowerShell commands and SOPs. Search, copy, and customize snippets with ease.</p>
          </div>

          <div className="flex items-center gap-3">
            {syncing && (
              <span className="text-sm animate-pulse" style={{ color: 'rgb(0, 246, 255)' }}>
                <RefreshCw size={16} className="inline animate-spin" /> Syncing...
              </span>
            )}
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgb(0, 246, 255)', color: 'rgb(26, 26, 46)' }}
            >
              <RefreshCw size={16} className="inline mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs - Mobile Sidebar / Desktop Horizontal */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 lg:w-auto lg:flex lg:gap-6 lg:mt-4
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:bg-transparent rounded-r-lg lg:rounded-none
            p-4 lg:p-0
          `}
          style={{
            backgroundColor: isSidebarOpen ? 'rgba(26, 26, 46, 0.98)' : 'transparent',
            borderRight: isSidebarOpen ? '1px solid rgb(0, 246, 255)' : 'none'
          }}
        >
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 mt-16 lg:mt-0">
            {[
              { id: 'scripts', label: 'PowerShell Scripts', icon: Code },
              { id: 'sops', label: 'Standard Procedures', icon: BookOpen },
              { id: 'admin', label: 'Admin Panel', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setIsSidebarOpen(false)
                }}
                className={`px-4 py-2 font-medium transition-colors rounded-lg lg:rounded-none text-left ${
                  activeTab === tab.id ? '' : 'text-gray-400 hover:text-gray-300'
                }`}
                style={activeTab === tab.id ? {
                  color: 'rgb(0, 246, 255)',
                  backgroundColor: isSidebarOpen ? 'rgba(0, 246, 255, 0.1)' : 'transparent'
                } : {}}
              >
                <tab.icon size={18} className="inline mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
            <p>Loading...</p>
          </div>
        ) : activeTab === 'scripts' ? (
          // SCRIPTS TAB
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: 'rgb(0, 246, 255)' }}
                />
                <input
                  type="text"
                  value={scriptSearchTerm}
                  onChange={(e) => setScriptSearchTerm(e.target.value)}
                  placeholder="Search commands..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'rgb(0, 246, 255)',
                    '--tw-ring-color': 'rgb(123, 44, 191)'
                  } as any}
                />
              </div>
              <select
                value={scriptCategory}
                onChange={(e) => setScriptCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border bg-gray-800 text-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(55, 65, 81)',
                  '--tw-ring-color': 'rgb(123, 44, 191)'
                } as any}
              >
                <option value="all">All Categories</option>
                <option value="basics">PowerShell Basics</option>
                <option value="automation">Automation Scripts</option>
                <option value="advanced">Advanced</option>
                <option value="networking">Networking</option>
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
              <select
                value={scriptSortOrder}
                onChange={(e) => setScriptSortOrder(e.target.value as 'desc' | 'asc')}
                className="px-4 py-2 rounded-lg border bg-gray-800 text-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(55, 65, 81)',
                  '--tw-ring-color': 'rgb(123, 44, 191)'
                } as any}
              >
                <option value="desc">📅 Newest First</option>
                <option value="asc">📅 Oldest First</option>
              </select>
            </div>

            {/* Scripts Grid - Category Cards Style */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScripts.map(script => (
                <div
                  key={script.id}
                  className="rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                  style={{
                    borderColor: 'rgb(0, 246, 255)',
                    backgroundColor: 'rgba(31, 41, 55, 0.5)',
                    maxHeight: '350px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(123, 44, 191)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(0, 246, 255)'}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2 break-words" style={{ color: 'rgb(0, 246, 255)' }}>
                      {script.title}
                      {script.isPinned && <Pin size={14} className="text-yellow-400" fill="currentColor" />}
                    </h3>
                  </div>

                  <p className="text-gray-300 mb-3 text-sm line-clamp-2 break-words">{script.description}</p>

                  {/* Code Block */}
                  <div className="relative rounded-lg bg-gray-900 p-3 mb-2">
                    <button
                      onClick={() => copyToClipboard(script.code, 'Script')}
                      className="absolute top-2 right-2 px-2 py-1 text-xs rounded transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgb(0, 246, 255)', color: 'rgb(26, 26, 46)' }}
                    >
                      Copy
                    </button>
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words pr-16 max-h-24 overflow-y-auto">
                      {script.code}
                    </pre>
                  </div>

                  <div className="flex gap-2 flex-wrap text-xs">
                    <span
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: 'rgba(0, 246, 255, 0.2)', color: 'rgb(0, 246, 255)' }}
                    >
                      {script.category}
                    </span>
                    {script.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredScripts.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No scripts found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'sops' ? (
          // SOPs TAB
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={sopSearchTerm}
                  onChange={(e) => setSOPSearchTerm(e.target.value)}
                  placeholder="Search SOPs..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={sopCategory}
                onChange={(e) => setSOPCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="incident">Incident Response</option>
                <option value="maintenance">Maintenance</option>
                <option value="deployment">Deployment</option>
                <option value="security">Security</option>
                <option value="monitoring">Monitoring</option>
                <option value="backup">Backup & Recovery</option>
                <option value="other">Other</option>
              </select>
              <select
                value={sopSortOrder}
                onChange={(e) => setSOPSortOrder(e.target.value as 'desc' | 'asc')}
                className="px-4 py-2 rounded-lg border bg-gray-800 text-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'rgb(55, 65, 81)',
                  '--tw-ring-color': 'rgb(123, 44, 191)'
                } as any}
              >
                <option value="desc">📅 Newest First</option>
                <option value="asc">📅 Oldest First</option>
              </select>
            </div>

            {/* SOPs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSOPs.map(sop => (
                <div
                  key={sop.id}
                  className="rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer"
                  style={{
                    borderColor: 'rgb(123, 44, 191)',
                    backgroundColor: 'rgba(31, 41, 55, 0.5)',
                    maxHeight: '350px'
                  }}
                  onClick={() => setSelectedSOP(sop)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(0, 246, 255)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgb(123, 44, 191)'}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center gap-2 break-words" style={{ color: 'rgb(123, 44, 191)' }}>
                        {sop.title}
                        {sop.isPinned && <Pin size={14} className="text-yellow-400" fill="currentColor" />}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 break-words mt-1">{sop.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-3">
                    <span
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: 'rgba(123, 44, 191, 0.2)', color: 'rgb(123, 44, 191)' }}
                    >
                      {sop.category}
                    </span>
                    <span className="text-gray-400">{sop.steps.length} steps</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSOP(sop)
                      }}
                      className="flex-1 px-3 py-1 text-white rounded text-sm transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgb(123, 44, 191)' }}
                    >
                      View Steps <ChevronRight size={14} className="inline ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSOPs.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No SOPs found</p>
              </div>
            )}
          </div>
        ) : (
          // ADMIN TAB
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#00aaff' }}>
                <Shield size={20} />
                Admin Panel
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 p-4 rounded">
                  <div className="text-2xl font-bold mb-2" style={{ color: '#00aaff' }}>{scripts.length}</div>
                  <div className="text-sm text-gray-400">Total Scripts</div>
                </div>
                <div className="bg-black/50 p-4 rounded">
                  <div className="text-2xl font-bold mb-2" style={{ color: '#00aaff' }}>{sops.length}</div>
                  <div className="text-sm text-gray-400">Total SOPs</div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    resetScriptForm()
                    setShowScriptModal(true)
                  }}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add New Script
                </button>

                <button
                  onClick={() => {
                    resetSOPForm()
                    setShowSOPModal(true)
                  }}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add New SOP
                </button>
              </div>

              <div className="mt-6 border-t border-gray-700 pt-6">
                <h4 className="font-semibold mb-3">Manage Scripts</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scripts.map(script => (
                    <div key={script.id} className="flex items-center justify-between p-3 bg-black/50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-white">{script.title}</div>
                        <div className="text-xs text-gray-500">{script.category}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingScript(script)
                            setScriptForm({
                              title: script.title,
                              code: script.code,
                              description: script.description,
                              category: script.category,
                              tags: script.tags.join(', '),
                              isPinned: script.isPinned,
                              isPublic: script.isPublic
                            })
                            setShowScriptModal(true)
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => script.id && handleDeleteScript(script.id)}
                          className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-700 pt-6">
                <h4 className="font-semibold mb-3">Manage SOPs</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sops.map(sop => (
                    <div key={sop.id} className="flex items-center justify-between p-3 bg-black/50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-white">{sop.title}</div>
                        <div className="text-xs text-gray-500">{sop.category} - {sop.steps.length} steps</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSOP(sop)
                            setSOPForm({
                              title: sop.title,
                              content: sop.content,
                              category: sop.category,
                              tags: sop.tags.join(', '),
                              isPinned: sop.isPinned,
                              isPublic: sop.isPublic,
                              steps: sop.steps
                            })
                            setShowSOPModal(true)
                          }}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => sop.id && handleDeleteSOP(sop.id)}
                          className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#00aaff' }}>
              <Code size={20} />
              {editingScript ? 'Edit Script' : 'New Script'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={scriptForm.title}
                  onChange={(e) => setScriptForm({ ...scriptForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-blue-500"
                  placeholder="Script title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={scriptForm.description}
                  onChange={(e) => setScriptForm({ ...scriptForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-blue-500"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PowerShell Code *</label>
                <textarea
                  value={scriptForm.code}
                  onChange={(e) => setScriptForm({ ...scriptForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-black text-green-400 rounded border border-gray-700 outline-none focus:border-blue-500 font-mono text-sm"
                  rows={8}
                  placeholder="Get-Process | Sort-Object CPU -Descending | Select-Object -First 10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={scriptForm.category}
                    onChange={(e) => setScriptForm({ ...scriptForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-blue-500"
                  >
                    <option value="basics">Basics</option>
                    <option value="automation">Automation</option>
                    <option value="advanced">Advanced</option>
                    <option value="networking">Networking</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={scriptForm.tags}
                    onChange={(e) => setScriptForm({ ...scriptForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-blue-500"
                    placeholder="process, cpu, monitoring"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scriptForm.isPinned}
                    onChange={(e) => setScriptForm({ ...scriptForm, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pin this script</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scriptForm.isPublic}
                    onChange={(e) => setScriptForm({ ...scriptForm, isPublic: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Make public</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveScript}
                disabled={syncing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
              >
                <Save size={16} className="inline mr-1" />
                {syncing ? 'Saving...' : 'Save Script'}
              </button>
              <button
                onClick={() => {
                  setShowScriptModal(false)
                  resetScriptForm()
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                <X size={16} className="inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP Modal */}
      {showSOPModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#00aaff' }}>
              <BookOpen size={20} />
              {editingSOP ? 'Edit SOP' : 'New SOP'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={sopForm.title}
                  onChange={(e) => setSOPForm({ ...sopForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-purple-500"
                  placeholder="SOP title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea
                  value={sopForm.content}
                  onChange={(e) => setSOPForm({ ...sopForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-purple-500"
                  rows={4}
                  placeholder="Detailed description and overview of this SOP"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={sopForm.category}
                    onChange={(e) => setSOPForm({ ...sopForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-purple-500"
                  >
                    <option value="incident">Incident Response</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="deployment">Deployment</option>
                    <option value="security">Security</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="backup">Backup & Recovery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={sopForm.tags}
                    onChange={(e) => setSOPForm({ ...sopForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 outline-none focus:border-purple-500"
                    placeholder="incident, server, recovery"
                  />
                </div>
              </div>

              {/* Steps Section */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-semibold mb-3">Procedure Steps</h4>

                {/* Existing Steps */}
                {sopForm.steps.map((step, index) => (
                  <div key={index} className="bg-black/50 p-3 rounded mb-2 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-sm">Step {step.order}: {step.title}</span>
                      <button
                        onClick={() => removeStepFromSOP(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{step.description}</p>
                    {step.command && (
                      <pre className="text-xs bg-black p-2 rounded text-green-400 font-mono mt-2">{step.command}</pre>
                    )}
                    {step.notes && (
                      <p className="text-xs text-gray-500 italic mt-1">Note: {step.notes}</p>
                    )}
                  </div>
                ))}

                {/* Add New Step */}
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={newStep.title}
                      onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                      className="px-2 py-1 bg-black text-white rounded text-sm border border-gray-600"
                      placeholder="Step title"
                    />
                    <input
                      type="text"
                      value={newStep.description}
                      onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                      className="px-2 py-1 bg-black text-white rounded text-sm border border-gray-600"
                      placeholder="Step description"
                    />
                  </div>
                  <input
                    type="text"
                    value={newStep.command}
                    onChange={(e) => setNewStep({ ...newStep, command: e.target.value })}
                    className="w-full px-2 py-1 bg-black text-green-400 rounded text-sm mb-2 border border-gray-600 font-mono"
                    placeholder="PowerShell command (optional)"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStep.notes}
                      onChange={(e) => setNewStep({ ...newStep, notes: e.target.value })}
                      className="flex-1 px-2 py-1 bg-black text-white rounded text-sm border border-gray-600"
                      placeholder="Additional notes (optional)"
                    />
                    <button
                      onClick={addStepToSOP}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                    >
                      <Plus size={14} className="inline" /> Add Step
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sopForm.isPinned}
                    onChange={(e) => setSOPForm({ ...sopForm, isPinned: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pin this SOP</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sopForm.isPublic}
                    onChange={(e) => setSOPForm({ ...sopForm, isPublic: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Make public</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSOP}
                disabled={syncing}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
              >
                <Save size={16} className="inline mr-1" />
                {syncing ? 'Saving...' : 'Save SOP'}
              </button>
              <button
                onClick={() => {
                  setShowSOPModal(false)
                  resetSOPForm()
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
              >
                <X size={16} className="inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP Detail View Modal */}
      {selectedSOP && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#00aaff' }}>
                <BookOpen size={20} />
                {selectedSOP.title}
              </h3>
              <button
                onClick={() => setSelectedSOP(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">{selectedSOP.category}</span>
              <div className="flex gap-2 mt-2">
                {selectedSOP.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300">{selectedSOP.content}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Procedure Steps:</h4>
              {selectedSOP.steps.map((step, index) => (
                <div key={index} className="bg-black/50 p-4 rounded border-l-4 border-purple-500">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold mb-2">{step.title}</h5>
                      <p className="text-sm text-gray-400 mb-2">{step.description}</p>
                      {step.command && (
                        <div className="bg-black p-3 rounded mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Command:</span>
                            <button
                              onClick={() => copyToClipboard(step.command!, 'Command')}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              <Copy size={12} className="inline mr-1" />
                              Copy
                            </button>
                          </div>
                          <pre className="text-sm text-green-400 font-mono">{step.command}</pre>
                        </div>
                      )}
                      {step.notes && (
                        <p className="text-xs text-gray-500 italic bg-gray-800 p-2 rounded">
                          <strong>Note:</strong> {step.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedSOP(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
