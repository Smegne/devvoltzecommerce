import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [products] = await pool.execute(`
      SELECT id, title, description, price, original_price, category, subcategory, brand, 
             stock_quantity, availability, images, rating, review_count, tags, featured
      FROM products 
      WHERE featured = TRUE AND published = TRUE
      ORDER BY created_at DESC 
      LIMIT 8
    `)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
  }
}