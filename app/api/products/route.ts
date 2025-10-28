import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [products] = await pool.execute(`
      SELECT id, title, description, price, original_price, category, subcategory, brand, 
             stock_quantity, availability, images, rating, review_count, tags, featured, created_at
      FROM products 
      WHERE published = TRUE
      ORDER BY featured DESC, created_at DESC
    `)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}