'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  FileText, 
  Settings, 
  Brain, 
  Folder, 
  History,
  User,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onSectionChange: (section: string) => void
  currentSection: string
}

const menuItems = [
  { id: 'claude-ai', label: 'Claude AI', icon: Brain, color: 'text-neon-red' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'text-burnt-orange' },
  { id: 'files', label: 'Files', icon: Folder, color: 'text-neon-red' },
  { id: 'notes', label: 'Notes', icon: FileText, color: 'text-burnt-orange' },
  { id: 'history', label: 'History', icon: History, color: 'text-neon-red' },
  { id: 'tools', label: 'Tools', icon: Zap, color: 'text-burnt-orange' },
]

const bottomItems = [
  { id: 'profile', label: 'Profile', icon: User, color: 'text-text-muted' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-text-muted' },
]

export default function Sidebar({ onSectionChange, currentSection }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col bg-background-secondary border-r border-border h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-neon-red to-burnt-orange rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Nishen's AI</h1>
              <p className="text-xs text-text-muted">Workspace</p>
            </div>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-hover-bg rounded-md transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-hover-bg group",
                  isActive && "bg-hover-bg border border-neon-red/20 neon-glow-red"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-neon-red" : item.color,
                    "group-hover:text-neon-red-bright"
                  )}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-neon-red" : "text-text-secondary",
                      "group-hover:text-neon-red-bright"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-3">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = currentSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-hover-bg group",
                  isActive && "bg-hover-bg"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-burnt-orange" : item.color,
                    "group-hover:text-burnt-orange-bright"
                  )}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-burnt-orange" : "text-text-secondary",
                      "group-hover:text-burnt-orange-bright"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}