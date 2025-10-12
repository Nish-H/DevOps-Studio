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
  const [activeSection, setActiveSection] = useState('powershell')
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
        {activeSection === 'powershell' ? (
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