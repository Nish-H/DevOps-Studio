'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  Monitor, 
  Network, 
  Shield, 
  HardDrive, 
  Cpu, 
  Wifi, 
  Lock, 
  Activity, 
  Terminal as TerminalIcon,
  Server,
  Database,
  Eye,
  RefreshCw,
  Play,
  Square,
  Settings,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Layers,
  FileSearch,
  Hash,
  Key,
  Scan,
  Bug,
  Wrench
} from 'lucide-react'

interface SystemInfo {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  processes: number
}

interface Tool {
  id: string
  name: string
  description: string
  category: 'system' | 'network' | 'security' | 'monitoring' | 'utilities'
  icon: React.ReactNode
  status: 'idle' | 'running' | 'success' | 'error'
  lastRun?: Date
  result?: string
}

export default function Tools() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: '0h 0m',
    processes: 0
  })
  
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [runningTools, setRunningTools] = useState<Set<string>>(new Set())
  const [showSystemMonitor, setShowSystemMonitor] = useState(true)

  // Simulate system monitoring
  useEffect(() => {
    const updateSystemInfo = () => {
      setSystemInfo(prev => ({
        cpu: Math.floor(Math.random() * 40) + 20, // 20-60%
        memory: Math.floor(Math.random() * 30) + 40, // 40-70%
        disk: Math.floor(Math.random() * 20) + 65, // 65-85%
        network: Math.floor(Math.random() * 100) + 50, // 50-150 Mbps
        uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        processes: Math.floor(Math.random() * 50) + 120 // 120-170 processes
      }))
    }

    updateSystemInfo()
    const interval = setInterval(updateSystemInfo, 3000)
    return () => clearInterval(interval)
  }, [])

  // Initialize tools
  useEffect(() => {
    const initialTools: Tool[] = [
      // System Tools
      {
        id: 'system-health',
        name: 'System Health Check',
        description: 'Comprehensive system diagnostics and health assessment',
        category: 'system',
        icon: <Activity className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'disk-analyzer',
        name: 'Disk Space Analyzer',
        description: 'Analyze disk usage and find large files consuming space',
        category: 'system',
        icon: <HardDrive className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'process-monitor',
        name: 'Process Monitor',
        description: 'Monitor running processes and resource consumption',
        category: 'monitoring',
        icon: <Cpu className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'memory-optimizer',
        name: 'Memory Optimizer',
        description: 'Clean up memory and optimize system performance',
        category: 'system',
        icon: <Zap className="w-5 h-5" />,
        status: 'idle'
      },
      
      // Network Tools
      {
        id: 'network-scanner',
        name: 'Network Scanner',
        description: 'Scan local network for active devices and open ports',
        category: 'network',
        icon: <Network className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'ping-monitor',
        name: 'Ping Monitor',
        description: 'Monitor network connectivity and latency to multiple hosts',
        category: 'network',
        icon: <Wifi className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'port-scanner',
        name: 'Port Scanner',
        description: 'Scan for open ports on target systems',
        category: 'network',
        icon: <Globe className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'bandwidth-monitor',
        name: 'Bandwidth Monitor',
        description: 'Real-time network bandwidth usage monitoring',
        category: 'monitoring',
        icon: <BarChart3 className="w-5 h-5" />,
        status: 'idle'
      },
      
      // Security Tools
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Perform comprehensive security assessment',
        category: 'security',
        icon: <Shield className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'password-checker',
        name: 'Password Strength Checker',
        description: 'Analyze password policies and strength requirements',
        category: 'security',
        icon: <Key className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'vulnerability-scan',
        name: 'Vulnerability Scanner',
        description: 'Scan system for known vulnerabilities and patches',
        category: 'security',
        icon: <Scan className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'firewall-analyzer',
        name: 'Firewall Analyzer',
        description: 'Analyze firewall rules and security policies',
        category: 'security',
        icon: <Lock className="w-5 h-5" />,
        status: 'idle'
      },
      
      // Monitoring Tools
      {
        id: 'log-analyzer',
        name: 'Log Analyzer',
        description: 'Parse and analyze system logs for anomalies',
        category: 'monitoring',
        icon: <FileSearch className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'event-monitor',
        name: 'Event Monitor',
        description: 'Real-time Windows Event Log monitoring',
        category: 'monitoring',
        icon: <Eye className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'service-monitor',
        name: 'Service Monitor',
        description: 'Monitor Windows services and their status',
        category: 'monitoring',
        icon: <Server className="w-5 h-5" />,
        status: 'idle'
      },
      
      // Utility Tools
      {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA-1, SHA-256 hashes for files',
        category: 'utilities',
        icon: <Hash className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'registry-cleaner',
        name: 'Registry Cleaner',
        description: 'Clean and optimize Windows registry entries',
        category: 'utilities',
        icon: <Database className="w-5 h-5" />,
        status: 'idle'
      },
      {
        id: 'startup-manager',
        name: 'Startup Manager',
        description: 'Manage Windows startup programs and services',
        category: 'utilities',
        icon: <Settings className="w-5 h-5" />,
        status: 'idle'
      }
    ]
    
    setTools(initialTools)
  }, [])

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Wrench className="w-4 h-4" />, count: tools.length },
    { id: 'system', name: 'System', icon: <Monitor className="w-4 h-4" />, count: tools.filter(t => t.category === 'system').length },
    { id: 'network', name: 'Network', icon: <Network className="w-4 h-4" />, count: tools.filter(t => t.category === 'network').length },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" />, count: tools.filter(t => t.category === 'security').length },
    { id: 'monitoring', name: 'Monitoring', icon: <Activity className="w-4 h-4" />, count: tools.filter(t => t.category === 'monitoring').length },
    { id: 'utilities', name: 'Utilities', icon: <Zap className="w-4 h-4" />, count: tools.filter(t => t.category === 'utilities').length }
  ]

  const runTool = async (toolId: string) => {
    setRunningTools(prev => new Set([...prev, toolId]))
    setTools(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, status: 'running' } : tool
    ))

    // Simulate tool execution
    setTimeout(() => {
      const success = Math.random() > 0.2 // 80% success rate
      const results = [
        'Scan completed successfully. No issues found.',
        'Analysis complete. 15 optimizations applied.',
        'Monitoring active. 127 processes tracked.',
        'Security check passed. System is secure.',
        'Network scan found 12 active devices.',
        'Performance optimization completed.',
        'Log analysis found 3 warnings, 0 errors.',
        'Memory cleaned. 2.3GB freed.',
        'Disk analysis complete. 45GB can be freed.',
        'Port scan complete. 3 open ports detected.'
      ]
      
      setTools(prev => prev.map(tool => 
        tool.id === toolId 
          ? { 
              ...tool, 
              status: success ? 'success' : 'error',
              lastRun: new Date(),
              result: success ? results[Math.floor(Math.random() * results.length)] : 'Tool execution failed. Check system logs.'
            } 
          : tool
      ))
      
      setRunningTools(prev => {
        const newSet = new Set(prev)
        newSet.delete(toolId)
        return newSet
      })
    }, Math.random() * 3000 + 2000) // 2-5 seconds
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-neon-green" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-neon-green" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Play className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-neon-green bg-neon-green/10'
      case 'success':
        return 'border-neon-green bg-neon-green/5'
      case 'error':
        return 'border-red-400 bg-red-400/5'
      default:
        return 'border-gray-700 bg-gray-800'
    }
  }

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory)

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar - Categories & System Monitor */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neon-red flex items-center">
              <Zap className="w-5 h-5 mr-2 text-neon-green neon-pulse" />
              System Tools
            </h2>
            <div className="text-xs text-neon-green neon-text-green font-mono">
              {runningTools.size} active
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-300">Categories</span>
              <div className="text-xs text-neon-green">{filteredTools.length} tools</div>
            </div>
            
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-2 rounded text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/40' 
                      : 'text-gray-300 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    {category.icon}
                    <span className="ml-2">{category.name}</span>
                  </div>
                  <span className="text-xs">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Monitor */}
        {showSystemMonitor && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neon-green flex items-center">
                <Monitor className="w-4 h-4 mr-2" />
                System Monitor
              </h3>
              <button
                onClick={() => setShowSystemMonitor(false)}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Hide
              </button>
            </div>
            
            <div className="space-y-3">
              {/* CPU */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">CPU</span>
                  <span className="text-neon-green">{systemInfo.cpu}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-neon-green to-neon-green-bright transition-all duration-1000"
                    style={{ width: `${systemInfo.cpu}%` }}
                  />
                </div>
              </div>
              
              {/* Memory */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Memory</span>
                  <span className="text-burnt-orange">{systemInfo.memory}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-burnt-orange to-burnt-orange-bright transition-all duration-1000"
                    style={{ width: `${systemInfo.memory}%` }}
                  />
                </div>
              </div>
              
              {/* Disk */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">Disk</span>
                  <span className="text-neon-red">{systemInfo.disk}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-neon-red to-neon-red-bright transition-all duration-1000"
                    style={{ width: `${systemInfo.disk}%` }}
                  />
                </div>
              </div>
              
              {/* Network */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 flex items-center">
                    <Wifi className="w-3 h-3 mr-1" />
                    Network
                  </span>
                  <span className="text-neon-green">{systemInfo.network} Mbps</span>
                </div>
              </div>
              
              {/* System Info */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700 text-xs">
                <div>
                  <span className="text-gray-400">Uptime</span>
                  <div className="text-white font-mono">{systemInfo.uptime}</div>
                </div>
                <div>
                  <span className="text-gray-400">Processes</span>
                  <div className="text-white font-mono">{systemInfo.processes}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-2 bg-neon-green/10 border border-neon-green/30 rounded text-neon-green text-sm hover:bg-neon-green/20 transition-colors">
              <Activity className="w-4 h-4 inline mr-2" />
              System Scan
            </button>
            <button className="w-full p-2 bg-neon-red/10 border border-neon-red/30 rounded text-neon-red text-sm hover:bg-neon-red/20 transition-colors">
              <Shield className="w-4 h-4 inline mr-2" />
              Security Check
            </button>
            <button className="w-full p-2 bg-burnt-orange/10 border border-burnt-orange/30 rounded text-burnt-orange text-sm hover:bg-burnt-orange/20 transition-colors">
              <Zap className="w-4 h-4 inline mr-2" />
              Optimize System
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Tools Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {selectedCategory === 'all' ? 'All Tools' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-400">
                Professional system administration and monitoring tools
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-pulse" />
                  <span className="text-neon-green">{tools.filter(t => t.status === 'success').length} completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-neon-green rounded-full mr-2 animate-spin" />
                  <span className="text-gray-400">{runningTools.size} running</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className={`p-6 rounded-lg border transition-all duration-300 hover:scale-105 ${getStatusColor(tool.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      tool.status === 'success' ? 'bg-neon-green/20 text-neon-green' :
                      tool.status === 'running' ? 'bg-neon-green/20 text-neon-green' :
                      tool.status === 'error' ? 'bg-red-400/20 text-red-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{tool.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        tool.category === 'system' ? 'bg-blue-500/20 text-blue-400' :
                        tool.category === 'network' ? 'bg-purple-500/20 text-purple-400' :
                        tool.category === 'security' ? 'bg-red-500/20 text-red-400' :
                        tool.category === 'monitoring' ? 'bg-neon-green/20 text-neon-green' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  
                  {getStatusIcon(tool.status)}
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{tool.description}</p>
                
                {tool.result && (
                  <div className={`p-3 rounded text-xs mb-4 ${
                    tool.status === 'success' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' :
                    'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}>
                    {tool.result}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {tool.lastRun && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Last run: {tool.lastRun.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => runTool(tool.id)}
                    disabled={runningTools.has(tool.id)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      runningTools.has(tool.id)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : tool.status === 'success'
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30'
                        : 'bg-neon-red hover:bg-neon-red-bright text-white'
                    }`}
                  >
                    {runningTools.has(tool.id) ? (
                      <>
                        <RefreshCw className="w-4 h-4 inline mr-1 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 inline mr-1" />
                        Run Tool
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Bug className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-400">No Tools Found</h3>
              <p className="text-gray-500">No tools available in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}