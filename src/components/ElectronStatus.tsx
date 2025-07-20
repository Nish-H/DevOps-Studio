'use client'

import { useState, useEffect } from 'react'

export default function ElectronStatus() {
  const [isElectron, setIsElectron] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkElectron = () => {
      const electronCheck = typeof window !== 'undefined' && (window as any).electronAPI
      console.log('Electron check:', !!electronCheck)
      return !!electronCheck
    }
    
    // Initial check
    let isElectronDetected = checkElectron()
    setIsElectron(isElectronDetected)
    
    // Retry after a short delay if not detected (for production timing issues)
    if (!isElectronDetected) {
      setTimeout(() => {
        isElectronDetected = checkElectron()
        setIsElectron(isElectronDetected)
      }, 100)
    }
  }, [])

  // Don't render anything until after hydration
  if (!mounted) {
    return (
      <span className="ml-2 px-2 py-1 bg-gray-600 text-white text-xs rounded">
        Loading...
      </span>
    )
  }

  if (isElectron === null) {
    return (
      <span className="ml-2 px-2 py-1 bg-gray-600 text-white text-xs rounded">
        Detecting...
      </span>
    )
  }

  return (
    <>
      {isElectron ? (
        <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
          CLI Ready
        </span>
      ) : (
        <span className="ml-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">
          Web Demo
        </span>
      )}
    </>
  )
}