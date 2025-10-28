import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [categories] = await pool.execute(`
      SELECT c.id, c.name, c.slug, c.description, c.image_url as image, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.name = p.category
      WHERE c.featured = TRUE
      GROUP BY c.id
      ORDER BY c.name ASC
      LIMIT 6
    `)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch featured categories:', error)
    return NextResponse.json({ error: 'Failed to fetch featured categories' }, { status: 500 })
  }
}