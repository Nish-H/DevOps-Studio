'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Play, Square, Trash2, Plus, Download, Upload, Settings, Clock, Cpu, MemoryStick, HardDrive, Activity, RefreshCw, Folder, Search, History, Star, Copy } from 'lucide-react'

interface PowerShellSession {
  id: string
  name: string
  status: 'active' | 'idle' | 'running' | 'stopped'
  lastCommand: string
  startTime: string
  output: string[]
  workingDirectory: string
  history: string[]
  isFavorite: boolean
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  processes: number
  uptime: string
  lastUpdate: string
}

interface ExecutionResult {
  command: string
  output: string
  exitCode: number
  duration: number
  timestamp: string
}

export default function PowerShellManager() {
  const [sessions, setSessions] = useState<PowerShellSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [currentCommand, setCurrentCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [showMetrics, setShowMetrics] = useState(true)
  const [searchHistory, setSearchHistory] = useState('')
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [favoriteCommands, setFavoriteCommands] = useState<string[]>([])
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([])

  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize component
  useEffect(() => {
    loadSessions()
    loadSettings()
    startMetricsUpdate()

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Auto-scroll terminal output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [sessions])

  const loadSessions = () => {
    const savedSessions = localStorage.getItem('nishen-workspace-powershell-sessions')
    const savedHistory = localStorage.getItem('nishen-workspace-powershell-history')
    const savedFavorites = localStorage.getItem('nishen-workspace-powershell-favorites')
    const savedResults = localStorage.getItem('nishen-workspace-powershell-results')

    let processedSessions: PowerShellSession[] = []
    let processedHistory: string[] = []
    let processedFavorites: string[] = []
    let processedResults: ExecutionResult[] = []

    if (savedSessions) {
      processedSessions = JSON.parse(savedSessions)
    }

    if (savedHistory) {
      processedHistory = JSON.parse(savedHistory)
    }

    if (savedFavorites) {
      processedFavorites = JSON.parse(savedFavorites)
    }

    if (savedResults) {
      processedResults = JSON.parse(savedResults)
    }

    // Create default session if none exist
    if (processedSessions.length === 0) {
      const defaultSession: PowerShellSession = {
        id: 'session-1',
        name: 'PowerShell Session 1',
        status: 'idle',
        lastCommand: '',
        startTime: new Date().toISOString(),
        output: [
          'Windows PowerShell',
          'Copyright (C) Microsoft Corporation. All rights reserved.',
          '',
          'PS C:\\Users\\' + (typeof window !== 'undefined' ? 'Administrator' : 'User') + '> '
        ],
        workingDirectory: 'C:\\Users\\Administrator',
        history: [],
        isFavorite: false
      }
      processedSessions = [defaultSession]
      setActiveSessionId(defaultSession.id)
    } else if (activeSessionId === '') {
      setActiveSessionId(processedSessions[0].id)
    }

    setSessions(processedSessions)
    setCommandHistory(processedHistory)
    setFavoriteCommands(processedFavorites)
    setExecutionResults(processedResults)
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('nishen-workspace-powershell-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setShowMetrics(settings.showMetrics ?? true)
    }
  }

  const saveData = () => {
    localStorage.setItem('nishen-workspace-powershell-sessions', JSON.stringify(sessions))
    localStorage.setItem('nishen-workspace-powershell-history', JSON.stringify(commandHistory))
    localStorage.setItem('nishen-workspace-powershell-favorites', JSON.stringify(favoriteCommands))
    localStorage.setItem('nishen-workspace-powershell-results', JSON.stringify(executionResults))
  }

  const startMetricsUpdate = () => {
    const updateMetrics = () => {
      // Simulate system metrics (in real implementation, this would come from actual system monitoring)
      const metrics: SystemMetrics = {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: 45 + Math.floor(Math.random() * 20),
        processes: 150 + Math.floor(Math.random() * 50),
        uptime: '2d 14h 32m',
        lastUpdate: new Date().toLocaleTimeString()
      }
      setSystemMetrics(metrics)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }

  const createNewSession = () => {
    const newSession: PowerShellSession = {
      id: `session-${Date.now()}`,
      name: `PowerShell Session ${sessions.length + 1}`,
      status: 'idle',
      lastCommand: '',
      startTime: new Date().toISOString(),
      output: [
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '',
        'PS C:\\Users\\Administrator> '
      ],
      workingDirectory: 'C:\\Users\\Administrator',
      history: [],
      isFavorite: false
    }

    const updatedSessions = [...sessions, newSession]
    setSessions(updatedSessions)
    setActiveSessionId(newSession.id)
  }

  const executeCommand = async (command: string) => {
    if (!command.trim() || !activeSessionId) return

    setIsExecuting(true)
    const startTime = Date.now()

    // Update session with command execution
    const updatedSessions = sessions.map(session => {
      if (session.id === activeSessionId) {
        const updatedOutput = [
          ...session.output,
          `PS ${session.workingDirectory}> ${command}`
        ]

        // Simulate command execution and output
        const simulatedOutput = simulateCommandExecution(command)
        updatedOutput.push(...simulatedOutput)
        updatedOutput.push(`PS ${session.workingDirectory}> `)

        return {
          ...session,
          lastCommand: command,
          output: updatedOutput,
          history: [...session.history, command],
          status: 'idle' as const
        }
      }
      return session
    })

    setSessions(updatedSessions)

    // Update global command history
    const updatedHistory = [command, ...commandHistory.filter(cmd => cmd !== command)].slice(0, 100)
    setCommandHistory(updatedHistory)

    // Add to execution results
    const result: ExecutionResult = {
      command,
      output: simulateCommandExecution(command).join('\\n'),
      exitCode: 0,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
    setExecutionResults([result, ...executionResults.slice(0, 49)])

    setCurrentCommand('')
    setHistoryIndex(-1)
    setIsExecuting(false)
    saveData()
  }

  const simulateCommandExecution = (command: string): string[] => {
    const cmd = command.toLowerCase().trim()

    if (cmd === 'get-process') {
      return [
        '',
        'Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName',
        '-------  ------    -----      -----     ------     --  -- -----------',
        '    463      25    12124      15896       2.34   1234   1 chrome',
        '    234      15     8456      10234       1.12   5678   1 notepad',
        '    567      35    45678      52341      15.67   9012   0 powershell',
        '    123      10     4567       6789       0.45   3456   1 explorer',
        ''
      ]
    }

    if (cmd === 'get-service') {
      return [
        '',
        'Status   Name               DisplayName',
        '------   ----               -----------',
        'Running  Appinfo            Application Information',
        'Stopped  ALG                Application Layer Gateway Service',
        'Running  AudioSrv           Windows Audio',
        'Running  BITS               Background Intelligent Transfer Ser...',
        'Running  BrokerInfrastructure Background Tasks Infrastructure Ser...',
        ''
      ]
    }

    if (cmd.startsWith('get-childitem') || cmd === 'dir' || cmd === 'ls') {
      return [
        '',
        '    Directory: C:\\Users\\Administrator',
        '',
        'Mode                 LastWriteTime         Length Name',
        '----                 -------------         ------ ----',
        'd-----        9/29/2025   1:23 AM                Desktop',
        'd-----        9/29/2025   1:23 AM                Documents',
        'd-----        9/29/2025   1:23 AM                Downloads',
        'd-----        9/29/2025   1:23 AM                Pictures',
        '-a----        9/28/2025   3:45 PM           1024 test.txt',
        '-a----        9/27/2025   2:30 PM           2048 script.ps1',
        ''
      ]
    }

    if (cmd === 'get-computerinfo') {
      return [
        '',
        'WindowsProductName          : Windows 11 Pro',
        'WindowsVersion              : 2009',
        'WindowsInstallDateFromRegistry : 1/15/2025 10:30:00 AM',
        'TotalPhysicalMemory         : 17179869184',
        'CsProcessors                : {Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz}',
        'CsNetworkAdapters           : {Ethernet, Wi-Fi}',
        ''
      ]
    }

    if (cmd === 'get-date') {
      return ['', new Date().toString(), '']
    }

    if (cmd === 'get-location' || cmd === 'pwd') {
      return ['', 'C:\\Users\\Administrator', '']
    }

    if (cmd === 'help' || cmd === 'get-help') {
      return [
        '',
        'TOPIC',
        '    Windows PowerShell Help System',
        '',
        'SHORT DESCRIPTION',
        '    Displays help about Windows PowerShell cmdlets and concepts.',
        '',
        'LONG DESCRIPTION',
        '    Windows PowerShell Help displays help about Windows PowerShell',
        '    cmdlets, providers, aliases, functions, scripts, and modules.',
        '',
        'EXAMPLES',
        '    Get-Help Get-Process',
        '    Get-Help about_Variables',
        ''
      ]
    }

    if (cmd === 'clear' || cmd === 'cls') {
      // This would clear the terminal in a real implementation
      return ['']
    }

    // Default response for unknown commands
    return [
      '',
      `The term '${command}' is not recognized as the name of a cmdlet, function, script file, or operable program.`,
      'Check the spelling of the name, or if a path was included, verify that the path is correct and try again.',
      ''
    ]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand('')
      }
    }
  }

  const closeSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId)
    setSessions(updatedSessions)

    if (activeSessionId === sessionId && updatedSessions.length > 0) {
      setActiveSessionId(updatedSessions[0].id)
    } else if (updatedSessions.length === 0) {
      createNewSession()
    }
  }

  const addToFavorites = (command: string) => {
    if (!favoriteCommands.includes(command)) {
      const updatedFavorites = [...favoriteCommands, command]
      setFavoriteCommands(updatedFavorites)
      saveData()
    }
  }

  const executeFromHistory = (command: string) => {
    setCurrentCommand(command)
    executeCommand(command)
  }

  const activeSession = sessions.find(session => session.id === activeSessionId)

  const filteredHistory = commandHistory.filter(command =>
    command.toLowerCase().includes(searchHistory.toLowerCase())
  )

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-accent)' }}>
            Nishen's AI Workspace v0.1.1 - PowerShell Manager
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={createNewSession}
              className="flex items-center space-x-1 px-3 py-2 text-white rounded-lg text-sm transition-colors"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Metrics */}
        {showMetrics && systemMetrics && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-300">System Metrics</h3>
              <button
                onClick={() => setShowMetrics(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>CPU</span>
                </div>
                <span className={systemMetrics.cpu > 80 ? 'text-red-400' : 'text-green-400'}>
                  {systemMetrics.cpu}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span>Memory</span>
                </div>
                <span className={systemMetrics.memory > 80 ? 'text-red-400' : 'text-green-400'}>
                  {systemMetrics.memory}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-yellow-400" />
                  <span>Disk</span>
                </div>
                <span>{systemMetrics.disk}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span>Processes</span>
                </div>
                <span>{systemMetrics.processes}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Uptime: {systemMetrics.uptime}
              </div>
            </div>
          </div>
        )}

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-300 mb-3">Active Sessions</h3>
            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    activeSessionId === session.id
                      ? 'border-[var(--primary-accent)] bg-gray-800'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4" />
                      <span className="font-medium">{session.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          session.status === 'active' ? 'bg-green-400' :
                          session.status === 'running' ? 'bg-yellow-400' :
                          session.status === 'stopped' ? 'bg-red-400' : 'bg-gray-400'
                        }`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          closeSession(session.id)
                        }}
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>Directory: {session.workingDirectory}</div>
                    {session.lastCommand && (
                      <div className="truncate">Last: {session.lastCommand}</div>
                    )}
                    <div>Started: {new Date(session.startTime).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Favorites */}
        {favoriteCommands.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <h3 className="font-semibold text-gray-300 mb-3">Favorite Commands</h3>
            <div className="space-y-1">
              {favoriteCommands.slice(0, 5).map((command, index) => (
                <button
                  key={index}
                  onClick={() => executeFromHistory(command)}
                  className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
                >
                  <code className="text-blue-400">{command}</code>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Terminal Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-white">
                {activeSession?.name || 'No Active Session'}
              </h2>
              {activeSession && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Folder className="w-4 h-4" />
                  <span>{activeSession.workingDirectory}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (activeSession) {
                    const updatedSessions = sessions.map(session =>
                      session.id === activeSession.id
                        ? { ...session, output: ['PS ' + session.workingDirectory + '> '] }
                        : session
                    )
                    setSessions(updatedSessions)
                  }
                }}
                className="p-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                title="Clear Terminal"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="p-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                title="Toggle Metrics"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {activeSession?.output.map((line, index) => (
                <div key={index} className={line.startsWith('PS ') ? 'text-green-400' : 'text-gray-300'}>
                  {line}
                </div>
              ))}
            </div>

            {/* Command Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-mono">
                  PS {activeSession?.workingDirectory || 'C:\\'}{'>'}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isExecuting}
                  className="flex-1 bg-transparent text-white font-mono outline-none"
                  placeholder={isExecuting ? 'Executing...' : 'Enter PowerShell command...'}
                />
                <button
                  onClick={() => executeCommand(currentCommand)}
                  disabled={isExecuting || !currentCommand.trim()}
                  className="p-2 text-white rounded transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* History Panel */}
          {showHistoryPanel && (
            <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Command History</h3>
                  <button
                    onClick={() => setShowHistoryPanel(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredHistory.map((command, index) => (
                    <div
                      key={index}
                      className="group p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-blue-400 text-sm flex-1 truncate">{command}</code>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => executeFromHistory(command)}
                            className="p-1 text-gray-400 hover:text-green-400"
                            title="Execute"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setCurrentCommand(command)}
                            className="p-1 text-gray-400 hover:text-blue-400"
                            title="Copy to input"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => addToFavorites(command)}
                            className="p-1 text-gray-400 hover:text-yellow-400"
                            title="Add to favorites"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredHistory.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      {searchHistory ? 'No matching commands found' : 'No command history yet'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}