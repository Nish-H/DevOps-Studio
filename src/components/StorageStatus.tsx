/**
 * STORAGE STATUS MONITOR
 * Real-time localStorage usage and health monitoring
 * 
 * CRITICAL: Helps identify storage issues before they cause data loss
 */

'use client'

import { useState, useEffect } from 'react'
import { getStorageStats, isStorageAvailable } from '../lib/storageUtils'
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface StorageStatusProps {
  showDetails?: boolean
}

export default function StorageStatus({ showDetails = false }: StorageStatusProps) {
  const [stats, setStats] = useState({
    used: 0,
    available: 0, 
    percentage: 0,
    keys: 0
  })
  const [isAvailable, setIsAvailable] = useState(false)
  const [workspaceKeys, setWorkspaceKeys] = useState<Array<{key: string, size: number}>>([])

  useEffect(() => {
    const updateStats = () => {
      setIsAvailable(isStorageAvailable())
      setStats(getStorageStats())
      
      if (showDetails && typeof window !== 'undefined') {
        // Get workspace-specific keys
        const keys: Array<{key: string, size: number}> = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('nishen-workspace') || key.includes('devops-studio'))) {
            const value = localStorage.getItem(key) || ''
            keys.push({
              key,
              size: key.length + value.length
            })
          }
        }
        keys.sort((a, b) => b.size - a.size)
        setWorkspaceKeys(keys)
      }
    }

    updateStats()
    
    // Update every 5 seconds if showing details
    if (showDetails) {
      const interval = setInterval(updateStats, 5000)
      return () => clearInterval(interval)
    }
  }, [showDetails])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (): string => {
    if (!isAvailable) return 'text-red-400'
    if (stats.percentage > 80) return 'text-red-400'
    if (stats.percentage > 60) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusIcon = () => {
    if (!isAvailable) return <AlertTriangle className="w-4 h-4" />
    if (stats.percentage > 80) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  if (!showDetails) {
    // Compact display
    return (
      <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>
          {isAvailable ? `${stats.percentage}% used` : 'Storage unavailable'}
        </span>
      </div>
    )
  }

  // Detailed display
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">Storage Status</h3>
      </div>

      {!isAvailable ? (
        <div className="bg-red-900/20 border border-red-600/30 rounded p-3">
          <div className="flex items-center space-x-2 text-red-300">
            <AlertTriangle className="w-4 h-4" />
            <span>localStorage is not available</span>
          </div>
          <p className="text-sm text-red-400 mt-2">
            This could be due to private browsing mode or browser restrictions.
          </p>
        </div>
      ) : (
        <>
          {/* Usage Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Usage</span>
              <span className={getStatusColor()}>{stats.percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  stats.percentage > 80 ? 'bg-red-500' :
                  stats.percentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(stats.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatBytes(stats.used)} used</span>
              <span>{formatBytes(stats.available)} available</span>
            </div>
          </div>

          {/* Storage Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Total Keys:</span>
              <span className="text-white">{stats.keys}</span>
            </div>
            
            {workspaceKeys.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Workspace Keys</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {workspaceKeys.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-400 truncate max-w-48">
                        {item.key}
                      </span>
                      <span className="text-gray-300 ml-2">
                        {formatBytes(item.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {stats.percentage > 80 && (
            <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded p-3">
              <div className="flex items-center space-x-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Storage Almost Full</span>
              </div>
              <p className="text-xs text-red-400 mt-1">
                Consider cleaning up old data or exporting important information.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}