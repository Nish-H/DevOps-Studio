const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform and app info
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Navigation (for menu integration)
  onNavigate: (callback) => {
    ipcRenderer.on('navigate-to-section', (event, section) => {
      callback(section)
    })
  },
  
  // Terminal operations (will be implemented in Phase 2)
  terminal: {
    create: (shell) => ipcRenderer.invoke('terminal-create', shell),
    write: (id, data) => ipcRenderer.invoke('terminal-write', id, data),
    resize: (id, cols, rows) => ipcRenderer.invoke('terminal-resize', id, cols, rows),
    destroy: (id) => ipcRenderer.invoke('terminal-destroy', id),
    onData: (callback) => {
      ipcRenderer.on('terminal-data', (event, id, data) => {
        callback(id, data)
      })
    }
  },
  
  // Claude CLI operations (will be implemented in Phase 3)
  claude: {
    execute: (command, args) => ipcRenderer.invoke('claude-execute', command, args),
    onOutput: (callback) => {
      ipcRenderer.on('claude-output', (event, data) => {
        callback(data)
      })
    }
  },
  
  // File system operations (for future file integration)
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs-read-dir', path),
    readFile: (path) => ipcRenderer.invoke('fs-read-file', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs-write-file', path, content)
  },
  
  // Settings and preferences
  settings: {
    get: (key) => ipcRenderer.invoke('settings-get', key),
    set: (key, value) => ipcRenderer.invoke('settings-set', key, value),
    getAll: () => ipcRenderer.invoke('settings-get-all')
  },
  
  // Development helpers
  isDev: process.env.NODE_ENV === 'development',
  
  // Remove all listeners (cleanup)
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

// Log when preload script is loaded
console.log('Nishen\'s AI Workspace - Preload script loaded')
console.log('Platform:', process.platform)
console.log('Environment:', process.env.NODE_ENV)