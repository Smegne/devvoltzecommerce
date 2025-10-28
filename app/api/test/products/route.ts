import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [products] = await pool.execute(`
      SELECT * FROM products 
      LIMIT 10
    `)
    
    console.log('Products from database:', products)
    
    return NextResponse.json({
      success: true,
      products: products,
      count: (products as any[]).length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch products',
      details: error 
    }, { status: 500 })
  }
}