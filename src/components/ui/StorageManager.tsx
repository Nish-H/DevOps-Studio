'use client'

import React, { useState, useEffect } from 'react'
import { HardDrive, Trash2, AlertTriangle, CheckCircle, RefreshCw, Download } from 'lucide-react'
import storageCleanup, { StorageStats } from '@/lib/storageCleanup'

interface StorageManagerProps {
  onClose?: () => void
}

export const StorageManager: React.FC<StorageManagerProps> = ({ onClose }) => {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastCleanup, setLastCleanup] = useState<string | null>(null)

  useEffect(() => {
    refreshStats()
  }, [])

  const refreshStats = () => {
    const currentStats = storageCleanup.getStorageStats()
    setStats(currentStats)
  }

  const handleCleanupScreenshots = async () => {
    setIsLoading(true)
    try {
      const cleaned = storageCleanup.cleanupAllScreenshots(5)
      setLastCleanup(`Cleaned up ${cleaned} old screenshots`)
      refreshStats()
    } catch (error) {
      setLastCleanup('Cleanup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanupBackups = async () => {
    setIsLoading(true)
    try {
      const cleaned = storageCleanup.cleanupBackupData()
      setLastCleanup(`Cleaned up ${cleaned} backup items`)
      refreshStats()
    } catch (error) {
      setLastCleanup('Backup cleanup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmergencyCleanup = async () => {
    if (!confirm('Emergency cleanup will remove old screenshots and backup data. Continue?')) {
      return
    }

    setIsLoading(true)
    try {
      const result = storageCleanup.emergencyCleanup()
      setLastCleanup(`Emergency cleanup: ${result.screenshots} screenshots, ${result.backups} backups, ${result.other} other items removed`)
      refreshStats()
    } catch (error) {
      setLastCleanup('Emergency cleanup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = () => {
    const report = storageCleanup.generateStorageReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `storage-report-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />
      default: return <HardDrive className="w-5 h-5 text-gray-400" />
    }
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const health = storageCleanup.getStorageHealth()
  const screenshotUsage = storageCleanup.getScreenshotStorageUsage()

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Storage Manager</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getHealthIcon(health)}
            <span className={`font-medium ${getHealthColor(health)}`}>
              {health.toUpperCase()}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            <div>Used: {storageCleanup.formatBytes(stats.used)}</div>
            <div>Available: {storageCleanup.formatBytes(stats.available)}</div>
            <div>Usage: {stats.percentage.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-white mb-2">Screenshot Storage</h3>
          <div className="text-sm text-gray-300 space-y-1">
            {Object.entries(screenshotUsage).map(([section, size]) => (
              <div key={section} className="flex justify-between">
                <span className="capitalize">{section}:</span>
                <span>{storageCleanup.formatBytes(size)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storage Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Storage Usage</span>
          <span>{stats.percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              health === 'critical' ? 'bg-red-500' :
              health === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Cleanup Actions */}
      <div className="space-y-3 mb-4">
        <button
          onClick={handleCleanupScreenshots}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clean Up Old Screenshots (Keep 5 per section)
        </button>

        <button
          onClick={handleCleanupBackups}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clean Up Backup Data
        </button>

        {health === 'critical' && (
          <button
            onClick={handleEmergencyCleanup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Cleanup (Keep 2 screenshots per section)
          </button>
        )}
      </div>

      {/* Action Results */}
      {lastCleanup && (
        <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg mb-4">
          <p className="text-sm text-green-300">{lastCleanup}</p>
        </div>
      )}

      {/* Additional Actions */}
      <div className="flex gap-2">
        <button
          onClick={refreshStats}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>

        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {/* Warning Messages */}
      {health === 'critical' && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-sm text-red-300">
            ⚠️ Critical: Storage is nearly full. Screenshots may fail to save. Please clean up immediately.
          </p>
        </div>
      )}

      {health === 'warning' && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-sm text-yellow-300">
            ⚠️ Warning: Storage usage is high. Consider cleanup soon to avoid issues.
          </p>
        </div>
      )}
    </div>
  )
}

export default StorageManager