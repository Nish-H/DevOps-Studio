/**
 * Back4App Cloud Sync Service
 * Handles all Parse/Back4App operations for cloud data sync
 */

import Parse from 'parse'

// Initialize Parse
const initializeParse = () => {
  if (typeof window !== 'undefined' && !Parse.applicationId) {
    Parse.initialize(
      process.env.NEXT_PUBLIC_BACK4APP_APP_ID!,
      process.env.NEXT_PUBLIC_BACK4APP_JAVASCRIPT_KEY!
    )
    Parse.serverURL = process.env.NEXT_PUBLIC_BACK4APP_SERVER_URL!
    console.log('✅ Back4App initialized')
  }
}

// Call initialization
initializeParse()

// ==================== USER AUTHENTICATION ====================

export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
}

/**
 * Register a new user
 */
export async function registerUser(username: string, email: string, password: string): Promise<User> {
  try {
    const user = new Parse.User()
    user.set('username', username)
    user.set('email', email)
    user.set('password', password)

    const result = await user.signUp()
    return {
      id: result.id || '',
      username: result.get('username'),
      email: result.get('email'),
      createdAt: result.createdAt || new Date()
    }
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`)
  }
}

/**
 * Login user
 */
export async function loginUser(username: string, password: string): Promise<User> {
  try {
    const user = await Parse.User.logIn(username, password)
    return {
      id: user.id || '',
      username: user.get('username'),
      email: user.get('email'),
      createdAt: user.createdAt || new Date()
    }
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  await Parse.User.logOut()
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const user = Parse.User.current()
  if (!user) return null

  return {
    id: user.id || '',
    username: user.get('username'),
    email: user.get('email'),
    createdAt: user.createdAt || new Date()
  }
}

// ==================== TASKS ====================

export interface Task {
  id?: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  dueDate?: Date
  category?: string
  timerMinutes?: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new task
 */
export async function createTask(task: Task): Promise<Task> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const TaskClass = Parse.Object.extend('Task')
  const newTask = new TaskClass()

  newTask.set('title', task.title)
  newTask.set('description', task.description || '')
  newTask.set('priority', task.priority)
  newTask.set('status', task.status)
  newTask.set('dueDate', task.dueDate)
  newTask.set('category', task.category || 'General')
  newTask.set('timerMinutes', task.timerMinutes || 0)
  newTask.set('userId', user.id || '')

  const result = await newTask.save()

  return parseTaskObject(result)
}

/**
 * Get all tasks for current user
 */
export async function getTasks(): Promise<Task[]> {
  const user = Parse.User.current()
  if (!user) return []

  const TaskClass = Parse.Object.extend('Task')
  const query = new Parse.Query(TaskClass)
  query.equalTo('userId', user.id || '')
  query.descending('createdAt')

  const results = await query.find()
  return results.map(parseTaskObject)
}

/**
 * Update a task
 */
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const TaskClass = Parse.Object.extend('Task')
  const query = new Parse.Query(TaskClass)
  const task = await query.get(id)

  if (updates.title !== undefined) task.set('title', updates.title)
  if (updates.description !== undefined) task.set('description', updates.description)
  if (updates.priority !== undefined) task.set('priority', updates.priority)
  if (updates.status !== undefined) task.set('status', updates.status)
  if (updates.dueDate !== undefined) task.set('dueDate', updates.dueDate)
  if (updates.category !== undefined) task.set('category', updates.category)
  if (updates.timerMinutes !== undefined) task.set('timerMinutes', updates.timerMinutes)

  const result = await task.save()
  return parseTaskObject(result)
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const TaskClass = Parse.Object.extend('Task')
  const query = new Parse.Query(TaskClass)
  const task = await query.get(id)
  await task.destroy()
}

/**
 * Helper to parse Parse task object
 */
function parseTaskObject(obj: Parse.Object): Task {
  return {
    id: obj.id || '',
    title: obj.get('title'),
    description: obj.get('description'),
    priority: obj.get('priority'),
    status: obj.get('status'),
    dueDate: obj.get('dueDate'),
    category: obj.get('category'),
    timerMinutes: obj.get('timerMinutes'),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== NOTES ====================

export interface Note {
  id?: string
  title: string
  content: string
  category?: string
  tags?: string[]
  isPinned?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new note
 */
export async function createNote(note: Note): Promise<Note> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const NoteClass = Parse.Object.extend('Note')
  const newNote = new NoteClass()

  newNote.set('title', note.title)
  newNote.set('content', note.content)
  newNote.set('category', note.category || 'General')
  newNote.set('tags', note.tags || [])
  newNote.set('isPinned', note.isPinned || false)
  newNote.set('userId', user.id || '')

  const result = await newNote.save()
  return parseNoteObject(result)
}

/**
 * Get all notes for current user
 */
export async function getNotes(): Promise<Note[]> {
  const user = Parse.User.current()
  if (!user) return []

  const NoteClass = Parse.Object.extend('Note')
  const query = new Parse.Query(NoteClass)
  query.equalTo('userId', user.id || '')
  query.descending('updatedAt')

  const results = await query.find()
  return results.map(parseNoteObject)
}

/**
 * Update a note
 */
export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const NoteClass = Parse.Object.extend('Note')
  const query = new Parse.Query(NoteClass)
  const note = await query.get(id)

  if (updates.title !== undefined) note.set('title', updates.title)
  if (updates.content !== undefined) note.set('content', updates.content)
  if (updates.category !== undefined) note.set('category', updates.category)
  if (updates.tags !== undefined) note.set('tags', updates.tags)
  if (updates.isPinned !== undefined) note.set('isPinned', updates.isPinned)

  const result = await note.save()
  return parseNoteObject(result)
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  const NoteClass = Parse.Object.extend('Note')
  const query = new Parse.Query(NoteClass)
  const note = await query.get(id)
  await note.destroy()
}

/**
 * Helper to parse Parse note object
 */
function parseNoteObject(obj: Parse.Object): Note {
  return {
    id: obj.id || '',
    title: obj.get('title'),
    content: obj.get('content'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    isPinned: obj.get('isPinned') || false,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== PANEL CONFIGS ====================

export interface PanelConfig {
  id?: string
  title: string
  path: string
  panelIndex: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Save panel configuration
 */
export async function savePanelConfig(config: PanelConfig): Promise<PanelConfig> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const PanelConfigClass = Parse.Object.extend('PanelConfig')

  // Check if config already exists for this panel index
  const query = new Parse.Query(PanelConfigClass)
  query.equalTo('userId', user.id || '')
  query.equalTo('panelIndex', config.panelIndex)

  let panelConfig: Parse.Object = await query.first() || new PanelConfigClass()

  panelConfig.set('userId', user.id || '')
  panelConfig.set('panelIndex', config.panelIndex)
  panelConfig.set('title', config.title)
  panelConfig.set('path', config.path)

  const result = await panelConfig.save()
  return parsePanelConfigObject(result)
}

/**
 * Get all panel configs for current user
 */
export async function getPanelConfigs(): Promise<PanelConfig[]> {
  const user = Parse.User.current()
  if (!user) return []

  const PanelConfigClass = Parse.Object.extend('PanelConfig')
  const query = new Parse.Query(PanelConfigClass)
  query.equalTo('userId', user.id || '')
  query.ascending('panelIndex')

  const results = await query.find()
  return results.map(parsePanelConfigObject)
}

/**
 * Helper to parse Parse panel config object
 */
function parsePanelConfigObject(obj: Parse.Object): PanelConfig {
  return {
    id: obj.id || '',
    title: obj.get('title'),
    path: obj.get('path'),
    panelIndex: obj.get('panelIndex'),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== SYNC STATUS ====================

export interface SyncStatus {
  isOnline: boolean
  lastSyncTime: Date | null
  pendingChanges: number
}

/**
 * Get sync status
 */
export function getSyncStatus(): SyncStatus {
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: new Date(), // TODO: Implement proper tracking
    pendingChanges: 0 // TODO: Implement offline queue
  }
}

export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,

  // Tasks
  createTask,
  getTasks,
  updateTask,
  deleteTask,

  // Notes
  createNote,
  getNotes,
  updateNote,
  deleteNote,

  // Panel Configs
  savePanelConfig,
  getPanelConfigs,

  // Sync
  getSyncStatus
}
