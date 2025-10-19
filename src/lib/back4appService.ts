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

/**
 * Check if error is an invalid session token error
 */
export function isSessionError(error: any): boolean {
  return error?.code === 209 ||
         error?.message?.includes('invalid session') ||
         error?.message?.includes('Invalid session token')
}

/**
 * Handle session errors - logout and return true if session error
 */
export async function handleSessionError(error: any): Promise<boolean> {
  if (isSessionError(error)) {
    console.warn('⚠️ Invalid session detected, logging out...')
    try {
      await logoutUser()
    } catch (logoutError) {
      console.error('Error during logout:', logoutError)
    }
    return true
  }
  return false
}

// ==================== TASKS ====================

export interface Task {
  id?: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold'
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
  isArchived?: boolean
  type?: 'markdown' | 'html' | 'document' | 'code' | 'other'
  created?: Date
  modified?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface NoteCategory {
  id?: string
  name: string
  color: string
  count?: number
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
  newNote.set('isArchived', note.isArchived || false)
  newNote.set('type', note.type || 'markdown')
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
  if (updates.isArchived !== undefined) note.set('isArchived', updates.isArchived)
  if (updates.type !== undefined) note.set('type', updates.type)

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
  const createdAt = obj.createdAt || new Date()
  const updatedAt = obj.updatedAt || new Date()

  return {
    id: obj.id || '',
    title: obj.get('title'),
    content: obj.get('content'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    isPinned: obj.get('isPinned') || false,
    isArchived: obj.get('isArchived') || false,
    type: obj.get('type') || 'markdown',
    created: createdAt,
    modified: updatedAt,
    createdAt: createdAt,
    updatedAt: updatedAt
  }
}

// ==================== NOTE CATEGORIES ====================

/**
 * Create a new note category
 */
export async function createNoteCategory(category: NoteCategory): Promise<NoteCategory> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const NoteCategoryClass = Parse.Object.extend('NoteCategory')
  const newCategory = new NoteCategoryClass()

  newCategory.set('name', category.name)
  newCategory.set('color', category.color)
  newCategory.set('userId', user.id || '')

  const result = await newCategory.save()
  return parseNoteCategoryObject(result)
}

/**
 * Get all note categories for current user
 */
export async function getNoteCategories(): Promise<NoteCategory[]> {
  const user = Parse.User.current()
  if (!user) return []

  const NoteCategoryClass = Parse.Object.extend('NoteCategory')
  const query = new Parse.Query(NoteCategoryClass)
  query.equalTo('userId', user.id || '')
  query.ascending('name')

  const results = await query.find()
  return results.map(parseNoteCategoryObject)
}

/**
 * Update a note category
 */
export async function updateNoteCategory(id: string, updates: Partial<NoteCategory>): Promise<NoteCategory> {
  const NoteCategoryClass = Parse.Object.extend('NoteCategory')
  const query = new Parse.Query(NoteCategoryClass)
  const category = await query.get(id)

  if (updates.name !== undefined) category.set('name', updates.name)
  if (updates.color !== undefined) category.set('color', updates.color)

  const result = await category.save()
  return parseNoteCategoryObject(result)
}

/**
 * Delete a note category
 */
export async function deleteNoteCategory(id: string): Promise<void> {
  const NoteCategoryClass = Parse.Object.extend('NoteCategory')
  const query = new Parse.Query(NoteCategoryClass)
  const category = await query.get(id)
  await category.destroy()
}

/**
 * Helper to parse Parse note category object
 */
function parseNoteCategoryObject(obj: Parse.Object): NoteCategory {
  return {
    id: obj.id || '',
    name: obj.get('name'),
    color: obj.get('color'),
    count: 0, // Will be calculated client-side
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

// ==================== URL LINKS ====================

export interface URLLink {
  id?: string
  title: string
  url: string
  category: string
  tags?: string[]
  description?: string
  favicon?: string
  isPinned?: boolean
  clickCount?: number
  lastVisited?: Date
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new URL link
 */
export async function createURLLink(link: URLLink): Promise<URLLink> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const URLLinkClass = Parse.Object.extend('URLLink')
  const newLink = new URLLinkClass()

  newLink.set('title', link.title)
  newLink.set('url', link.url)
  newLink.set('category', link.category || 'General')
  newLink.set('tags', link.tags || [])
  newLink.set('description', link.description || '')
  newLink.set('favicon', link.favicon || '')
  newLink.set('isPinned', link.isPinned || false)
  newLink.set('clickCount', link.clickCount || 0)
  newLink.set('lastVisited', link.lastVisited)
  newLink.set('userId', user.id || '')

  const result = await newLink.save()
  return parseURLLinkObject(result)
}

/**
 * Get all URL links for current user
 */
export async function getURLLinks(): Promise<URLLink[]> {
  const user = Parse.User.current()
  if (!user) return []

  const URLLinkClass = Parse.Object.extend('URLLink')
  const query = new Parse.Query(URLLinkClass)
  query.equalTo('userId', user.id || '')
  query.descending('createdAt')

  const results = await query.find()
  return results.map(parseURLLinkObject)
}

/**
 * Update a URL link
 */
export async function updateURLLink(id: string, updates: Partial<URLLink>): Promise<URLLink> {
  const URLLinkClass = Parse.Object.extend('URLLink')
  const query = new Parse.Query(URLLinkClass)
  const link = await query.get(id)

  if (updates.title !== undefined) link.set('title', updates.title)
  if (updates.url !== undefined) link.set('url', updates.url)
  if (updates.category !== undefined) link.set('category', updates.category)
  if (updates.tags !== undefined) link.set('tags', updates.tags)
  if (updates.description !== undefined) link.set('description', updates.description)
  if (updates.favicon !== undefined) link.set('favicon', updates.favicon)
  if (updates.isPinned !== undefined) link.set('isPinned', updates.isPinned)
  if (updates.clickCount !== undefined) link.set('clickCount', updates.clickCount)
  if (updates.lastVisited !== undefined) link.set('lastVisited', updates.lastVisited)

  const result = await link.save()
  return parseURLLinkObject(result)
}

/**
 * Delete a URL link
 */
export async function deleteURLLink(id: string): Promise<void> {
  const URLLinkClass = Parse.Object.extend('URLLink')
  const query = new Parse.Query(URLLinkClass)
  const link = await query.get(id)
  await link.destroy()
}

/**
 * Increment click count for a URL link
 */
export async function incrementLinkClickCount(id: string): Promise<void> {
  const URLLinkClass = Parse.Object.extend('URLLink')
  const query = new Parse.Query(URLLinkClass)
  const link = await query.get(id)

  link.increment('clickCount')
  link.set('lastVisited', new Date())
  await link.save()
}

/**
 * Helper to parse Parse URL link object
 */
function parseURLLinkObject(obj: Parse.Object): URLLink {
  return {
    id: obj.id || '',
    title: obj.get('title'),
    url: obj.get('url'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    description: obj.get('description') || '',
    favicon: obj.get('favicon') || '',
    isPinned: obj.get('isPinned') || false,
    clickCount: obj.get('clickCount') || 0,
    lastVisited: obj.get('lastVisited'),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== FILES & PROJECTS ====================

export interface FileVersion {
  id?: string
  content: string
  timestamp: Date
  description: string
}

export interface ProjectFile {
  id?: string
  name: string
  type: 'script' | 'html' | 'document' | 'code' | 'markdown' | 'other'
  category: string
  content: string
  versions: FileVersion[]
  created: Date
  modified: Date
  timeSpent: number
}

export interface Project {
  id?: string
  name: string
  description: string
  files: ProjectFile[]
  totalTimeSpent: number
  created: Date
  isTimerRunning: boolean
  timerStartTime?: Date
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new project
 */
export async function createProject(project: Project): Promise<Project> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const ProjectClass = Parse.Object.extend('Project')
  const newProject = new ProjectClass()

  newProject.set('name', project.name)
  newProject.set('description', project.description)
  newProject.set('files', JSON.stringify(project.files))
  newProject.set('totalTimeSpent', project.totalTimeSpent || 0)
  newProject.set('created', project.created || new Date())
  newProject.set('isTimerRunning', project.isTimerRunning || false)
  if (project.timerStartTime) newProject.set('timerStartTime', project.timerStartTime)
  newProject.set('userId', user.id || '')

  const result = await newProject.save()
  return parseProjectObject(result)
}

/**
 * Get all projects for current user
 */
export async function getProjects(): Promise<Project[]> {
  const user = Parse.User.current()
  if (!user) return []

  const ProjectClass = Parse.Object.extend('Project')
  const query = new Parse.Query(ProjectClass)
  query.equalTo('userId', user.id || '')
  query.descending('createdAt')

  const results = await query.find()
  return results.map(parseProjectObject)
}

/**
 * Update a project
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const ProjectClass = Parse.Object.extend('Project')
  const query = new Parse.Query(ProjectClass)
  const project = await query.get(id)

  if (updates.name !== undefined) project.set('name', updates.name)
  if (updates.description !== undefined) project.set('description', updates.description)
  if (updates.files !== undefined) project.set('files', JSON.stringify(updates.files))
  if (updates.totalTimeSpent !== undefined) project.set('totalTimeSpent', updates.totalTimeSpent)
  if (updates.isTimerRunning !== undefined) project.set('isTimerRunning', updates.isTimerRunning)
  if (updates.timerStartTime !== undefined) project.set('timerStartTime', updates.timerStartTime)

  const result = await project.save()
  return parseProjectObject(result)
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const ProjectClass = Parse.Object.extend('Project')
  const query = new Parse.Query(ProjectClass)
  const project = await query.get(id)
  await project.destroy()
}

/**
 * Helper to parse Parse project object
 */
function parseProjectObject(obj: Parse.Object): Project {
  const filesData = obj.get('files')
  let files: ProjectFile[] = []

  if (typeof filesData === 'string') {
    try {
      files = JSON.parse(filesData).map((f: any) => ({
        ...f,
        created: new Date(f.created),
        modified: new Date(f.modified),
        versions: (f.versions || []).map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Error parsing project files:', error)
      files = []
    }
  }

  return {
    id: obj.id || '',
    name: obj.get('name'),
    description: obj.get('description'),
    files: files,
    totalTimeSpent: obj.get('totalTimeSpent') || 0,
    created: obj.get('created') || obj.createdAt || new Date(),
    isTimerRunning: obj.get('isTimerRunning') || false,
    timerStartTime: obj.get('timerStartTime'),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== PROMPTS ====================

export interface Prompt {
  id?: string
  title: string
  content: string
  category: string
  tags: string[]
  created: Date
  modified: Date
  isPinned: boolean
  isArchived: boolean
  type: 'system' | 'user' | 'assistant' | 'creative' | 'technical' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  usageCount: number
  rating: number
  createdAt?: Date
  updatedAt?: Date
}

export interface PromptCategory {
  id?: string
  name: string
  color: string
  count?: number
  description: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new prompt
 */
export async function createPrompt(prompt: Prompt): Promise<Prompt> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const PromptClass = Parse.Object.extend('Prompt')
  const newPrompt = new PromptClass()

  newPrompt.set('title', prompt.title)
  newPrompt.set('content', prompt.content)
  newPrompt.set('category', prompt.category)
  newPrompt.set('tags', prompt.tags || [])
  newPrompt.set('isPinned', prompt.isPinned || false)
  newPrompt.set('isArchived', prompt.isArchived || false)
  newPrompt.set('type', prompt.type)
  newPrompt.set('difficulty', prompt.difficulty)
  newPrompt.set('usageCount', prompt.usageCount || 0)
  newPrompt.set('rating', prompt.rating || 0)
  newPrompt.set('userId', user.id || '')

  const result = await newPrompt.save()
  return parsePromptObject(result)
}

/**
 * Get all prompts for current user
 */
export async function getPrompts(): Promise<Prompt[]> {
  const user = Parse.User.current()
  if (!user) return []

  const PromptClass = Parse.Object.extend('Prompt')
  const query = new Parse.Query(PromptClass)
  query.equalTo('userId', user.id || '')
  query.descending('updatedAt')

  const results = await query.find()
  return results.map(parsePromptObject)
}

/**
 * Update a prompt
 */
export async function updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt> {
  const PromptClass = Parse.Object.extend('Prompt')
  const query = new Parse.Query(PromptClass)
  const prompt = await query.get(id)

  if (updates.title !== undefined) prompt.set('title', updates.title)
  if (updates.content !== undefined) prompt.set('content', updates.content)
  if (updates.category !== undefined) prompt.set('category', updates.category)
  if (updates.tags !== undefined) prompt.set('tags', updates.tags)
  if (updates.isPinned !== undefined) prompt.set('isPinned', updates.isPinned)
  if (updates.isArchived !== undefined) prompt.set('isArchived', updates.isArchived)
  if (updates.type !== undefined) prompt.set('type', updates.type)
  if (updates.difficulty !== undefined) prompt.set('difficulty', updates.difficulty)
  if (updates.usageCount !== undefined) prompt.set('usageCount', updates.usageCount)
  if (updates.rating !== undefined) prompt.set('rating', updates.rating)

  const result = await prompt.save()
  return parsePromptObject(result)
}

/**
 * Delete a prompt
 */
export async function deletePrompt(id: string): Promise<void> {
  const PromptClass = Parse.Object.extend('Prompt')
  const query = new Parse.Query(PromptClass)
  const prompt = await query.get(id)
  await prompt.destroy()
}

/**
 * Helper to parse Parse prompt object
 */
function parsePromptObject(obj: Parse.Object): Prompt {
  const createdAt = obj.createdAt || new Date()
  const updatedAt = obj.updatedAt || new Date()

  return {
    id: obj.id || '',
    title: obj.get('title'),
    content: obj.get('content'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    created: obj.get('created') || createdAt,
    modified: obj.get('modified') || updatedAt,
    isPinned: obj.get('isPinned') || false,
    isArchived: obj.get('isArchived') || false,
    type: obj.get('type'),
    difficulty: obj.get('difficulty'),
    usageCount: obj.get('usageCount') || 0,
    rating: obj.get('rating') || 0,
    createdAt: createdAt,
    updatedAt: updatedAt
  }
}

// ==================== PROMPT CATEGORIES ====================

/**
 * Create a new prompt category
 */
export async function createPromptCategory(category: PromptCategory): Promise<PromptCategory> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const PromptCategoryClass = Parse.Object.extend('PromptCategory')
  const newCategory = new PromptCategoryClass()

  newCategory.set('name', category.name)
  newCategory.set('color', category.color)
  newCategory.set('description', category.description || '')
  newCategory.set('userId', user.id || '')

  const result = await newCategory.save()
  return parsePromptCategoryObject(result)
}

/**
 * Get all prompt categories for current user
 */
export async function getPromptCategories(): Promise<PromptCategory[]> {
  const user = Parse.User.current()
  if (!user) return []

  const PromptCategoryClass = Parse.Object.extend('PromptCategory')
  const query = new Parse.Query(PromptCategoryClass)
  query.equalTo('userId', user.id || '')
  query.ascending('name')

  const results = await query.find()
  return results.map(parsePromptCategoryObject)
}

/**
 * Update a prompt category
 */
export async function updatePromptCategory(id: string, updates: Partial<PromptCategory>): Promise<PromptCategory> {
  const PromptCategoryClass = Parse.Object.extend('PromptCategory')
  const query = new Parse.Query(PromptCategoryClass)
  const category = await query.get(id)

  if (updates.name !== undefined) category.set('name', updates.name)
  if (updates.color !== undefined) category.set('color', updates.color)
  if (updates.description !== undefined) category.set('description', updates.description)

  const result = await category.save()
  return parsePromptCategoryObject(result)
}

/**
 * Delete a prompt category
 */
export async function deletePromptCategory(id: string): Promise<void> {
  const PromptCategoryClass = Parse.Object.extend('PromptCategory')
  const query = new Parse.Query(PromptCategoryClass)
  const category = await query.get(id)
  await category.destroy()
}

/**
 * Helper to parse Parse prompt category object
 */
function parsePromptCategoryObject(obj: Parse.Object): PromptCategory {
  return {
    id: obj.id || '',
    name: obj.get('name'),
    color: obj.get('color'),
    description: obj.get('description') || '',
    count: 0, // Will be calculated client-side
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== POWERSHELL SCRIPTS ====================

export interface PowerShellScript {
  id?: string
  title: string
  code: string
  description: string
  category: 'basics' | 'automation' | 'advanced' | 'networking' | 'system' | 'security' | 'other'
  tags: string[]
  isPinned: boolean
  isPublic: boolean
  copyCount: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Create a new PowerShell script
 */
export async function createPowerShellScript(script: PowerShellScript): Promise<PowerShellScript> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const ScriptClass = Parse.Object.extend('PowerShellScript')
  const newScript = new ScriptClass()

  newScript.set('title', script.title)
  newScript.set('code', script.code)
  newScript.set('description', script.description)
  newScript.set('category', script.category)
  newScript.set('tags', script.tags || [])
  newScript.set('isPinned', script.isPinned || false)
  newScript.set('isPublic', script.isPublic || false)
  newScript.set('copyCount', script.copyCount || 0)
  newScript.set('userId', user.id || '')

  const result = await newScript.save()
  return parsePowerShellScriptObject(result)
}

/**
 * Get all PowerShell scripts for current user
 */
export async function getPowerShellScripts(): Promise<PowerShellScript[]> {
  const user = Parse.User.current()
  if (!user) return []

  const ScriptClass = Parse.Object.extend('PowerShellScript')
  const query = new Parse.Query(ScriptClass)
  query.equalTo('userId', user.id || '')
  query.descending('updatedAt')

  const results = await query.find()
  return results.map(parsePowerShellScriptObject)
}

/**
 * Update a PowerShell script
 */
export async function updatePowerShellScript(id: string, updates: Partial<PowerShellScript>): Promise<PowerShellScript> {
  const ScriptClass = Parse.Object.extend('PowerShellScript')
  const query = new Parse.Query(ScriptClass)
  const script = await query.get(id)

  if (updates.title !== undefined) script.set('title', updates.title)
  if (updates.code !== undefined) script.set('code', updates.code)
  if (updates.description !== undefined) script.set('description', updates.description)
  if (updates.category !== undefined) script.set('category', updates.category)
  if (updates.tags !== undefined) script.set('tags', updates.tags)
  if (updates.isPinned !== undefined) script.set('isPinned', updates.isPinned)
  if (updates.isPublic !== undefined) script.set('isPublic', updates.isPublic)
  if (updates.copyCount !== undefined) script.set('copyCount', updates.copyCount)

  const result = await script.save()
  return parsePowerShellScriptObject(result)
}

/**
 * Delete a PowerShell script
 */
export async function deletePowerShellScript(id: string): Promise<void> {
  const ScriptClass = Parse.Object.extend('PowerShellScript')
  const query = new Parse.Query(ScriptClass)
  const script = await query.get(id)
  await script.destroy()
}

/**
 * Helper to parse Parse PowerShell script object
 */
function parsePowerShellScriptObject(obj: Parse.Object): PowerShellScript {
  return {
    id: obj.id || '',
    title: obj.get('title'),
    code: obj.get('code'),
    description: obj.get('description'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    isPinned: obj.get('isPinned') || false,
    isPublic: obj.get('isPublic') || false,
    copyCount: obj.get('copyCount') || 0,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  }
}

// ==================== STANDARD OPERATING PROCEDURES (SOPs) ====================

export interface SOP {
  id?: string
  title: string
  content: string
  category: 'incident' | 'maintenance' | 'deployment' | 'security' | 'monitoring' | 'backup' | 'other'
  tags: string[]
  steps: SOPStep[]
  isPinned: boolean
  isPublic: boolean
  viewCount: number
  createdAt?: Date
  updatedAt?: Date
}

export interface SOPStep {
  order: number
  title: string
  description: string
  command?: string
  notes?: string
}

/**
 * Create a new SOP
 */
export async function createSOP(sop: SOP): Promise<SOP> {
  const user = Parse.User.current()
  if (!user) throw new Error('User must be logged in')

  const SOPClass = Parse.Object.extend('SOP')
  const newSOP = new SOPClass()

  newSOP.set('title', sop.title)
  newSOP.set('content', sop.content)
  newSOP.set('category', sop.category)
  newSOP.set('tags', sop.tags || [])
  newSOP.set('steps', JSON.stringify(sop.steps || []))
  newSOP.set('isPinned', sop.isPinned || false)
  newSOP.set('isPublic', sop.isPublic || false)
  newSOP.set('viewCount', sop.viewCount || 0)
  newSOP.set('userId', user.id || '')

  const result = await newSOP.save()
  return parseSOPObject(result)
}

/**
 * Get all SOPs for current user
 */
export async function getSOPs(): Promise<SOP[]> {
  const user = Parse.User.current()
  if (!user) return []

  const SOPClass = Parse.Object.extend('SOP')
  const query = new Parse.Query(SOPClass)
  query.equalTo('userId', user.id || '')
  query.descending('updatedAt')

  const results = await query.find()
  return results.map(parseSOPObject)
}

/**
 * Update a SOP
 */
export async function updateSOP(id: string, updates: Partial<SOP>): Promise<SOP> {
  const SOPClass = Parse.Object.extend('SOP')
  const query = new Parse.Query(SOPClass)
  const sop = await query.get(id)

  if (updates.title !== undefined) sop.set('title', updates.title)
  if (updates.content !== undefined) sop.set('content', updates.content)
  if (updates.category !== undefined) sop.set('category', updates.category)
  if (updates.tags !== undefined) sop.set('tags', updates.tags)
  if (updates.steps !== undefined) sop.set('steps', JSON.stringify(updates.steps))
  if (updates.isPinned !== undefined) sop.set('isPinned', updates.isPinned)
  if (updates.isPublic !== undefined) sop.set('isPublic', updates.isPublic)
  if (updates.viewCount !== undefined) sop.set('viewCount', updates.viewCount)

  const result = await sop.save()
  return parseSOPObject(result)
}

/**
 * Delete a SOP
 */
export async function deleteSOP(id: string): Promise<void> {
  const SOPClass = Parse.Object.extend('SOP')
  const query = new Parse.Query(SOPClass)
  const sop = await query.get(id)
  await sop.destroy()
}

/**
 * Helper to parse Parse SOP object
 */
function parseSOPObject(obj: Parse.Object): SOP {
  const stepsData = obj.get('steps')
  let steps: SOPStep[] = []

  if (typeof stepsData === 'string') {
    try {
      steps = JSON.parse(stepsData)
    } catch (error) {
      console.error('Error parsing SOP steps:', error)
      steps = []
    }
  }

  return {
    id: obj.id || '',
    title: obj.get('title'),
    content: obj.get('content'),
    category: obj.get('category'),
    tags: obj.get('tags') || [],
    steps: steps,
    isPinned: obj.get('isPinned') || false,
    isPublic: obj.get('isPublic') || false,
    viewCount: obj.get('viewCount') || 0,
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
  isSessionError,
  handleSessionError,

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

  // Note Categories
  createNoteCategory,
  getNoteCategories,
  updateNoteCategory,
  deleteNoteCategory,

  // URL Links
  createURLLink,
  getURLLinks,
  updateURLLink,
  deleteURLLink,
  incrementLinkClickCount,

  // Panel Configs
  savePanelConfig,
  getPanelConfigs,

  // Projects & Files
  createProject,
  getProjects,
  updateProject,
  deleteProject,

  // Prompts
  createPrompt,
  getPrompts,
  updatePrompt,
  deletePrompt,

  // Prompt Categories
  createPromptCategory,
  getPromptCategories,
  updatePromptCategory,
  deletePromptCategory,

  // PowerShell Scripts
  createPowerShellScript,
  getPowerShellScripts,
  updatePowerShellScript,
  deletePowerShellScript,

  // SOPs
  createSOP,
  getSOPs,
  updateSOP,
  deleteSOP,

  // Sync
  getSyncStatus
}
