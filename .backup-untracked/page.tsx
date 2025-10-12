// Google OAuth callback handler
'use client'

import { useEffect } from 'react'

export default function GoogleCallback() {
  useEffect(() => {
    // Extract authorization code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      window.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin)
      window.close()
      return
    }

    if (code) {
      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', code }, window.location.origin)
      } else {
        // If not in popup, redirect to main app
        window.location.href = '/'
      }
      window.close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing Google Drive authentication...</p>
        <p className="text-gray-400 text-sm mt-2">This window will close automatically.</p>
      </div>
    </div>
  )
}