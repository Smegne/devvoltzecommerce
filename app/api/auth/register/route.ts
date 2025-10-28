import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword, generateToken, AuthResponse } from '@/lib/auth'

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    )

    const insertResult = result as any
    const userId = insertResult.insertId

    // Get created user
    const [users] = await pool.execute(
      'SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?',
      [userId]
    )

    const user = (users as any[])[0]

    // Generate token
    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      user,
      token,
      message: 'Registration successful'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}