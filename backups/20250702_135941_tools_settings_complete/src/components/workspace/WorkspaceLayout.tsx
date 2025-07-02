'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import ClaudeInterface from '../claude-ai/ClaudeInterface'
import { Terminal, FileText, Settings, Folder, History, User, Zap } from 'lucide-react'

interface WorkspaceLayoutProps {
  children?: React.ReactNode
}

const sectionComponents = {
  'claude-ai': ClaudeInterface,
  'terminal': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <Terminal className="w-16 h-16 text-burnt-orange mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Terminal</h2>
        <p className="text-text-muted">Integrated terminal coming soon...</p>
      </div>
    </div>
  ),
  'files': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <Folder className="w-16 h-16 text-neon-red mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">File Explorer</h2>
        <p className="text-text-muted">File management system coming soon...</p>
      </div>
    </div>
  ),
  'notes': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <FileText className="w-16 h-16 text-burnt-orange mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Notes</h2>
        <p className="text-text-muted">Note-taking system coming soon...</p>
      </div>
    </div>
  ),
  'history': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <History className="w-16 h-16 text-neon-red mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">History</h2>
        <p className="text-text-muted">Command and session history coming soon...</p>
      </div>
    </div>
  ),
  'tools': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <Zap className="w-16 h-16 text-burnt-orange mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Tools</h2>
        <p className="text-text-muted">Integration tools and utilities coming soon...</p>
      </div>
    </div>
  ),
  'profile': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Profile</h2>
        <p className="text-text-muted">User profile and preferences coming soon...</p>
      </div>
    </div>
  ),
  'settings': () => (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <Settings className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
        <p className="text-text-muted">Workspace configuration coming soon...</p>
      </div>
    </div>
  ),
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [currentSection, setCurrentSection] = useState('claude-ai')

  const CurrentComponent = sectionComponents[currentSection as keyof typeof sectionComponents]

  return (
    <div className="flex h-screen bg-background text-white">
      <Sidebar 
        onSectionChange={setCurrentSection} 
        currentSection={currentSection} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {CurrentComponent && <CurrentComponent />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}