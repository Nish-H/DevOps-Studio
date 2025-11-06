'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'pink' | 'none'
  onClick?: () => void
}

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = 'none',
  onClick
}: GlassCardProps) {
  const glowClasses = {
    purple: 'cosmic-glow-purple',
    pink: 'cosmic-glow-pink',
    none: ''
  }

  return (
    <div
      className={`glass ${hover ? 'glass-hover cursor-pointer' : ''} ${glowClasses[glow]} ${className}`}
      onClick={onClick}
      style={{
        borderRadius: '12px',
        padding: '1.5rem',
        transition: 'all 0.3s ease'
      }}
    >
      {children}
    </div>
  )
}
