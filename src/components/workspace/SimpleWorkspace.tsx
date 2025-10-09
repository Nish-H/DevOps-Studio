'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { autoBackupManager } from '../../lib/autoBackup'
import { dailyAutoBackup } from '../../lib/dailyAutoBackup'
import Terminal from './Terminal'
import PowerShell from './PowerShell'
import Files from './Files'
import FileBrowserSimple from './FileBrowserSimple'
import Prod from './Prod'
import Notes from './Notes'
import Tools from './Tools'
import Settings from './Settings'
import PromptEngineering from './PromptEngineering'
import URLLinks from './URLLinks'
import TaskTracker from './TaskTracker'
import ElectronStatus from '../ElectronStatus'
import ElectronDescription from '../ElectronDescription'

export default function SimpleWorkspace() {
  const { logout } = useAuth()
  const [activeSection, setActiveSection] = useState('claude-ai')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Welcome to Nishen's AI Workspace! I'm Claude, ready to help with your system engineering tasks.",
      timestamp: ''
    }
  ])
  const [isElectron, setIsElectron] = useState<boolean | null>(null)
  const [activeClaudeProcess, setActiveClaudeProcess] = useState<number | null>(null)

  // Fix hydration by setting timestamp after mount
  useEffect(() => {
    // Check if running in Electron with retry logic for timing issues
    const checkElectron = () => {
      const electronCheck = typeof window !== 'undefined' && (window as any).electronAPI
      console.log('Electron check:', !!electronCheck, window)
      return !!electronCheck
    }
    
    // Initial check
    let isElectronDetected = checkElectron()
    setIsElectron(isElectronDetected)
    
    // Retry after a short delay if not detected (for production timing issues)
    if (!isElectronDetected) {
      setTimeout(() => {
        isElectronDetected = checkElectron()
        setIsElectron(isElectronDetected)
        updateWelcomeMessage(isElectronDetected)
      }, 100)
    }
    
    // Set initial welcome message with mode indicator (will update when electron detection completes)
    const updateWelcomeMessage = (isElectronMode: boolean) => {
      const welcomeContent = isElectronMode 
        ? "Welcome to Nishen's AI Workspace! I'm Claude, with full CLI integration ready for your system engineering tasks."
        : "Welcome to Nishen's AI Workspace! I'm Claude, ready to help (web demo mode - full features available in desktop app)."
      
      setMessages(prev => prev.map(msg => 
        msg.id === 1 ? { 
          ...msg, 
          content: welcomeContent,
          timestamp: new Date().toLocaleTimeString() 
        } : msg
      ))
    }
    
    // Update welcome message initially and when detection changes
    updateWelcomeMessage(isElectronDetected)

    // Listen for terminal -> Claude AI switching
    const handleSwitchToClaudeAI = () => {
      setActiveSection('claude-ai')
    }

    // Listen for terminal -> PowerShell switching
    const handleSwitchToPowerShell = () => {
      setActiveSection('powershell')
    }

    // Listen for Claude command execution from terminal
    const handleClaudeExecuteCommand = (event: any) => {
      const command = event.detail?.command
      if (command) {
        setMessage(command)
        // Auto-execute after a short delay
        setTimeout(() => {
          if (command.trim()) {
            handleSendMessage()
          }
        }, 100)
      }
    }

    // Listen for Electron menu navigation
    const handleElectronNavigation = (section: string) => {
      setActiveSection(section)
    }

    // Listen for Claude CLI output
    const handleClaudeOutput = (output: any) => {
      const responseMessage = {
        id: Date.now(),
        type: 'assistant',
        content: output.data,
        timestamp: new Date().toLocaleTimeString(),
        claudeId: output.id,
        outputType: output.type
      }
      
      setMessages(prev => [...prev, responseMessage])
      
      if (output.type === 'exit') {
        setActiveClaudeProcess(null)
      }
    }

    window.addEventListener('switchToClaudeAI', handleSwitchToClaudeAI)
    window.addEventListener('switchToPowerShell', handleSwitchToPowerShell)
    window.addEventListener('claudeExecuteCommand', handleClaudeExecuteCommand)
    
    // Electron API integration
    if (isElectronDetected) {
      (window as any).electronAPI.onNavigate(handleElectronNavigation)
      ;(window as any).electronAPI.claude.onOutput(handleClaudeOutput)
    }
    
    return () => {
      window.removeEventListener('switchToClaudeAI', handleSwitchToClaudeAI)
      window.removeEventListener('switchToPowerShell', handleSwitchToPowerShell)
      window.removeEventListener('claudeExecuteCommand', handleClaudeExecuteCommand)
      if (isElectronDetected) {
        ;(window as any).electronAPI.removeAllListeners('navigate-to-section')
        ;(window as any).electronAPI.removeAllListeners('claude-output')
      }
    }
  }, [])

  // Initialize auto-backup systems
  useEffect(() => {
    console.log('🛡️ Auto-backup system initialized')
    autoBackupManager.createBackup('auto')
    
    console.log('📅 Daily 5PM backup system initialized')
    console.log(`⏰ Next backup: ${dailyAutoBackup.getNextBackupTime()}`)
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    const currentMessage = message
    setMessage('')

    if (isElectron === true) {
      try {
        // Execute Claude CLI command
        const result = await (window as any).electronAPI.claude.execute('code', [currentMessage])
        setActiveClaudeProcess(result.id)
        
        // Add execution status message
        const statusMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: `🚀 Executing: claude --code "${currentMessage}" (Process ID: ${result.id})`,
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, statusMessage])
        
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: `❌ Error executing Claude command: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } else {
      // Web demo mode - simulate response
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I understand you said: "${currentMessage}". This is web demo mode. For full Claude CLI integration, please use the desktop application.`,
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, response])
      }, 1000)
    }
  }

  const menuItems = [
    { id: 'claude-ai', name: 'Claude AI', icon: '🤖' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'powershell', name: 'PowerShell', icon: '🔷' },
    { id: 'dev', name: 'Dev', icon: '🛠️' },
    { id: 'prod', name: 'Prod', icon: '🚀' },
    { id: 'file-browser', name: 'File Browser', icon: '🗂️' },
    { id: 'tasks', name: 'Task Tracker', icon: '✅' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'prompts', name: 'Prompts', icon: '🧠' },
    { id: 'links', name: 'Links', icon: '🔗' },
    { id: 'tools', name: 'Tools', icon: '⚡' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 lg:w-64 md:w-56 sm:w-48 bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--primary-accent)' }}>DevOps Studio</h1>
              <p className="text-sm text-gray-400">Professional Workspace</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-400 text-sm p-2 rounded transition-colors"
              title="Secure Logout"
            >
              🔐
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                activeSection === item.id 
                  ? 'text-white font-semibold' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              style={{
                backgroundColor: activeSection === item.id ? 'var(--primary-accent)' : undefined,
                color: activeSection === item.id ? '#ffffff' : undefined
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeSection === 'claude-ai' ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center">
                    Claude AI Assistant
                    <ElectronStatus />
                  </h2>
                  <p className="text-sm text-gray-400">
                    <ElectronDescription />
                  </p>
                </div>
                {activeClaudeProcess && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Process {activeClaudeProcess} Running</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg rounded-lg p-4 ${
                    msg.type === 'user' 
                      ? 'bg-orange-600 text-white' 
                      : msg.type === 'system'
                      ? 'bg-blue-800 text-blue-100 border border-blue-600'
                      : msg.type === 'error'
                      ? 'bg-red-800 text-red-100 border border-red-600'
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <div className="mb-2">
                      {msg.type === 'system' && (
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          <span className="text-xs font-semibold text-blue-300">SYSTEM</span>
                        </div>
                      )}
                      {msg.type === 'error' && (
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          <span className="text-xs font-semibold text-red-300">ERROR</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className="text-xs opacity-70">{msg.timestamp}</p>
                    {(msg as any).claudeId && (
                      <p className="text-xs opacity-50 mt-1">Claude Process: {(msg as any).claudeId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            {isElectron === true && (
              <div className="p-4 border-t border-gray-800 bg-gray-800">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMessage('Help me analyze the current project structure and suggest improvements')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                    >
                      📂 Analyze Project
                    </button>
                    <button
                      onClick={() => setMessage('Review the git status and suggest next steps for version control')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                    >
                      🔄 Git Review
                    </button>
                    <button
                      onClick={() => setMessage('Help me debug and fix any issues in the current codebase')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                    >
                      🐛 Debug Help
                    </button>
                    <button
                      onClick={() => setActiveSection('terminal')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                    >
                      💻 Switch to Terminal
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 text-center lg:text-right">
                    Quick Actions • Context-Aware Claude Commands
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isElectron === true ? "Ask Claude to execute commands, analyze code, or help with your workflow..." : "Ask Claude about system engineering, automation, or coding..."}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
                  style={{ 
                    ['--focus-color' as any]: 'var(--primary-accent)'
                  } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-accent)'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || (isElectron === true && activeClaudeProcess !== null)}
                    className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                  >
                    {isElectron === true && activeClaudeProcess ? 'Processing...' : 'Send'}
                  </button>
                  {isElectron === true && activeClaudeProcess && (
                    <button
                      onClick={async () => {
                        if (activeClaudeProcess) {
                          await (window as any).electronAPI.claude.kill(activeClaudeProcess)
                          setActiveClaudeProcess(null)
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeSection === 'terminal' ? (
          <Terminal />
        ) : activeSection === 'powershell' ? (
          <PowerShell />
        ) : activeSection === 'dev' ? (
          <Files />
        ) : activeSection === 'prod' ? (
          <Prod />
        ) : activeSection === 'file-browser' ? (
          <FileBrowserSimple />
        ) : activeSection === 'tasks' ? (
          <TaskTracker />
        ) : activeSection === 'notes' ? (
          <Notes />
        ) : activeSection === 'prompts' ? (
          <PromptEngineering />
        ) : activeSection === 'links' ? (
          <URLLinks />
        ) : activeSection === 'tools' ? (
          <Tools />
        ) : activeSection === 'settings' ? (
          <Settings />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {menuItems.find((item: any) => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-orange-500">
                {menuItems.find((item: any) => item.id === activeSection)?.name}
              </h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}