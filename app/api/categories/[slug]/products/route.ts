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
      'SELECT name FROM categories WHERE slug = ?',
      [slug]  // Now use the awaited slug
    )

    const category = (categories as any[])[0]
    
    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 })
    }

    const [products] = await pool.execute(
      `SELECT id, title, description, price, original_price, category, 
              subcategory, brand, stock_quantity, availability, images, 
              tags, rating, review_count, featured
       FROM products 
       WHERE category = ? AND published = TRUE
       ORDER BY created_at DESC`,
      [category.name]
    )

    return Response.json(products)
  } catch (error) {
    console.error('Failed to fetch category products:', error)
    return Response.json({ error: 'Failed to fetch category products' }, { status: 500 })
  }
}