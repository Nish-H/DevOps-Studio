'use client'

import { useState, useEffect } from 'react'

export default function ElectronDescription() {
  const [isElectron, setIsElectron] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const checkElectron = () => {
      const electronCheck = typeof window !== 'undefined' && (window as any).electronAPI
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
    return <span>Loading environment...</span>
  }

  if (isElectron === null) {
    return <span>Detecting environment...</span>
  }

  return (
    <span>
      {isElectron 
        ? 'Full Claude CLI integration with real command execution' 
        : 'Simulated responses - desktop app required for full functionality'
      }
    </span>
  )
}