'use client'

import { useState, useEffect } from 'react'
import Terminal from './Terminal'
import Files from './Files'
import Notes from './Notes'

export default function SimpleWorkspace() {
  const [activeSection, setActiveSection] = useState('claude-ai')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Welcome to Nishen's AI Workspace! I'm Claude, ready to help with your system engineering tasks.",
      timestamp: ''
    }
  ])

  // Fix hydration by setting timestamp after mount
  useEffect(() => {
    setMessages(prev => prev.map(msg => 
      msg.id === 1 ? { ...msg, timestamp: new Date().toLocaleTimeString() } : msg
    ))

    // Listen for terminal -> Claude AI switching
    const handleSwitchToClaudeAI = () => {
      setActiveSection('claude-ai')
    }

    window.addEventListener('switchToClaudeAI', handleSwitchToClaudeAI)
    
    return () => {
      window.removeEventListener('switchToClaudeAI', handleSwitchToClaudeAI)
    }
  }, [])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')

    // Simulate AI response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I understand you said: "${message}". This is a demo response. The full Claude integration will provide real AI assistance for your system engineering needs.`,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, response])
    }, 1000)
  }

  const menuItems = [
    { id: 'claude-ai', name: 'Claude AI', icon: '🤖' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'tools', name: 'Tools', icon: '⚡' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-red-500">Nishen's AI</h1>
          <p className="text-sm text-gray-400">Workspace</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                activeSection === item.id 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeSection === 'claude-ai' ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
              <h2 className="text-lg font-semibold">Claude AI Assistant</h2>
              <p className="text-sm text-gray-400">System Engineering AI Helper</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg rounded-lg p-4 ${
                    msg.type === 'user' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <p className="mb-2">{msg.content}</p>
                    <p className="text-xs opacity-70">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Claude about system engineering, automation, or coding..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : activeSection === 'terminal' ? (
          <Terminal />
        ) : activeSection === 'files' ? (
          <Files />
        ) : activeSection === 'notes' ? (
          <Notes />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-orange-500">
                {menuItems.find(item => item.id === activeSection)?.name}
              </h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}