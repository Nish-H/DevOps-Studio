'use client'

import { useState, useEffect } from 'react'
import { claudeAPI, getDemoResponse, isRealClaudeAvailable } from '../../lib/claudeAPI'

interface Message {
  id: number
  type: 'user' | 'assistant' | 'system' | 'error'
  content: string
  timestamp: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

export default function RealClaudeInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [isRealMode, setIsRealMode] = useState(false)

  useEffect(() => {
    // Check if API key is already configured
    const existingKey = claudeAPI.getApiKey()
    setIsRealMode(!!existingKey)
    
    // Always show API key input if not configured
    if (!existingKey) {
      setShowApiKeyInput(true)
    }
    
    // Set initial welcome message
    const welcomeContent = existingKey 
      ? "Welcome to Nishen's AI Workspace! I'm Claude AI with full functionality enabled. How can I help you today?"
      : "Welcome to Nishen's AI Workspace! Please configure your Claude API key to begin using the full AI assistant."
      
    setMessages([{
      id: 1,
      type: 'assistant',
      content: welcomeContent,
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, newMessage])
    const currentMessage = message
    setMessage('')
    setIsLoading(true)

    try {
      if (!isRealMode || !claudeAPI.getApiKey()) {
        const errorMessage: Message = {
          id: Date.now() + 1,
          type: 'error',
          content: '❌ Please configure your Claude API key first to use the AI assistant.',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsLoading(false)
        return
      }

      // Real Claude AI response ONLY
      const response = await claudeAPI.sendMessage([
        { role: 'system', content: 'You are Claude, an AI assistant created by Anthropic. You are helping the user in their professional DevOps workspace. Be helpful, accurate, and professional.' },
        { role: 'user', content: currentMessage }
      ])
      
      const responseContent = response.content
      const usage = response.usage

      const assistantMessage: Message = {
        id: Date.now() + 1,
        type: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString(),
        usage
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      claudeAPI.setApiKey(apiKey.trim())
      setIsRealMode(true)
      setShowApiKeyInput(false)
      setApiKey('')
      
      // Add success message
      const successMessage: Message = {
        id: Date.now(),
        type: 'system',
        content: '✅ Claude API key configured successfully! You now have access to real Claude AI responses.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, successMessage])
    }
  }

  const handleClearApiKey = () => {
    claudeAPI.clearApiKey()
    setIsRealMode(false)
    setShowApiKeyInput(false)
    
    const noticeMessage: Message = {
      id: Date.now(),
      type: 'system',
      content: '⚠️ API key cleared. Claude AI is now in demo mode.',
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, noticeMessage])
  }

  const handleTestConnection = async () => {
    if (!claudeAPI.getApiKey()) {
      alert('Please set your API key first')
      return
    }

    setIsLoading(true)
    try {
      const success = await claudeAPI.testConnection()
      const testMessage: Message = {
        id: Date.now(),
        type: success ? 'system' : 'error',
        content: success ? '✅ Claude API connection test successful!' : '❌ Claude API connection test failed.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, testMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now(),
        type: 'error',
        content: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        {/* Browser-style tabs in center */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <div className="px-4 py-2 bg-red-600 text-white text-sm rounded-md mr-1">
              🤖 Claude AI
            </div>
            <div className="px-4 py-2 text-gray-400 text-sm rounded-md mr-1 hover:bg-gray-700 cursor-pointer">
              💻 Terminal
            </div>
            <div className="px-4 py-2 text-gray-400 text-sm rounded-md hover:bg-gray-700 cursor-pointer">
              🗂️ Files
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              🤖 Claude AI Assistant
              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                isRealMode ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'
              }`}>
                {isRealMode ? 'REAL AI' : 'DEMO MODE'}
              </span>
            </h2>
            <p className="text-sm text-gray-400">
              {isRealMode ? 'Full Claude AI functionality enabled' : 'Configure API key for real responses'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isRealMode ? (
              <>
                <button
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  Test Connection
                </button>
                <button
                  onClick={handleClearApiKey}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Clear API Key
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                Configure API Key
              </button>
            )}
          </div>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex flex-col space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Anthropic API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleSetApiKey}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Set Key
                </button>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-400">
                🔒 Your API key is stored locally and never shared. Get your key from{' '}
                <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  console.anthropic.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg rounded-lg p-4 ${
              msg.type === 'user' 
                ? 'bg-red-600 text-white' 
                : msg.type === 'system'
                ? 'bg-blue-800 text-blue-100 border border-blue-600'
                : msg.type === 'error'
                ? 'bg-red-800 text-red-100 border border-red-600'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <div className="mb-2">
                {msg.type === 'system' && (
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    <span className="text-xs font-semibold text-blue-300">SYSTEM</span>
                  </div>
                )}
                {msg.type === 'error' && (
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-xs font-semibold text-red-300">ERROR</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs opacity-70">{msg.timestamp}</p>
                {msg.usage && (
                  <p className="text-xs opacity-50">
                    {msg.usage.input_tokens + msg.usage.output_tokens} tokens
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                <span>Claude is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder={isRealMode ? "Ask Claude anything..." : "Try demo mode or configure API key for real responses..."}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}