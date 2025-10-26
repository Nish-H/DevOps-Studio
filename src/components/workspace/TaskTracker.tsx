'use client'

import { useState, useEffect } from 'react'
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  handleSessionError,
  Task
} from '@/lib/back4appService'
import { useBack4AppAuth } from '@/contexts/Back4AppAuthContext'
import { RefreshCw, CloudOff, List, LayoutGrid } from 'lucide-react'

export default function TaskTracker() {
  const { currentUser, loading: authLoading, error: authError } = useBack4AppAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('compact')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showImportExport, setShowImportExport] = useState(false)

  // Predefined categories matching Notes module
  const PREDEFINED_CATEGORIES = [
    { name: 'Work', color: '#ff073a' },
    { name: 'Personal', color: '#00CC33' },
    { name: 'Project', color: '#8B9499' },
    { name: 'Ideas', color: '#0ea5e9' },
    { name: 'Documentation', color: '#cc5500' }
  ]

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'on-hold',
    category: 'Work',
    dueDate: '',
    timerMinutes: 0
  })

  // Load tasks when user is authenticated
  useEffect(() => {
    if (currentUser && !authLoading) {
      loadTasks()
    } else if (!authLoading) {
      setLoading(false)
    }

    // Load view mode preference
    const savedViewMode = localStorage.getItem('devops-studio-tasks-viewmode')
    if (savedViewMode === 'list' || savedViewMode === 'compact') {
      setViewMode(savedViewMode)
    }
  }, [currentUser, authLoading])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    } catch (error: any) {
      console.error('Error loading tasks:', error)
      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to load tasks: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return
    }

    try {
      setSyncing(true)

      const taskData: Task = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        timerMinutes: formData.timerMinutes
      }

      if (editingTask && editingTask.id) {
        // Update existing task
        const updated = await updateTask(editingTask.id, taskData)
        setTasks(tasks.map(t => t.id === updated.id ? updated : t))
      } else {
        // Create new task
        const newTask = await createTask(taskData)
        setTasks([newTask, ...tasks])
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category: 'Work',
        dueDate: '',
        timerMinutes: 0
      })
      setShowAddModal(false)
      setEditingTask(null)
    } catch (error: any) {
      console.error('Error saving task:', error)
      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to save task: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      setSyncing(true)
      await deleteTask(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error: any) {
      console.error('Error deleting task:', error)
      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to delete task: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category || 'Work',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      timerMinutes: task.timerMinutes || 0
    })
    setShowAddModal(true)
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      setSyncing(true)
      const updated = await updateTask(taskId, { status: newStatus })
      setTasks(tasks.map(t => t.id === updated.id ? updated : t))
    } catch (error: any) {
      console.error('Error updating status:', error)
      // Handle session errors
      const wasSessionError = await handleSessionError(error)
      if (wasSessionError) {
        alert('Your session has expired. Please refresh the page to re-authenticate.')
        return
      }
      alert(`Failed to update status: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const exportTasks = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks: tasks
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTasks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.tasks || !Array.isArray(data.tasks)) {
        alert('Invalid import file format')
        return
      }

      setSyncing(true)
      let imported = 0

      // Import tasks one by one
      for (const task of data.tasks) {
        await createTask({
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          category: task.category || 'Work',
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          timerMinutes: task.timerMinutes || 0
        })
        imported++
      }

      await loadTasks()
      alert(`Successfully imported ${imported} tasks!`)
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

  const getFilteredTasks = () => {
    let filtered = tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (filterCategory !== 'all' && task.category !== filterCategory) return false
      return true
    })

    // Sort by created date
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444' // red-500
      case 'medium': return '#eab308' // yellow-500
      case 'low': return '#22c55e' // green-500
      default: return '#9ca3af' // gray-400
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'in-progress': return 'bg-green-500/20 text-green-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'on-hold': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    const cat = PREDEFINED_CATEGORIES.find(c => c.name === category)
    return cat ? cat.color : '#6b7280' // Default gray if not found
  }

  const toggleViewMode = (mode: 'list' | 'compact') => {
    setViewMode(mode)
    localStorage.setItem('devops-studio-tasks-viewmode', mode)
  }

  const categories = Array.from(new Set(tasks.map(t => t.category || 'Work')))

  const filteredTasks = getFilteredTasks()

  // Show loading or error state
  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-600 animate-spin" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary-accent)' }}>
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
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center">
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
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">Task Tracker</h2>
            <p className="text-sm text-gray-400">
              Manage your tasks with cloud sync • {filteredTasks.length} tasks
            </p>
          </div>
          <div className="flex items-center gap-3">
            {syncing && (
              <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>
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
              📥 Import/Export
            </button>
            <button
              onClick={() => {
                setEditingTask(null)
                setFormData({
                  title: '',
                  description: '',
                  priority: 'medium',
                  status: 'pending',
                  category: 'Work',
                  dueDate: '',
                  timerMinutes: 0
                })
                setShowAddModal(true)
              }}
              className="px-4 py-2 bg-[var(--primary-accent)] text-white rounded hover:opacity-80 transition-opacity"
            >
              + Add Task
            </button>
            <button
              onClick={loadTasks}
              className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Import/Export Menu */}
        {showImportExport && (
          <div className="mt-3 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3 text-white">Import/Export Tasks</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportTasks}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                📤 Export to JSON
              </button>
              <label className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm cursor-pointer">
                📥 Import from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={importTasks}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 w-full mt-2">
                💡 Import your JSON backup file to restore tasks to the cloud
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">InProgress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">OnHold</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="all">All Categories</option>
            {PREDEFINED_CATEGORIES.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className="px-3 py-1.5 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="desc">📅 Newest First</option>
            <option value="asc">📅 Oldest First</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No tasks found. Click "Add Task" to create one.
          </div>
        ) : viewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Compact Grid View */}
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-900 border-2 rounded-lg p-4 hover:shadow-lg transition-all"
                style={{ borderColor: getPriorityColor(task.priority) }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                  <span className="font-semibold" style={{ color: getPriorityColor(task.priority) }}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                    {task.status === 'in-progress' ? 'InProgress' : task.status === 'on-hold' ? 'OnHold' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                  {task.category && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${getCategoryColor(task.category)}20`,
                        color: getCategoryColor(task.category)
                      }}
                    >
                      {task.category}
                    </span>
                  )}
                </div>

                {(task.dueDate || (task.timerMinutes !== undefined && task.timerMinutes > 0)) && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {task.dueDate && (
                      <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.timerMinutes !== undefined && task.timerMinutes > 0 && (
                      <span>⏱️ {task.timerMinutes}m</span>
                    )}
                  </div>
                )}

                {/* Quick Status Change */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' },
                    { value: 'in-progress', label: 'InProgress', color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30' },
                    { value: 'completed', label: 'Completed', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
                    { value: 'on-hold', label: 'OnHold', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => task.id && handleStatusChange(task.id, status.value as Task['status'])}
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === status.value
                          ? status.color
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                      title={status.label}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => task.id && handleDelete(task.id)}
                    className="flex-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View (Detailed)
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-900 border-l-4 rounded-lg p-4 hover:shadow-lg transition-all flex items-center justify-between"
                style={{ borderLeftColor: getPriorityColor(task.priority) }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold" style={{ color: getPriorityColor(task.priority) }}>
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'InProgress' : task.status === 'on-hold' ? 'OnHold' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    {task.category && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(task.category)}20`,
                          color: getCategoryColor(task.category)
                        }}
                      >
                        {task.category}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.timerMinutes !== undefined && task.timerMinutes > 0 && (
                      <span className="text-xs text-gray-500">⏱️ {task.timerMinutes}m</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {/* Quick Status Change */}
                  <div className="flex gap-1">
                    {[
                      { value: 'pending', label: 'P', color: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' },
                      { value: 'in-progress', label: 'IP', color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30' },
                      { value: 'completed', label: 'C', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' },
                      { value: 'on-hold', label: 'H', color: 'bg-red-500/20 text-red-400 hover:bg-red-500/30' }
                    ].map(status => (
                      <button
                        key={status.value}
                        onClick={() => task.id && handleStatusChange(task.id, status.value as Task['status'])}
                        className={`px-2 py-1 text-xs rounded ${
                          task.status === status.value
                            ? status.color
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                        title={status.label}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => task.id && handleDelete(task.id)}
                      className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">InProgress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">OnHold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                >
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Timer (minutes)</label>
                  <input
                    type="number"
                    value={formData.timerMinutes}
                    onChange={(e) => setFormData({ ...formData, timerMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={syncing}
                  className="flex-1 px-4 py-2 bg-[var(--primary-accent)] text-white rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {syncing ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingTask(null)
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
