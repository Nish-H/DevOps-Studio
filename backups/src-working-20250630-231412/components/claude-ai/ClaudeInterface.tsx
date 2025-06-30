'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Download, 
  Code, 
  Terminal as TerminalIcon,
  FileText,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  tools?: string[]
}

interface ClaudeInterfaceProps {
  className?: string
}

export default function ClaudeInterface({ className }: ClaudeInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm Claude, integrated into Nishen's AI Workspace. I can help you with system engineering, coding, automation, and analysis tasks. What would you like to work on today?",
      timestamp: new Date(),
      tools: ['code', 'terminal', 'files']
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate Claude response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you want help with: "${inputMessage}". This is a demo response. In the full implementation, this would connect to Claude's API and provide actual AI assistance with your system engineering and development tasks.`,
        timestamp: new Date(),
        tools: ['code', 'terminal']
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-red to-burnt-orange rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Claude Code AI</h2>
            <p className="text-sm text-text-muted">Integrated AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2 py-1 bg-background-tertiary rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-text-muted">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex items-start space-x-3",
                message.type === 'user' ? "flex-row-reverse space-x-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                message.type === 'user' 
                  ? "bg-gradient-to-br from-burnt-orange to-burnt-orange-dark" 
                  : "bg-gradient-to-br from-neon-red to-neon-red-dark"
              )}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={cn(
                "flex-1 max-w-3xl",
                message.type === 'user' ? "text-right" : ""
              )}>
                <div className={cn(
                  "inline-block p-4 rounded-lg",
                  message.type === 'user'
                    ? "bg-burnt-orange/20 border border-burnt-orange/30"
                    : "bg-background-secondary border border-border"
                )}>
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {message.tools && message.tools.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-text-muted">Tools used:</span>
                      {message.tools.map((tool) => (
                        <span
                          key={tool}
                          className="flex items-center space-x-1 px-2 py-1 bg-background-tertiary rounded text-xs text-neon-red"
                        >
                          {tool === 'code' && <Code className="w-3 h-3" />}
                          {tool === 'terminal' && <TerminalIcon className="w-3 h-3" />}
                          {tool === 'files' && <FileText className="w-3 h-3" />}
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-muted">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {message.type === 'assistant' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-neon-red transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-hover-bg rounded text-text-muted hover:text-burnt-orange transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-neon-red to-neon-red-dark rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-background-secondary border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-neon-red animate-pulse" />
                <span className="text-sm text-text-muted">Claude is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background-secondary">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Claude anything about system engineering, coding, or automation..."
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder-text-muted resize-none focus:outline-none focus:border-neon-red transition-colors"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={cn(
              "p-3 rounded-lg transition-all duration-200",
              inputMessage.trim() && !isLoading
                ? "bg-neon-red hover:bg-neon-red-bright neon-glow-red text-white"
                : "bg-background-tertiary text-text-muted cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}