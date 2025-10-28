import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { comparePassword, generateToken, AuthResponse } from '@/lib/auth'

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, email_verified, created_at FROM users WHERE email = ?',
      [email]
    )

    const user = (users as any[])[0]

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user

    // Generate token
    const token = generateToken(userWithoutPassword)

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}