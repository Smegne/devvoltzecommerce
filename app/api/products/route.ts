import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const exclude = searchParams.get('exclude')

    // Build query with template literals to avoid parameter issues
    let query = `
      SELECT id, title, description, price, original_price, category, subcategory, brand, 
             stock_quantity, availability, images, rating, review_count, tags, featured, created_at
      FROM products 
      WHERE published = TRUE
    `
    
    if (category) {
      query += ` AND category = '${category}'`
    }

    if (exclude) {
      query += ` AND id != ${parseInt(exclude)}`
    }

    query += ' ORDER BY featured DESC, created_at DESC'

    if (limit) {
      const limitNum = parseInt(limit)
      query += ` LIMIT ${limitNum}`
    }

    console.log('🔍 Final Products Query:', query)

    const [products] = await pool.execute(query)

    // Format products (same as above)
    const formattedProducts = (products as any[]).map(product => {
      // Parse images
      let images: string[] = []
      if (product.images) {
        try {
          if (typeof product.images === 'string') {
            const parsed = JSON.parse(product.images)
            images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
          } else if (Array.isArray(product.images)) {
            images = product.images
          }
        } catch {
          images = [product.images].filter(Boolean)
        }
      }

      if (images.length === 0) {
        images = ['/api/placeholder/400/400?text=No+Image']
      }

      return {
        id: product.id,
        name: product.title,
        description: product.description,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        images: images,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        inStock: product.stock_quantity > 0,
        stockCount: product.stock_quantity,
        rating: product.rating || 4.5,
        reviewCount: product.review_count || 0,
        featured: product.featured || false,
        tags: product.tags ? JSON.parse(product.tags) : [],
        availability: product.availability
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length
    })

  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}