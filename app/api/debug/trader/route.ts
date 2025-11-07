import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('🔍 Checking trader records for user ID:', userId);

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        userId
      });
    }

    console.log('✅ User found:', user);

    // Check if trader record exists
    const [traders] = await pool.execute(
      `SELECT t.*, u.name as owner_name, u.email as owner_email 
       FROM traders t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.user_id = ?`,
      [userId]
    );

    const trader = (traders as any[])[0];

    if (!trader) {
      return NextResponse.json({
        success: false,
        message: 'Trader record not found for this user',
        user: user,
        suggestion: 'The user exists but no trader record was created during registration'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Trader record found',
      user: user,
      trader: trader
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug API error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}