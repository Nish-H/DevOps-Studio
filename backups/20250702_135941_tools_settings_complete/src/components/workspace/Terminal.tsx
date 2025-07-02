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
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      id: 1,
      type: 'output',
      content: 'Welcome to Nishen\'s AI Workspace Terminal\nType "help" to see available commands.',
      timestamp: new Date().toLocaleTimeString()
    }
  ])
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
- claude --help Claude integration help`
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
Workspace: Nishen's AI Workspace v0.1.0`
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
This terminal provides system command simulation for workspace navigation.`
        break

      case 'claude --status':
        output = `Claude AI Status:
Status: Active (Demo Mode)
Interface: Available in Claude AI tab
Features: Chat interface, system engineering assistance
Integration: Terminal → Claude AI switching enabled`
        break

      default:
        if (cmd.startsWith('echo ')) {
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
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-gray-300">Terminal - Nishen's AI Workspace</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span>PowerShell Core</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 p-4 overflow-y-auto cursor-text"
        style={{ scrollBehavior: 'smooth' }}
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