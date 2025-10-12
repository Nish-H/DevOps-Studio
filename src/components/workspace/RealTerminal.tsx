'use client'

import { useState, useRef, useEffect } from 'react'
import { terminalExecutor } from '../../lib/terminalAPI'

interface TerminalEntry {
  id: number
  type: 'command' | 'output' | 'error' | 'prompt'
  content: string
  timestamp: string
  executionTime?: number
}

export default function RealTerminal() {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<TerminalEntry[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Set initial welcome message - ALWAYS REAL MODE
    const welcomeMessage = `Welcome to Nishen's AI Workspace Terminal
Real command execution enabled. Type "help" to see available commands.
Current directory: ${terminalExecutor.getCurrentDirectory()}`
      
    setHistory([{
      id: 1,
      type: 'output',
      content: welcomeMessage,
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [])

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

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return
    
    setIsExecuting(true)
    const timestamp = new Date().toLocaleTimeString()
    
    // Add command prompt and command to history
    const promptEntry: TerminalEntry = {
      id: Date.now(),
      type: 'prompt',
      content: terminalExecutor.getPrompt() + cmd,
      timestamp
    }

    setHistory(prev => [...prev, promptEntry])
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    // Execute REAL command
    try {
      const result = await terminalExecutor.executeCommand(cmd)
      
      if (cmd.toLowerCase().trim() === 'clear') {
        setHistory([])
        setCommand('')
        setIsExecuting(false)
        return
      }

      const outputEntry: TerminalEntry = {
        id: Date.now() + 1,
        type: result.success ? 'output' : 'error',
        content: result.success ? result.output : (result.error || 'Command failed'),
        timestamp: new Date().toLocaleTimeString(),
        executionTime: result.executionTime
      }

      setHistory(prev => [...prev, outputEntry])
    } catch (error) {
      const errorEntry: TerminalEntry = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString()
      }
      setHistory(prev => [...prev, errorEntry])
    }

    // Handle special commands that switch interfaces
    const trimmedCmd = cmd.toLowerCase().trim()
    if (trimmedCmd === 'claude') {
      // Emit event to switch to Claude AI
      const event = new CustomEvent('switchToClaudeAI')
      window.dispatchEvent(event)
    } else if (trimmedCmd === 'powershell' || trimmedCmd === 'ps') {
      // Emit event to switch to PowerShell
      const event = new CustomEvent('switchToPowerShell')
      window.dispatchEvent(event)
    }

    setCommand('')
    setIsExecuting(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isExecuting && command.trim()) {
      executeCommand(command.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center">
              💻 Real Terminal
              <span className="ml-2 px-2 py-1 text-xs rounded bg-green-800 text-green-200">
                FULLY OPERATIONAL
              </span>
            </h2>
            <p className="text-sm text-gray-400">
              Full command execution • Real file system • All commands functional
            </p>
          </div>
          <div className="text-sm text-gray-400">
            CWD: {terminalExecutor.getCurrentDirectory()}
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto p-4 cursor-text bg-black"
      >
        {history.map(entry => (
          <div key={entry.id} className="mb-1">
            <div className={`${
              entry.type === 'prompt' ? 'text-yellow-400' :
              entry.type === 'error' ? 'text-red-400' : 
              entry.type === 'output' ? 'text-green-400' : 'text-gray-400'
            }`}>
              <pre className="whitespace-pre-wrap font-mono">{entry.content}</pre>
              {entry.executionTime && (
                <span className="text-xs text-gray-500 ml-2">
                  ({entry.executionTime}ms)
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Current Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-yellow-400 mr-2">
            {terminalExecutor.getPrompt()}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono"
            placeholder={isExecuting ? "Executing..." : "Type command..."}
            disabled={isExecuting}
            autoFocus
          />
          {isExecuting && (
            <div className="text-yellow-400 ml-2">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </form>
      </div>

      {/* Terminal Footer */}
      <div className="p-2 border-t border-gray-800 bg-gray-900 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <div>
            Type 'help' for commands • 'clear' to clear • 'claude' for AI • 'powershell' for PS
          </div>
          <div>
            Commands in history: {commandHistory.length}
          </div>
        </div>
      </div>
    </div>
  )
}