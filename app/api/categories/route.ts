import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const [categories] = await pool.execute(`
      SELECT id, name, slug, description, image_url as image, featured
      FROM categories 
      ORDER BY name ASC
    `)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}