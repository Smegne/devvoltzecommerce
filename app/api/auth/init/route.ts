import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized' })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json(
      { success: false, message: 'Database initialization failed' },
      { status: 500 }
    )
  }
}