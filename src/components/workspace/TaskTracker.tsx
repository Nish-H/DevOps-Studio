'use client'

import { useState, useEffect } from 'react'
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getCurrentUser,
  Task
} from '@/lib/back4appService'
import AuthModal from '../auth/AuthModal'

export default function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'overdue',
    category: 'General',
    dueDate: '',
    timerMinutes: 0
  })

  // Load user and tasks on mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      loadTasks()
    } else {
      setLoading(false)
    }
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
    } catch (error: any) {
      console.error('Error loading tasks:', error)
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
        category: 'General',
        dueDate: '',
        timerMinutes: 0
      })
      setShowAddModal(false)
      setEditingTask(null)
    } catch (error: any) {
      console.error('Error saving task:', error)
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
      category: task.category || 'General',
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
      alert(`Failed to update status: ${error.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (filterCategory !== 'all' && task.category !== filterCategory) return false
      return true
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'in-progress': return 'bg-blue-500/20 text-blue-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const categories = Array.from(new Set(tasks.map(t => t.category || 'General')))

  const filteredTasks = getFilteredTasks()

  if (!currentUser) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-4">Task Tracker</h2>
            <p className="text-gray-400 mb-6">Manage your tasks with cloud sync across all devices</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-[var(--primary-accent)] text-white rounded-lg hover:opacity-80 transition-opacity font-medium"
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
              loadTasks()
            }}
          />
        )}
      </>
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
            <button
              onClick={() => {
                setEditingTask(null)
                setFormData({
                  title: '',
                  description: '',
                  priority: 'medium',
                  status: 'pending',
                  category: 'General',
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

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 text-white rounded border border-gray-700 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
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
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => task.id && handleDelete(task.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.category && (
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                      {task.category}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-gray-500 text-xs">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.timerMinutes !== undefined && task.timerMinutes > 0 && (
                    <span className="text-gray-500 text-xs">⏱️ {task.timerMinutes}m</span>
                  )}
                </div>

                {/* Quick Status Change */}
                <div className="flex gap-2 mt-3">
                  {['pending', 'in-progress', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => task.id && handleStatusChange(task.id, status as Task['status'])}
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === status
                          ? 'bg-[var(--primary-accent)] text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
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
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-[var(--primary-accent)] outline-none"
                />
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
