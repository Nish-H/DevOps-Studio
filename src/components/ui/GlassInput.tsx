'use client'

import { InputHTMLAttributes } from 'react'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function GlassInput({
  label,
  error,
  className = '',
  ...props
}: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-300 ml-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`glass px-4 py-2 rounded-xl text-white placeholder-gray-500
          focus:outline-none focus:border-purple-500 focus:cosmic-glow-purple
          transition-all duration-300 ${error ? 'border-red-500' : ''} ${className}`}
        style={{
          background: 'rgba(26, 31, 58, 0.5)'
        }}
      />
      {error && (
        <span className="text-xs text-red-400 ml-1">{error}</span>
      )}
    </div>
  )
}
