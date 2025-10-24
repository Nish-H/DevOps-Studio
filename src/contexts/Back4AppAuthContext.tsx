'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  initializeParse,
  isParseInitialized,
  User
} from '@/lib/back4appService'

interface Back4AppAuthContextType {
  currentUser: User | null
  loading: boolean
  error: string | null
}

const Back4AppAuthContext = createContext<Back4AppAuthContextType | undefined>(undefined)

// Auto-credentials for Back4App (synced with workspace login)
const BACK4APP_CREDENTIALS = {
  username: 'NishenH',
  email: 'nishenh@ftechkzn.co.za',
  password: 'LiverpoolFC4Life!'
}

export function Back4AppAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeBack4AppAuth()
  }, [])

  const initializeBack4AppAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Ensure Parse is initialized first
      console.log('🔧 Back4App: Initializing Parse SDK...')
      initializeParse()

      // Wait for Parse to be ready (with retry logic)
      let retries = 0
      const maxRetries = 5
      while (!isParseInitialized() && retries < maxRetries) {
        console.log(`⏳ Back4App: Waiting for Parse initialization (attempt ${retries + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 500))
        retries++
      }

      if (!isParseInitialized()) {
        throw new Error('Parse SDK failed to initialize after multiple attempts')
      }

      console.log('✅ Back4App: Parse SDK initialized successfully')

      // Check if already logged in to Back4App
      const existingUser = getCurrentUser()

      if (existingUser) {
        console.log('✅ Back4App: Already authenticated as', existingUser.username)
        setCurrentUser(existingUser)
        setLoading(false)
        return
      }

      // Try to log in with workspace credentials
      console.log('🔐 Back4App: Attempting auto-login...')
      try {
        const user = await loginUser(BACK4APP_CREDENTIALS.username, BACK4APP_CREDENTIALS.password)
        console.log('✅ Back4App: Login successful as', user.username)
        setCurrentUser(user)
      } catch (loginError: any) {
        console.log('⚠️ Back4App: Login failed, attempting registration...', loginError.message)

        // If login fails, try to register (first time setup)
        if (loginError.message.includes('Invalid username/password') ||
            loginError.message.includes('not found')) {
          try {
            const newUser = await registerUser(
              BACK4APP_CREDENTIALS.username,
              BACK4APP_CREDENTIALS.email,
              BACK4APP_CREDENTIALS.password
            )
            console.log('✅ Back4App: Registration successful as', newUser.username)
            setCurrentUser(newUser)
          } catch (registerError: any) {
            // If registration fails because user exists, try login again
            if (registerError.message.includes('already taken')) {
              console.log('⚠️ Back4App: User exists, retrying login...')
              const user = await loginUser(BACK4APP_CREDENTIALS.username, BACK4APP_CREDENTIALS.password)
              console.log('✅ Back4App: Login successful as', user.username)
              setCurrentUser(user)
            } else {
              throw registerError
            }
          }
        } else {
          throw loginError
        }
      }

      setLoading(false)
    } catch (err: any) {
      console.error('❌ Back4App: Authentication failed:', err)

      // Provide helpful error messages
      let errorMessage = err.message || 'Failed to authenticate with Back4App'

      if (err.message?.includes('Parse SDK failed to initialize')) {
        errorMessage = 'Unable to connect to Back4App. Please check your internet connection and environment variables.'
      } else if (err.message?.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.'
      }

      setError(errorMessage)
      setLoading(false)

      // Don't block the app - cloud features will just be unavailable
      // User can still use localStorage-based features
    }
  }

  const value: Back4AppAuthContextType = {
    currentUser,
    loading,
    error
  }

  return (
    <Back4AppAuthContext.Provider value={value}>
      {children}
    </Back4AppAuthContext.Provider>
  )
}

export function useBack4AppAuth() {
  const context = useContext(Back4AppAuthContext)
  if (context === undefined) {
    throw new Error('useBack4AppAuth must be used within a Back4AppAuthProvider')
  }
  return context
}
