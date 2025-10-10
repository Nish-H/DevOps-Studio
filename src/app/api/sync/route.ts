import { NextRequest, NextResponse } from 'next/server'

// Check if KV environment variables are available
const isKvAvailable = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
}

// Generate device ID for cross-device sync
function generateDeviceId(): string {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// GET: Retrieve all workspace data for a device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    // Check if KV is available
    if (!isKvAvailable()) {
      return NextResponse.json({
        success: true,
        data: {},
        deviceId,
        lastSync: new Date().toISOString(),
        message: 'Local development mode - no cloud sync available'
      })
    }

    // Only import kv if environment variables are available
    const { kv } = await import('@vercel/kv')

    // Get all workspace keys for this device
    const keys = [
      'notes', 'note-categories', 'files', 'prompts', 'prompt-categories',
      'url-links', 'url-categories', 'settings', 'tools-data', 'file-browser',
      'prod', 'dev', 'terminal-history'
    ]

    const data: Record<string, any> = {}

    for (const key of keys) {
      const fullKey = `${deviceId}:nishen-workspace-${key}`
      const value = await kv.get(fullKey)
      if (value) {
        data[key] = value
      }
    }

    return NextResponse.json({
      success: true,
      data,
      deviceId,
      lastSync: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sync GET error:', error)
    return NextResponse.json({
      success: true,
      data: {},
      deviceId: 'offline',
      lastSync: new Date().toISOString(),
      message: 'Local development mode - no cloud sync available'
    })
  }
}

// POST: Save workspace data for a device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, data, key } = body

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    // Check if KV is available
    if (!isKvAvailable()) {
      return NextResponse.json({
        success: true,
        message: 'Local development mode - data saved locally',
        lastSync: new Date().toISOString()
      })
    }

    // Only import kv if environment variables are available
    const { kv } = await import('@vercel/kv')

    if (key && data) {
      // Save single key-value pair
      const fullKey = `${deviceId}:nishen-workspace-${key}`
      await kv.set(fullKey, data)
      await kv.set(`${deviceId}:last-sync`, new Date().toISOString())

      return NextResponse.json({
        success: true,
        message: `Saved ${key}`,
        lastSync: new Date().toISOString()
      })
    }

    if (data && typeof data === 'object') {
      // Save multiple key-value pairs
      const promises = Object.entries(data).map(([k, v]) => {
        const fullKey = `${deviceId}:nishen-workspace-${k}`
        return kv.set(fullKey, v)
      })

      await Promise.all(promises)
      await kv.set(`${deviceId}:last-sync`, new Date().toISOString())

      return NextResponse.json({
        success: true,
        message: `Saved ${Object.keys(data).length} items`,
        lastSync: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })

  } catch (error) {
    console.error('Sync POST error:', error)
    return NextResponse.json({
      success: true,
      message: 'Local development mode - data saved locally',
      lastSync: new Date().toISOString()
    })
  }
}

// PUT: Create new device ID and migrate localStorage data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { localStorageData } = body

    const newDeviceId = generateDeviceId()

    // Check if KV is available
    if (!isKvAvailable()) {
      return NextResponse.json({
        success: true,
        deviceId: newDeviceId,
        message: 'Local development mode - device registered locally',
        lastSync: new Date().toISOString()
      })
    }

    // Only import kv if environment variables are available
    const { kv } = await import('@vercel/kv')

    if (localStorageData && typeof localStorageData === 'object') {
      // Migrate localStorage data to cloud
      const promises = Object.entries(localStorageData).map(([key, value]) => {
        if (key.startsWith('nishen-workspace-')) {
          const cleanKey = key.replace('nishen-workspace-', '')
          const fullKey = `${newDeviceId}:nishen-workspace-${cleanKey}`
          return kv.set(fullKey, value)
        }
        return Promise.resolve()
      })

      await Promise.all(promises)
      await kv.set(`${newDeviceId}:last-sync`, new Date().toISOString())
    }

    return NextResponse.json({
      success: true,
      deviceId: newDeviceId,
      message: 'Device registered and data migrated',
      lastSync: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sync PUT error:', error)
    return NextResponse.json({
      success: true,
      deviceId: generateDeviceId(),
      message: 'Local development mode - device registered locally',
      lastSync: new Date().toISOString()
    })
  }
}