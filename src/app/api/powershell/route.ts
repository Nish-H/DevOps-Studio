import { NextRequest, NextResponse } from 'next/server'

let Shell: any = null

// Dynamically import node-powershell only on server-side
const initShell = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('PowerShell execution only available on server')
  }
  
  if (!Shell) {
    try {
      const nodePowerShell = await import('node-powershell')
      Shell = nodePowerShell.default
    } catch (error) {
      console.error('Failed to load node-powershell:', error)
      throw new Error('PowerShell not available')
    }
  }
  return Shell
}

interface PowerShellSession {
  id: string
  shell: any
  createdAt: number
}

// In-memory session storage (in production, use Redis or database)
const sessions = new Map<string, PowerShellSession>()

export async function POST(request: NextRequest) {
  try {
    const { command, sessionId, action } = await request.json()

    switch (action) {
      case 'create_session':
        return createSession()
      
      case 'execute':
        return executeCommand(command, sessionId)
      
      case 'destroy_session':
        return destroySession(sessionId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('PowerShell API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true 
    }, { status: 500 })
  }
}

async function createSession() {
  try {
    const ShellClass = await initShell()
    const shell = new ShellClass({
      executionPolicy: 'Bypass',
      noProfile: true,
      debugMsg: false
    })

    const sessionId = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    sessions.set(sessionId, {
      id: sessionId,
      shell,
      createdAt: Date.now()
    })

    // Clean up old sessions (older than 1 hour)
    cleanupOldSessions()

    return NextResponse.json({ 
      sessionId,
      status: 'created',
      version: 'PowerShell Core via Node.js'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create PowerShell session',
      fallback: true 
    }, { status: 500 })
  }
}

async function executeCommand(command: string, sessionId: string) {
  try {
    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const session = sessions.get(sessionId)!
    const startTime = Date.now()

    // Execute PowerShell command
    const result = await session.shell.addCommand(command).invoke()
    
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      output: result.raw || result.toString(),
      executionTime,
      command,
      sessionId,
      isRealPowerShell: true
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Execution failed',
      output: `PowerShell Error: ${error instanceof Error ? error.message : String(error)}`,
      executionTime: 0,
      command,
      sessionId,
      isRealPowerShell: true
    }, { status: 200 }) // Return 200 to show error in terminal
  }
}

async function destroySession(sessionId: string) {
  try {
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!
      if (session.shell && session.shell.dispose) {
        await session.shell.dispose()
      }
      sessions.delete(sessionId)
    }

    return NextResponse.json({ status: 'destroyed' })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to destroy session' 
    }, { status: 500 })
  }
}

function cleanupOldSessions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  
  for (const [sessionId, session] of sessions.entries()) {
    if (session.createdAt < oneHourAgo) {
      try {
        if (session.shell && session.shell.dispose) {
          session.shell.dispose()
        }
      } catch (error) {
        console.error('Error disposing old session:', error)
      }
      sessions.delete(sessionId)
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'PowerShell API Ready',
    activeSessions: sessions.size,
    version: '1.0.0'
  })
}