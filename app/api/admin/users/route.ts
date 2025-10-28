import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Admin Users - Auth Header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    console.log('🔐 Token extracted, length:', token.length)

    const user = await getAuthUser(token)
    console.log('🔐 User from token:', user ? `Role: ${user.role}` : 'No user found')
    
    if (!user) {
      console.log('❌ No user found from token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin authorization successful, fetching users...')
    
    const [users] = await pool.execute(`
      SELECT id, name, email, role, email_verified, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `)

    console.log('✅ Users fetched successfully, count:', (users as any[]).length)
    
    return NextResponse.json(users)

  } catch (error) {
    console.error('❌ Failed to fetch users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}