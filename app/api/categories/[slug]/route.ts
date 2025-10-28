import { NextRequest } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // AWAIT the params object first
    const { slug } = await params
    
    const [categories] = await pool.execute(
      'SELECT id, name, slug, description, image_url as image FROM categories WHERE slug = ?',
      [slug]  // Now use the awaited slug
    )

    const category = (categories as any[])[0]
    
    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    return Response.json(category)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return Response.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}