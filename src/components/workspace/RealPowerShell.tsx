'use client'

import { useState, useRef, useEffect } from 'react'
import { simplePowerShellExecutor } from '../../lib/simplePowerShellAPI'

interface PowerShellEntry {
  id: number
  type: 'command' | 'output' | 'error' | 'prompt'
  content: string
  timestamp: string
  executionTime?: number
}

export default function RealPowerShell() {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<PowerShellEntry[]>([])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Set initial welcome message - ALWAYS REAL MODE
    const welcomeMessage = `PowerShell 7.4.0
Copyright (c) Microsoft Corporation.

https://aka.ms/powershell
Type 'help' to get help.

Welcome to Nishen's DevOps Studio - Real PowerShell Environment
Current Location: ${simplePowerShellExecutor.getCurrentLocation()}`
      
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
    const promptEntry: PowerShellEntry = {
      id: Date.now(),
      type: 'prompt',
      content: simplePowerShellExecutor.getPrompt() + cmd,
      timestamp
    }

    setHistory(prev => [...prev, promptEntry])
    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    // Execute REAL PowerShell command
    try {
      const result = await simplePowerShellExecutor.executeCommand(cmd)
      
      if (cmd.toLowerCase().trim() === 'clear-host' || cmd.toLowerCase().trim() === 'cls') {
        setHistory([])
        setCommand('')
        setIsExecuting(false)
        return
      }

      const outputEntry: PowerShellEntry = {
        id: Date.now() + 1,
        type: result.success ? 'output' : 'error',
        content: result.success ? result.output : (result.error || 'Command failed'),
        timestamp: new Date().toLocaleTimeString(),
        executionTime: result.executionTime
      }

      setHistory(prev => [...prev, outputEntry])
    } catch (error) {
      const errorEntry: PowerShellEntry = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString()
      }
      setHistory(prev => [...prev, errorEntry])
    }

    // Handle special commands that switch interfaces
    const trimmedCmd = cmd.toLowerCase().trim()
    if (trimmedCmd === 'claude' || trimmedCmd.startsWith('claude ')) {
      // Emit event to switch to Claude AI
      const event = new CustomEvent('switchToClaudeAI')
      window.dispatchEvent(event)
    } else if (trimmedCmd === 'bash' || trimmedCmd === 'terminal') {
      // Emit event to switch to Terminal
      const event = new CustomEvent('switchToTerminal')
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
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for common cmdlets
      const commonCmdlets = [
        'Get-ChildItem', 'Set-Location', 'Get-Content', 'Write-Output', 'Get-Process',
        'Get-Service', 'Get-Help', 'Get-Variable', 'Set-Variable', 'Get-Module',
        'Import-Module', 'Test-Path', 'New-Item', 'Copy-Item', 'Move-Item',
        'Remove-Item', 'Get-Date', 'Clear-Host', 'Get-Host', 'Invoke-WebRequest'
      ]
      
      const currentInput = command.toLowerCase()
      const matches = commonCmdlets.filter(cmdlet => 
        cmdlet.toLowerCase().startsWith(currentInput)
      )
      
      if (matches.length === 1) {
        setCommand(matches[0] + ' ')
      } else if (matches.length > 1) {
        // Show available completions
        const completionEntry: PowerShellEntry = {
          id: Date.now(),
          type: 'output',
          content: `Available completions:\\n${matches.join('\\n')}`,
          timestamp: new Date().toLocaleTimeString()
        }
        setHistory(prev => [...prev, completionEntry])
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-blue-900 text-yellow-200 font-mono">
      {/* Header */}
      <div className="p-4 border-b border-blue-700 bg-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center">
              🔷 Real PowerShell Core
              <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-600 text-blue-100">
                FULLY OPERATIONAL
              </span>
            </h2>
            <p className="text-sm text-blue-200">
              PowerShell 7.4.0 • All cmdlets functional • Pipeline support • Real execution
            </p>
          </div>
          <div className="text-sm text-blue-200">
            Location: {simplePowerShellExecutor.getCurrentLocation()}
          </div>
        </div>
      </div>

      {/* PowerShell Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-y-auto p-4 cursor-text bg-blue-900"
      >
        {history.map(entry => (
          <div key={entry.id} className="mb-1">
            <div className={`${
              entry.type === 'prompt' ? 'text-cyan-300' :
              entry.type === 'error' ? 'text-red-300' : 
              entry.type === 'output' ? 'text-yellow-200' : 'text-blue-200'
            }`}>
              <pre className="whitespace-pre-wrap font-mono">{entry.content}</pre>
              {entry.executionTime && (
                <span className="text-xs text-blue-400 ml-2">
                  ({entry.executionTime}ms)
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Current Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-cyan-300 mr-2">
            {simplePowerShellExecutor.getPrompt()}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-yellow-200 font-mono"
            placeholder={isExecuting ? "Executing..." : "Enter PowerShell command..."}
            disabled={isExecuting}
            autoFocus
          />
          {isExecuting && (
            <div className="text-cyan-300 ml-2">
              <div className="animate-spin w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full"></div>
            </div>
          )}
        </form>
      </div>

      {/* PowerShell Footer */}
      <div className="p-2 border-t border-blue-700 bg-blue-800 text-xs text-blue-200">
        <div className="flex items-center justify-between">
          <div>
            Tab for completion • Get-Help [cmdlet] for help • cls to clear • claude for AI
          </div>
          <div className="flex space-x-4">
            <span>Commands: {commandHistory.length}</span>
            <span>PowerShell: Core</span>
          </div>
        </div>
      </div>
    </div>
  )
}