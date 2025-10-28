import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Starting featured products debug...')
    
    // Test database connection
    console.log('📊 Testing database connection...')
    const connection = await pool.getConnection()
    console.log('✅ Database connection successful')
    connection.release()

    // Test simple query
    console.log('📝 Testing simple query...')
    const [simpleResult] = await pool.execute('SELECT 1 as test')
    console.log('✅ Simple query successful:', simpleResult)

    // Check if products table exists
    console.log('📋 Checking products table...')
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
    `)
    console.log('📦 Products table exists:', (tables as any[]).length > 0)

    if ((tables as any[]).length === 0) {
      return NextResponse.json({ 
        error: 'Products table does not exist',
        availableTables: await getAvailableTables() 
      })
    }

    // Try to get products with very simple query
    console.log('🛍️ Attempting to fetch products...')
    const [products] = await pool.execute(`
      SELECT id, title, price 
      FROM products 
      LIMIT 5
    `)

    console.log(`✅ Found ${(products as any[]).length} products`)
    
    return NextResponse.json({
      success: true,
      database: 'Connected',
      productsTable: 'Exists',
      productsCount: (products as any[]).length,
      sampleProducts: products
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function getAvailableTables() {
  try {
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `)
    return tables
  } catch (error) {
    return 'Cannot fetch tables'
  }
}