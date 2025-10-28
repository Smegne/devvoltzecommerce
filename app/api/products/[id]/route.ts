import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const [products] = await pool.execute(
      `SELECT id, title, description, price, original_price, category, subcategory, brand, 
              stock_quantity, availability, images, rating, review_count, tags, featured, created_at
       FROM products 
       WHERE id = ? AND published = TRUE`,
      [productId]
    )

    const product = (products as any[])[0]

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse images if they're stored as JSON string
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

    const formattedProduct = {
      id: product.id,
      name: product.title,
      description: product.description,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      images: images.length > 0 ? images : ['/api/placeholder/400/400?text=Product'],
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

    return NextResponse.json(formattedProduct)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}