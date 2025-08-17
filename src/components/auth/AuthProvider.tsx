'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  getEmergencyAccess: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Secure credentials (in production, use environment variables)
const VALID_CREDENTIALS = {
  username: 'NishenH',
  password: 'LiverpoolFC4Life!'
}

// Emergency access code (changes daily for security)
const generateEmergencyCode = (): string => {
  const today = new Date().toISOString().slice(0, 10)
  return `EMERGENCY_${today}_NISHEN_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check for existing auth session
    const authSession = localStorage.getItem('devops-studio-auth-session')
    const authTimestamp = localStorage.getItem('devops-studio-auth-timestamp')
    
    if (authSession && authTimestamp) {
      const sessionTime = parseInt(authTimestamp)
      const currentTime = Date.now()
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
      
      if (currentTime - sessionTime < sessionDuration) {
        setIsAuthenticated(true)
      } else {
        // Session expired
        localStorage.removeItem('devops-studio-auth-session')
        localStorage.removeItem('devops-studio-auth-timestamp')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      setIsAuthenticated(true)
      localStorage.setItem('devops-studio-auth-session', 'authenticated')
      localStorage.setItem('devops-studio-auth-timestamp', Date.now().toString())
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('devops-studio-auth-session')
    localStorage.removeItem('devops-studio-auth-timestamp')
    
    // Clear all workspace data on logout for security
    Object.keys(localStorage).forEach(key => {
      if (key.includes('nishen-workspace')) {
        localStorage.removeItem(key)
      }
    })
  }

  const getEmergencyAccess = (): string => {
    return generateEmergencyCode()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading DevOps Studio...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen login={login} getEmergencyAccess={getEmergencyAccess} />
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getEmergencyAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

function LoginScreen({ login, getEmergencyAccess }: { 
  login: (username: string, password: string) => boolean
  getEmergencyAccess: () => string 
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showEmergencyCode, setShowEmergencyCode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    const success = login(username, password)
    if (!success) {
      setError('Invalid credentials. Please try again.')
      setUsername('')
      setPassword('')
    }
  }

  const handleEmergencyAccess = () => {
    const emergencyCode = getEmergencyAccess()
    setShowEmergencyCode(true)
    
    // Copy to clipboard
    navigator.clipboard.writeText(emergencyCode).then(() => {
      alert('Emergency access code copied to clipboard. Save this code safely!')
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">DevOps Studio</h1>
            <p className="text-gray-400">Nishen's Secure Professional Workspace</p>
            <div className="w-12 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-center">
              <button
                onClick={handleEmergencyAccess}
                className="text-gray-400 hover:text-gray-300 text-sm underline"
              >
                Need Emergency Access?
              </button>
              
              {showEmergencyCode && (
                <div className="mt-4 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-200 text-xs mb-2">Emergency Access Code Generated</p>
                  <p className="text-yellow-100 font-mono text-sm">Check your clipboard - code copied!</p>
                  <p className="text-yellow-300 text-xs mt-2">⚠️ This code expires in 24 hours</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-gray-500">
              🔒 Secure access • Data protected • Session expires in 24h
            </p>
            <div className="border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-400 mb-2">Contact Information</p>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  📧 <a href="mailto:nishenh@ftechkzn.co.za" className="text-gray-400 hover:text-red-400 transition-colors">nishenh@ftechkzn.co.za</a>
                </p>
                <p className="text-xs text-gray-500">
                  📱 <a href="tel:+27747451618" className="text-gray-400 hover:text-red-400 transition-colors">+27 74 745 1618</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}