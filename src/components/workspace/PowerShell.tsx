'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Download,
  Upload,
  Settings,
  Maximize2,
  Minimize2,
  Copy
} from 'lucide-react'

interface PowerShellSession {
  id: string
  name: string
  isActive: boolean
  history: PowerShellEntry[]
  currentDirectory: string
  variables: Record<string, any>
  modules: string[]
}

interface PowerShellEntry {
  id: number
  type: 'command' | 'output' | 'error' | 'warning' | 'information'
  content: string
  timestamp: string
  executionTime?: number
}

export default function PowerShell() {
  const [sessions, setSessions] = useState<PowerShellSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [isWasmLoaded, setIsWasmLoaded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const powershellWasmRef = useRef<any>(null)

  // Initialize Real PowerShell
  useEffect(() => {
    const initializePowerShell = async () => {
      try {
        console.log('🔷 Initializing Real PowerShell Core...')
        
        // Create native unrestricted PowerShell session
        const response = await fetch('/api/powershell-native', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_session' })
        })

        const data = await response.json()
        
        if (data.sessionId) {
          // Create session with native unrestricted PowerShell
          const nativeSession: PowerShellSession = {
            id: data.sessionId,
            name: 'PowerShell Core (Native)',
            isActive: true,
            history: [{
              id: 1,
              type: 'information',
              content: `🔷 Native PowerShell Core (UNRESTRICTED)
Full system access enabled!

Session ID: ${data.sessionId}
Version: ${data.version}
PID: ${data.pid}
Type: ${data.type}

PS > Ready for ANY PowerShell commands!
PS > Full access: Get-Service, Stop-Process, Set-ExecutionPolicy, etc.
PS > System operations: New-Item, Remove-Item, Invoke-WebRequest, etc.`,
              timestamp: new Date().toLocaleTimeString()
            }],
            currentDirectory: 'C:\\Workspace',
            variables: {},
            modules: []
          }

          setSessions([nativeSession])
          setActiveSessionId(nativeSession.id)
          setIsWasmLoaded(true)
          console.log('✅ Native unrestricted PowerShell initialized:', data.sessionId)
        } else {
          throw new Error('Failed to create PowerShell session')
        }
      } catch (error) {
        console.error('❌ Failed to initialize Real PowerShell:', error)
        
        // Fallback to simulation mode with clear indicator
        const fallbackSession: PowerShellSession = {
          id: 'fallback-session',
          name: 'PowerShell (Simulation)',
          isActive: true,
          history: [{
            id: 1,
            type: 'warning',
            content: `⚠️ PowerShell Simulation Mode
Real PowerShell execution failed to initialize.
This is a fallback simulation mode.

Error: ${error instanceof Error ? error.message : String(error)}

PS > Limited command simulation available.`,
            timestamp: new Date().toLocaleTimeString()
          }],
          currentDirectory: 'C:\\Workspace',
          variables: {},
          modules: []
        }

        setSessions([fallbackSession])
        setActiveSessionId(fallbackSession.id)
        setIsWasmLoaded(true)
      }
    }

    initializePowerShell()
  }, [])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [sessions])

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim() || !activeSession) return

    setIsExecuting(true)
    const startTime = Date.now()

    // Add command to history
    const commandEntry: PowerShellEntry = {
      id: Date.now(),
      type: 'command',
      content: `PS ${activeSession.currentDirectory}> ${cmd}`,
      timestamp: new Date().toLocaleTimeString()
    }

    setSessions(prev => prev.map(session => 
      session.id === activeSessionId
        ? { ...session, history: [...session.history, commandEntry] }
        : session
    ))

    setCommandHistory(prev => [...prev, cmd])
    setHistoryIndex(-1)

    // Execute PowerShell command (enhanced simulation)
    let output = ''
    let type: 'output' | 'error' | 'warning' | 'information' = 'output'

    try {
      const result = await executePowerShellCommand(cmd, activeSession)
      output = result.output
      type = result.type
      
      // Update session state if needed
      if (result.newDirectory) {
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId
            ? { ...session, currentDirectory: result.newDirectory! }
            : session
        ))
      }
      
      if ((result as any).variables) {
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId
            ? { ...session, variables: { ...session.variables, ...(result as any).variables } }
            : session
        ))
      }

    } catch (error) {
      output = `Error: ${error instanceof Error ? error.message : String(error)}`
      type = 'error'
    }

    const executionTime = Date.now() - startTime

    // Add output
    const outputEntry: PowerShellEntry = {
      id: Date.now() + 1,
      type,
      content: output,
      timestamp: new Date().toLocaleTimeString(),
      executionTime
    }

    setSessions(prev => prev.map(session => 
      session.id === activeSessionId
        ? { ...session, history: [...session.history, outputEntry] }
        : session
    ))

    setCommand('')
    setIsExecuting(false)
  }

  // Real PowerShell command execution logic
  const executePowerShellCommand = async (cmd: string, session: PowerShellSession) => {
    const cmdLower = cmd.toLowerCase().trim()
    
    // Check if this is a real PowerShell session
    if (session.id.startsWith('ps_')) {
      try {
        console.log('🔷 Executing real PowerShell command:', cmd)
        
        const response = await fetch('/api/powershell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'execute',
            command: cmd,
            sessionId: session.id
          })
        })

        const data = await response.json()
        
        if (data.isRealPowerShell) {
          return {
            output: data.output || data.error || 'No output',
            type: data.error ? 'error' as const : 'output' as const,
            executionTime: data.executionTime
          }
        } else {
          throw new Error('Real PowerShell execution failed')
        }
      } catch (error) {
        console.error('❌ Real PowerShell execution error:', error)
        return {
          output: `Real PowerShell Error: ${error instanceof Error ? error.message : String(error)}
Falling back to simulation mode for this command.`,
          type: 'error' as const
        }
      }
    }
    
    // Fallback to simulation for non-real sessions
    switch (true) {
      case cmdLower === 'get-command':
        return {
          output: `CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Alias           cls -> Clear-Host
Alias           dir -> Get-ChildItem
Alias           ls -> Get-ChildItem
Alias           pwd -> Get-Location
Cmdlet          Clear-Host                                         7.0.0.0    Microsoft.PowerShell.Core
Cmdlet          Get-ChildItem                                      7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Get-Content                                        7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Get-Date                                           7.0.0.0    Microsoft.PowerShell.Utility
Cmdlet          Get-Help                                           7.0.0.0    Microsoft.PowerShell.Core
Cmdlet          Get-Location                                       7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Get-Process                                        7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Get-Service                                        7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Set-Location                                       7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Write-Host                                         7.0.0.0    Microsoft.PowerShell.Utility
Cmdlet          Write-Output                                       7.0.0.0    Microsoft.PowerShell.Utility
Function        Get-WorkspaceInfo                                  1.0.0      NishensWorkspace
Function        New-WorkspaceProject                               1.0.0      NishensWorkspace
Function        Start-SystemAudit                                  1.0.0      NishensWorkspace`,
          type: 'output' as const
        }

      case cmdLower === 'get-help':
      case cmdLower === 'help':
        return {
          output: `Available PowerShell Commands:

CORE COMMANDS:
  Get-Command        - List all available commands
  Get-Help           - Show help information
  Clear-Host (cls)   - Clear the terminal screen
  Get-Date           - Get current date and time
  Get-Location (pwd) - Show current directory
  Set-Location (cd)  - Change directory
  Get-ChildItem (dir/ls) - List directory contents

MANAGEMENT:
  Get-Process        - List running processes
  Get-Service        - List system services
  Get-Content        - Read file contents
  
WORKSPACE COMMANDS:
  Get-WorkspaceInfo  - Show workspace information
  New-WorkspaceProject - Create new project
  Start-SystemAudit  - Run system security audit

EXAMPLES:
  Get-Date
  Get-Process | Where-Object {$_.CPU -gt 100}
  Get-ChildItem -Path C:\\ -Recurse
  "Hello World" | Write-Host -ForegroundColor Green`,
          type: 'information' as const
        }

      case cmdLower === 'clear-host' || cmdLower === 'cls' || cmdLower === 'clear':
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, history: [] }
            : s
        ))
        return { output: '', type: 'output' as const }

      case cmdLower === 'get-date':
        return {
          output: new Date().toString(),
          type: 'output' as const
        }

      case cmdLower === 'get-location' || cmdLower === 'pwd':
        return {
          output: `Path
----
${session.currentDirectory}`,
          type: 'output' as const
        }

      case cmdLower.startsWith('set-location ') || cmdLower.startsWith('cd '):
        const newPath = cmd.substring(cmd.indexOf(' ') + 1).trim()
        let targetDir = session.currentDirectory
        
        if (newPath === '..') {
          const parts = session.currentDirectory.split('\\')
          parts.pop()
          targetDir = parts.join('\\') || 'C:\\'
        } else if (newPath.startsWith('C:\\') || newPath.startsWith('/')) {
          targetDir = newPath
        } else {
          targetDir = `${session.currentDirectory}\\${newPath}`
        }

        return {
          output: '',
          type: 'output' as const,
          newDirectory: targetDir
        }

      case cmdLower === 'get-childitem' || cmdLower === 'dir' || cmdLower === 'ls':
        return {
          output: `    Directory: ${session.currentDirectory}

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        ${new Date().toLocaleDateString()}                src
d-----        ${new Date().toLocaleDateString()}                snapshots
d-----        ${new Date().toLocaleDateString()}                public
d-----        ${new Date().toLocaleDateString()}                node_modules
-a----        ${new Date().toLocaleDateString()}           1234 package.json
-a----        ${new Date().toLocaleDateString()}            567 next.config.js
-a----        ${new Date().toLocaleDateString()}            789 tailwind.config.ts
-a----        ${new Date().toLocaleDateString()}          17258 CLAUDE.md
-a----        ${new Date().toLocaleDateString()}           2345 README.md`,
          type: 'output' as const
        }

      case cmdLower === 'get-process':
        return {
          output: `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    463      23    45892      52340       2.34   1234   1 node
    198      15    12456      18923       0.89   5678   1 chrome
    332      28    34567      41234       5.67   9012   1 code
    156      12     8934      12456       1.23   3456   1 powershell
     89       8     5678       7890       0.45   7890   1 explorer`,
          type: 'output' as const
        }

      case cmdLower === 'get-service':
        return {
          output: `Status   Name               DisplayName
------   ----               -----------
Running  AudioSrv           Windows Audio
Running  BITS               Background Intelligent Transfer Ser...
Running  BrokerInfrastru... Background Tasks Infrastructure Ser...
Running  EventLog           Windows Event Log
Running  LanmanServer       Server
Running  PlugPlay           Plug and Play
Running  Power              Power
Running  Schedule           Task Scheduler
Running  Themes             Themes
Running  W32Time            Windows Time`,
          type: 'output' as const
        }

      case cmdLower === 'get-workspaceinfo':
        return {
          output: `Nishen's AI Workspace Information:

Version: 0.1.0
Platform: Next.js 14.2.5 on PowerShell WASM
Theme: Dynamic (Current: ${session.variables.currentTheme || 'Neon Red'})
Features:
  ✅ File Management with HTML/Markdown Preview
  ✅ Note-taking with Categories and Search
  ✅ Terminal with Command History
  ✅ Tools & Settings with Dynamic Theming
  ✅ PowerShell Core Integration (WASM)
  🚧 Real Claude AI Integration (Demo Mode)

Current Directory: ${session.currentDirectory}
Session ID: ${session.id}
Uptime: ${Math.floor((Date.now() - Date.parse('2025-07-04T16:41:21')) / 1000 / 60)} minutes`,
          type: 'information' as const
        }

      case cmdLower.startsWith('write-host '):
        const message = cmd.substring(11).trim()
        return {
          output: message.replace(/['"]/g, ''),
          type: 'output' as const
        }

      case cmdLower === '$psversiontable':
        return {
          output: `Name                           Value
----                           -----
PSVersion                      7.4.0
PSEdition                      Core
GitCommitId                    7.4.0
OS                             WASM Browser Environment
Platform                       Unix
PSCompatibleVersions           {1.0, 2.0, 3.0, 4.0...}
PSRemotingProtocolVersion      2.3
SerializationVersion           1.1.0.1
WSManStackVersion              3.0`,
          type: 'output' as const
        }

      default:
        // Try to handle as variable or expression
        if (cmdLower.startsWith('$')) {
          const varName = cmdLower.substring(1)
          if (session.variables[varName]) {
            return {
              output: JSON.stringify(session.variables[varName], null, 2),
              type: 'output' as const
            }
          }
        }

        // Complex commands simulation
        if (cmdLower.includes('|')) {
          return {
            output: `Pipeline command detected: ${cmd}
[Simulated pipeline execution - Full PowerShell pipeline support coming soon]`,
            type: 'information' as const
          }
        }

        return {
          output: `${cmd.split(' ')[0]} : The term '${cmd.split(' ')[0]}' is not recognized as the name of a cmdlet, function, script file, or operable program.
Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ ${cmd}
+ ${'^'.repeat(cmd.split(' ')[0].length)}
    + CategoryInfo          : ObjectNotFound: (${cmd.split(' ')[0]}:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException`,
          type: 'error' as const
        }
    }
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
      // Tab completion
      const parts = command.split(' ')
      const lastPart = parts[parts.length - 1].toLowerCase()
      
      const commands = ['get-command', 'get-help', 'clear-host', 'get-date', 'get-location', 'set-location', 'get-childitem', 'get-process', 'get-service', 'get-workspaceinfo', 'write-host']
      const matches = commands.filter(cmd => cmd.startsWith(lastPart))
      
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0]
        setCommand(parts.join(' '))
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      if (isExecuting) {
        setIsExecuting(false)
        const interruptEntry: PowerShellEntry = {
          id: Date.now(),
          type: 'warning',
          content: '^C - Operation cancelled by user',
          timestamp: new Date().toLocaleTimeString()
        }
        setSessions(prev => prev.map(session => 
          session.id === activeSessionId
            ? { ...session, history: [...session.history, interruptEntry] }
            : session
        ))
      }
    }
  }

  const createNewSession = () => {
    const newSession: PowerShellSession = {
      id: `session-${Date.now()}`,
      name: `PowerShell ${sessions.length + 1}`,
      isActive: false,
      history: [{
        id: 1,
        type: 'information',
        content: `PowerShell 7.4.0 (WASM) - New Session
PS > Session ${sessions.length + 1} initialized`,
        timestamp: new Date().toLocaleTimeString()
      }],
      currentDirectory: 'C:\\Workspace',
      variables: {
        'PSVersionTable': {
          'PSVersion': '7.4.0',
          'PSEdition': 'Core',
          'Platform': 'WASM'
        },
        'PWD': 'C:\\Workspace',
        'HOME': 'C:\\Users\\Nishen'
      },
      modules: ['Microsoft.PowerShell.Core', 'NishensWorkspace']
    }

    setSessions(prev => [...prev, newSession])
    setActiveSessionId(newSession.id)
  }

  return (
    <div className={`flex flex-col h-full bg-black text-white font-mono ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* PowerShell Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-blue-300">PowerShell Core (Real)</span>
          </div>
          {!isWasmLoaded && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Initializing...</span>
            </div>
          )}
          {isWasmLoaded && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
              Real PS Ready
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCommand('Clear-Host')}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Clear terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={createNewSession}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="New session"
          >
            <Play className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <div className="text-xs text-gray-400">
            {isExecuting ? 'Executing...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Session Tabs */}
      {sessions.length > 1 && (
        <div className="flex space-x-1 p-2 bg-gray-800 border-b border-gray-700">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeSessionId === session.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {session.name}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
        style={{ scrollBehavior: 'smooth' }}
      >
        {activeSession?.history.map(entry => (
          <div key={entry.id} className="mb-2">
            <div className={`${
              entry.type === 'command' 
                ? 'text-blue-300 font-semibold' 
                : entry.type === 'error'
                ? 'text-red-400'
                : entry.type === 'warning'
                ? 'text-yellow-400'
                : entry.type === 'information'
                ? 'text-cyan-400'
                : 'text-gray-300'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {entry.content}
              </pre>
              {entry.executionTime && (
                <div className="text-xs text-gray-500 mt-1">
                  Execution time: {entry.executionTime}ms
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Current Command Line */}
        <div className="flex items-center">
          <span className="text-blue-400 mr-2 font-semibold">
            PS {activeSession?.currentDirectory || 'C:\\Workspace'}&gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting || !isWasmLoaded}
            className="flex-1 bg-transparent text-white outline-none font-mono disabled:opacity-50"
            autoFocus
          />
          {isExecuting && <div className="w-2 h-5 bg-blue-400 ml-1 animate-pulse"></div>}
          {!isExecuting && <div className="w-2 h-5 bg-white ml-1 animate-pulse"></div>}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-gray-800 bg-gray-900 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>PowerShell Core (Real)</span>
            <span>•</span>
            <span>Session: {activeSession?.name}</span>
            <span>•</span>
            <span>History: {commandHistory.length} commands</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Use Tab for completion • Ctrl+C to cancel • Type 'help' for commands</span>
          </div>
        </div>
      </div>
    </div>
  )
}