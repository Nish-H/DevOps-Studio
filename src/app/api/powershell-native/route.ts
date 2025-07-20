import { NextRequest, NextResponse } from 'next/server'
import { spawn, ChildProcess } from 'child_process'

interface NativePowerShellSession {
  id: string
  process: ChildProcess
  createdAt: number
  isActive: boolean
}

// Store active PowerShell processes
const nativeSessions = new Map<string, NativePowerShellSession>()

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, command } = await request.json()

    switch (action) {
      case 'create_session':
        return await createNativeSession()
      
      case 'execute':
        return await executeNativeCommand(sessionId, command)
      
      case 'destroy_session':
        return destroyNativeSession(sessionId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Native PowerShell API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

async function createNativeSession() {
  try {
    const sessionId = `native_ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Spawn native PowerShell process with unrestricted execution
    const powerShellProcess = spawn('powershell.exe', [
      '-NoLogo',
      '-NoProfile', 
      '-ExecutionPolicy', 'Unrestricted',
      '-Command', '-'
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      cwd: process.cwd()
    })

    // Handle process errors
    powerShellProcess.on('error', (error) => {
      console.error(`PowerShell process error for session ${sessionId}:`, error)
      nativeSessions.delete(sessionId)
    })

    powerShellProcess.on('exit', (code, signal) => {
      console.log(`PowerShell process ${sessionId} exited with code ${code}, signal ${signal}`)
      nativeSessions.delete(sessionId)
    })

    // Store the session
    nativeSessions.set(sessionId, {
      id: sessionId,
      process: powerShellProcess,
      createdAt: Date.now(),
      isActive: true
    })

    // Clean up old sessions
    cleanupOldNativeSessions()

    console.log(`✅ Native PowerShell session created: ${sessionId}`)
    
    return NextResponse.json({ 
      sessionId,
      status: 'created',
      type: 'native',
      version: 'Native PowerShell Core (Unrestricted)',
      pid: powerShellProcess.pid
    })
  } catch (error) {
    console.error('Failed to create native PowerShell session:', error)
    return NextResponse.json({ 
      error: 'Failed to create native PowerShell session: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 })
  }
}

async function executeNativeCommand(sessionId: string, command: string): Promise<NextResponse> {
  return new Promise((resolve) => {
    try {
      if (!sessionId || !nativeSessions.has(sessionId)) {
        resolve(NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 }))
        return
      }

      const session = nativeSessions.get(sessionId)!
      
      if (!session.isActive || !session.process.stdin) {
        resolve(NextResponse.json({ error: 'Session not active' }, { status: 400 }))
        return
      }

      const startTime = Date.now()
      let output = ''
      let errorOutput = ''
      let hasResponded = false

      const timeout = setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true
          resolve(NextResponse.json({
            output: output || 'Command timed out after 30 seconds',
            error: errorOutput,
            executionTime: Date.now() - startTime,
            command,
            sessionId,
            isNativePowerShell: true,
            timedOut: true
          }))
        }
      }, 30000) // 30 second timeout

      // Set up data listeners
      const stdoutHandler = (data: Buffer) => {
        output += data.toString()
      }

      const stderrHandler = (data: Buffer) => {
        errorOutput += data.toString()
      }

      session.process.stdout?.on('data', stdoutHandler)
      session.process.stderr?.on('data', stderrHandler)

      // Execute the command
      const commandToExecute = command.trim() + '\\n'
      session.process.stdin.write(commandToExecute)

      // Wait for output (simplified approach)
      setTimeout(() => {
        if (!hasResponded) {
          hasResponded = true
          clearTimeout(timeout)
          
          // Remove listeners
          session.process.stdout?.removeListener('data', stdoutHandler)
          session.process.stderr?.removeListener('data', stderrHandler)

          const executionTime = Date.now() - startTime

          resolve(NextResponse.json({
            output: output || 'No output received',
            error: errorOutput || null,
            executionTime,
            command,
            sessionId,
            isNativePowerShell: true,
            success: !errorOutput
          }))
        }
      }, 2000) // Wait 2 seconds for output

    } catch (error) {
      resolve(NextResponse.json({
        error: `Native execution error: ${error instanceof Error ? error.message : String(error)}`,
        output: '',
        executionTime: 0,
        command,
        sessionId,
        isNativePowerShell: true
      }, { status: 200 }))
    }
  })
}

function destroyNativeSession(sessionId: string) {
  try {
    if (nativeSessions.has(sessionId)) {
      const session = nativeSessions.get(sessionId)!
      
      if (session.process && !session.process.killed) {
        session.process.kill('SIGTERM')
        setTimeout(() => {
          if (!session.process.killed) {
            session.process.kill('SIGKILL')
          }
        }, 5000)
      }
      
      nativeSessions.delete(sessionId)
      console.log(`🗑️ Native PowerShell session destroyed: ${sessionId}`)
    }

    return NextResponse.json({ status: 'destroyed' })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to destroy session' 
    }, { status: 500 })
  }
}

function cleanupOldNativeSessions() {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  
  for (const [sessionId, session] of nativeSessions.entries()) {
    if (session.createdAt < oneHourAgo) {
      try {
        if (session.process && !session.process.killed) {
          session.process.kill('SIGTERM')
        }
      } catch (error) {
        console.error('Error cleaning up old native session:', error)
      }
      nativeSessions.delete(sessionId)
      console.log(`🧹 Cleaned up old native session: ${sessionId}`)
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Native PowerShell API Ready',
    activeSessions: nativeSessions.size,
    version: '1.0.0',
    type: 'native',
    platform: process.platform
  })
}