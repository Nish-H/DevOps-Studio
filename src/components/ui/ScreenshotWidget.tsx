'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, Upload, Trash2, Edit3, Copy, Download, FileDown, Package, Info, Database } from 'lucide-react'
import screenshotManager, { ScreenshotData } from '@/lib/screenshotManager'
import advancedStorage from '@/lib/advancedStorage'

interface ScreenshotWidgetProps {
  section: string
  parentId?: string
  onScreenshotAdded?: (screenshot: ScreenshotData) => void
  onScreenshotDeleted?: (screenshotId: string) => void
  className?: string
}

export const ScreenshotWidget: React.FC<ScreenshotWidgetProps> = ({
  section,
  parentId,
  onScreenshotAdded,
  onScreenshotDeleted,
  className = ''
}) => {
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [tempNotes, setTempNotes] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load screenshots on component mount
  React.useEffect(() => {
    loadScreenshots()
  }, [section, parentId])

  const loadScreenshots = useCallback(() => {
    const loadedScreenshots = screenshotManager.getScreenshots(section, parentId)
    setScreenshots(loadedScreenshots)
  }, [section, parentId])

  // Handle clipboard paste
  const handleClipboardPaste = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Starting clipboard paste...')
      const screenshot = await screenshotManager.processClipboardImage()
      if (screenshot) {
        console.log('Screenshot processed, saving...')
        const saved = await screenshotManager.saveScreenshot(screenshot, section, parentId)
        if (saved) {
          loadScreenshots()
          onScreenshotAdded?.(screenshot)
          console.log('Screenshot saved successfully')
        } else {
          alert('Failed to save screenshot: Storage space exceeded. Some old screenshots may have been removed.')
          loadScreenshots() // Reload to show current state
        }
      } else {
        alert('No image found in clipboard. Please copy an image first.')
      }
    } catch (error) {
      console.error('Failed to paste screenshot:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to paste screenshot: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [section, parentId, onScreenshotAdded, loadScreenshots])

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const screenshot = await screenshotManager.processFileInput(file)
      if (screenshot) {
        const saved = await screenshotManager.saveScreenshot(screenshot, section, parentId)
        if (saved) {
          loadScreenshots()
          onScreenshotAdded?.(screenshot)
        } else {
          alert('Failed to save screenshot: Storage space exceeded. Some old screenshots may have been removed.')
          loadScreenshots() // Reload to show current state
        }
      }
    } catch (error) {
      console.error('Failed to upload screenshot:', error)
      alert('Failed to upload screenshot. Please try again.')
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [section, parentId, onScreenshotAdded, loadScreenshots])

  // Handle notes update
  const handleNotesUpdate = useCallback((screenshotId: string, notes: string) => {
    screenshotManager.updateScreenshotNotes(screenshotId, section, notes)
    loadScreenshots()
    setEditingNotes(null)
    setTempNotes('')
  }, [section, loadScreenshots])

  // Handle screenshot deletion
  const handleDelete = useCallback((screenshotId: string) => {
    if (confirm('Are you sure you want to delete this screenshot?')) {
      screenshotManager.deleteScreenshot(screenshotId, section)
      loadScreenshots()
      onScreenshotDeleted?.(screenshotId)
    }
  }, [section, onScreenshotDeleted, loadScreenshots])

  // Handle copy image to clipboard
  const handleCopyImage = useCallback(async (imageData: string) => {
    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('Image copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy image:', error)
      alert('Failed to copy image to clipboard.')
    }
  }, [])

  // Handle download image
  const handleDownloadImage = useCallback((imageData: string, screenshotId: string) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = `screenshot-${screenshotId}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Handle export screenshots data
  const handleExportScreenshots = useCallback(() => {
    const exportData = screenshotManager.exportScreenshots(section, parentId)
    const blob = new Blob([exportData], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `screenshots-${section}${parentId ? `-${parentId}` : ''}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }, [section, parentId])

  // Handle download all images as ZIP (simplified export)
  const handleDownloadAllImages = useCallback(() => {
    screenshots.forEach((screenshot, index) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = screenshot.imageData
        link.download = `${section}-screenshot-${index + 1}-${screenshot.id.slice(-8)}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, index * 500) // Stagger downloads
    })
  }, [screenshots, section])

  // Handle migration to IndexedDB
  const handleMigrateToIndexedDB = useCallback(async () => {
    if (!confirm('Migrate screenshots to IndexedDB for more storage space? This may take a moment.')) {
      return
    }

    setIsLoading(true)
    try {
      const result = await advancedStorage.migrateToIndexedDB()
      loadScreenshots()
      alert(`Migration complete! Migrated ${result.migrated} screenshot collections. ${result.errors ? `${result.errors} errors encountered.` : ''}`)
    } catch (error) {
      console.error('Migration failed:', error)
      alert('Migration failed. Please try again or use manual cleanup.')
    } finally {
      setIsLoading(false)
    }
  }, [loadScreenshots])

  // Setup keyboard shortcuts for paste
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v' && event.shiftKey) {
        event.preventDefault()
        handleClipboardPaste()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClipboardPaste])

  return (
    <div className={`screenshot-widget ${className}`}>
      {/* Screenshot Controls */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <button
          onClick={handleClipboardPaste}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
          title="Paste from clipboard (Ctrl+Shift+V)"
        >
          <Camera className="w-4 h-4" />
          {isLoading ? 'Processing...' : 'Paste Screenshot'}
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-md transition-colors"
          title="Upload image file"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {screenshots.length > 0 && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleExportScreenshots}
              className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
              title="Export screenshots metadata as JSON"
            >
              <FileDown className="w-3 h-3" />
              Export Data
            </button>
            
            <button
              onClick={handleDownloadAllImages}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              title="Download all images"
            >
              <Package className="w-3 h-3" />
              Download All
            </button>

            <button
              onClick={handleMigrateToIndexedDB}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              title="Migrate to IndexedDB for more storage (50MB+)"
            >
              <Database className="w-3 h-3" />
              More Storage
            </button>
          </div>
        )}

        <div className="text-xs text-gray-400 ml-auto">
          Standard size: 400×300px (optimized for storage)
        </div>
      </div>

      {/* Screenshots Grid */}
      {screenshots.length > 0 && (
        <div className="space-y-4">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="screenshot-item flex gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              {/* Screenshot Image */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <img
                    src={screenshot.imageData}
                    alt="Screenshot"
                    className="w-48 h-36 object-cover rounded-md border border-gray-600"
                    style={{ 
                      width: `${screenshot.dimensions.standardWidth / 4}px`,
                      height: `${screenshot.dimensions.standardHeight / 4}px`
                    }}
                  />
                  
                  {/* Image Controls Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopyImage(screenshot.imageData)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadImage(screenshot.imageData, screenshot.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-full text-white"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(screenshot.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
                      title="Delete screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {new Date(screenshot.timestamp).toLocaleDateString()}
                </div>
              </div>

              {/* Notes Section */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-white">Notes & Reminders</h4>
                  {editingNotes !== screenshot.id && (
                    <button
                      onClick={() => {
                        setEditingNotes(screenshot.id)
                        setTempNotes(screenshot.notes)
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Edit notes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {editingNotes === screenshot.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add notes or reminders for this screenshot..."
                      className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md text-white resize-none focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNotesUpdate(screenshot.id, tempNotes)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(null)
                          setTempNotes('')
                        }}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`p-3 bg-gray-900 border border-gray-600 rounded-md min-h-[96px] ${
                      screenshot.notes ? 'text-white' : 'text-gray-500 italic'
                    }`}
                  >
                    {screenshot.notes || 'Click edit to add notes or reminders...'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {screenshots.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No screenshots yet</p>
          <p className="text-sm">Use Ctrl+Shift+V to paste or click Upload to add images</p>
        </div>
      )}
    </div>
  )
}

export default ScreenshotWidget