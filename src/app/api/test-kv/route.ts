import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  try {
    // Test KV connection
    const testKey = 'test-connection'
    const testValue = { message: 'KV is working!', timestamp: new Date().toISOString() }
    
    // Try to write
    await kv.set(testKey, testValue)
    
    // Try to read
    const result = await kv.get(testKey)
    
    return NextResponse.json({
      success: true,
      message: 'KV Redis connection working',
      test: result,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
      }
    }, { status: 500 })
  }
}