'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong!</h2>
        <p className="text-gray-300 mb-6">An error occurred while loading the workspace.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}