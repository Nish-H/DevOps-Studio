'use client'

import { useState, useRef, useEffect } from 'react'

interface TerminalEntry {
  id: number
  type: 'command' | 'output' | 'error'
  content: string
  timestamp: string
}

export default function Terminal() {
  const [command, setCommand] = useState('')
  const [isElectron, setIsElectron] = useState(false)
  const [history, setHistory] = useState<TerminalEntry[]>([])
  
  useEffect(() => {
    // Check if running in Electron
    const electronCheck = typeof window !== 'undefined' && (window as any).electronAPI
    setIsElectron(!!electronCheck)
    
    // Set initial welcome message
    const welcomeMessage = electronCheck 
      ? 'Welcome to Nishen\'s AI Workspace Terminal (Desktop Mode)\nReal command execution available. Type "help" to see available commands.'
      : 'Welcome to Nishen\'s AI Workspace Terminal (Web Mode)\nSimulated environment. Type "help" to see available commands.'
      
    setHistory([{
      id: 1,
      type: 'output',
      content: welcomeMessage,
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new entries are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  const executeCommand = (cmd: string) => {
    const timestamp = new Date().toLocaleTimeString()
    
    // Add command to history
    const commandEntry: TerminalEntry = {
      id: Date.now(),
      type: 'command',
      content: `> ${cmd}`,
      timestamp
    }

    setHistory(prev => [...prev, commandEntry])
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    // Process command
    let output = ''
    let type: 'output' | 'error' = 'output'

    switch (cmd.toLowerCase().trim()) {
      case 'help':
        output = `Available Commands:
- help          Show this help message
- clear         Clear terminal
- date          Show current date and time
- pwd           Show current directory
- ls            List directory contents
- whoami        Show current user
- echo <text>   Echo text back
- node --version Node.js version
- npm --version  NPM version
- git status    Git repository status
- sys           System information
- claude        Switch to Claude AI interface
- claude --help Claude integration help
- powershell    Switch to PowerShell tab (Full PS Core WASM)`
        break

      case 'clear':
        setHistory([])
        setCommand('')
        return

      case 'date':
        output = new Date().toString()
        break

      case 'pwd':
        output = 'X:\\ClaudeCode\\nishens-ai-workspace'
        break

      case 'ls':
        output = `Directory: X:\\ClaudeCode\\nishens-ai-workspace

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        ${new Date().toLocaleDateString()}                src
d-----        ${new Date().toLocaleDateString()}                public
d-----        ${new Date().toLocaleDateString()}                node_modules
-a----        ${new Date().toLocaleDateString()}           1234 package.json
-a----        ${new Date().toLocaleDateString()}            567 next.config.js
-a----        ${new Date().toLocaleDateString()}            789 tailwind.config.ts
-a----        ${new Date().toLocaleDateString()}           2345 README.md`
        break

      case 'whoami':
        output = 'Nishen Harichunder - Senior Systems Engineer'
        break

      case 'node --version':
        output = 'v22.17.0'
        break

      case 'npm --version':
        output = '10.8.1'
        break

      case 'git status':
        output = `On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/components/workspace/SimpleWorkspace.tsx

no changes added to commit (use "git add ." or "git commit -a")`
        break

      case 'sys':
        output = `System Information:
OS: Windows 11 Pro
Processor: Intel Core i7
Memory: 16GB RAM
Node.js: v22.17.0
Next.js: 14.2.5
Workspace: Nishen's AI Workspace v1.2.4`
        break

      case 'claude':
      case 'claude code':
        output = `Switching to Claude AI interface...
Use the Claude AI tab in the sidebar for full AI assistance.`
        // Switch to Claude AI section after showing message
        setTimeout(() => {
          // This would need to be passed down as a prop from SimpleWorkspace
          window.dispatchEvent(new CustomEvent('switchToClaudeAI'))
        }, 1500)
        break

      case 'claude --help':
        output = `Claude Code Integration:
- claude          Switch to Claude AI interface
- claude --help   Show this help
- claude --status Show Claude AI status

Note: Full Claude Code functionality is available in the Claude AI tab.
This terminal provides system command simulation for workspace navigation.

TIP: For full PowerShell experience, use the PowerShell tab! 🔷`
        break

      case 'claude --status':
        output = `Claude AI Status:
Status: ${isElectron ? 'Active (CLI Integration Ready)' : 'Active (Demo Mode)'}
Interface: Available in Claude AI tab
Features: ${isElectron ? 'Real Claude --code execution, CLI integration' : 'Chat interface, system engineering assistance'}
Integration: Terminal ↔ Claude AI switching enabled
Commands: claude, claude --help, claude --code <prompt>`
        break

      case 'powershell':
        output = `Switching to PowerShell Core (WASM)...
🔷 PowerShell 7.4.0 with full cmdlet support
🚀 WebAssembly-powered terminal
💻 Real PowerShell experience in your browser`
        // Switch to PowerShell section
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('switchToPowerShell'))
        }, 1500)
        break

      default:
        if (cmd.startsWith('claude --code ')) {
          const prompt = cmd.substring(14).trim()
          if (isElectron) {
            output = `Executing: claude --code "${prompt}"
Switching to Claude AI interface for execution...`
            // Switch to Claude AI and execute the command
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('switchToClaudeAI'))
              // Send message to Claude AI interface
              setTimeout(() => {
                const event = new CustomEvent('claudeExecuteCommand', { 
                  detail: { command: prompt } 
                })
                window.dispatchEvent(event)
              }, 500)
            }, 1500)
          } else {
            output = `Claude --code integration requires the desktop application.
Please use the desktop version for full CLI functionality.
Switching to Claude AI interface for web demo...`
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('switchToClaudeAI'))
            }, 2000)
          }
        } else if (cmd.startsWith('echo ')) {
          output = cmd.substring(5)
        } else if (cmd.trim() === '') {
          // Empty command, no output
          setCommand('')
          return
        } else {
          output = `'${cmd}' is not recognized as an internal or external command.
Type 'help' to see available commands.`
          type = 'error'
        }
    }

    // Add output
    const outputEntry: TerminalEntry = {
      id: Date.now() + 1,
      type,
      content: output,
      timestamp: new Date().toLocaleTimeString()
    }

    setHistory(prev => [...prev, outputEntry])
    setCommand('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (command.trim()) {
        executeCommand(command)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(commandHistory[newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(newIndex === -1 ? '' : commandHistory[newIndex] || '')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for help
      if (command.startsWith('h')) {
        setCommand('help')
      } else if (command.startsWith('c')) {
        setCommand('clear')
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-white font-mono">
      {/* Terminal Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        {/* Version Info */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>Nishen's AI Workspace v1.2.4</span>
          <span>Terminal Module</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-4 text-gray-300">Terminal - Nishen's AI Workspace</span>
          {isElectron && (
            <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
              Desktop Mode
            </span>
          )}
          {!isElectron && (
            <span className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
              Web Mode
            </span>
          )}
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <span>{isElectron ? 'Native Shell' : 'Simulated Shell'}</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 p-4 overflow-y-auto cursor-text"
        style={{ scrollBehavior: 'smooth', maxHeight: 'calc(100vh - 200px)' }}
      >
        {history.map(entry => (
          <div key={entry.id} className="mb-2">
            <div className={`${
              entry.type === 'command' 
                ? 'text-neon-red font-semibold' 
                : entry.type === 'error'
                ? 'text-red-400'
                : 'text-gray-300'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {entry.content}
              </pre>
            </div>
          </div>
        ))}

        {/* Current Command Line */}
        <div className="flex items-center">
          <span className="text-burnt-orange mr-2 font-semibold">PS X:\ClaudeCode\nishens-ai-workspace&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none font-mono"
            autoFocus
          />
          <div className="w-2 h-5 bg-white ml-1 animate-pulse"></div>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="p-2 border-t border-gray-800 bg-gray-900 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Type "help" for commands • Use ↑↓ for history • Tab for completion</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  )
}