import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // AWAIT the params object first
    const { slug } = await params
    
    console.log('🔍 Fetching products for category slug:', slug)

    // Convert slug to proper case for matching
    // electronics -> Electronics
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
    
    console.log('🔍 Searching for category name:', categoryName)

    // Fetch products directly from products table using the category name
    const [products] = await pool.execute(
      `SELECT 
        id, 
        title, 
        description, 
        price, 
        original_price,
        category,
        subcategory,
        brand,
        stock_quantity,
        availability,
        images,
        featured,
        published,
        rating,
        review_count,
        created_at
       FROM products 
       WHERE category = ? 
       AND published = 1
       ORDER BY featured DESC, created_at DESC`,
      [categoryName]
    )

    const productsArray = Array.isArray(products) ? products : []
    
    console.log(`✅ Found ${productsArray.length} products for category "${categoryName}"`)
    
    // Log each product found for debugging
    productsArray.forEach((product: any) => {
      console.log(`📦 Product: ${product.id} - ${product.title} - Category: ${product.category} - Published: ${product.published}`)
    })

    // Format products with proper image handling
    const formattedProducts = productsArray.map((product: any) => {
      let images: string[] = []
      try {
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images)
        } else if (Array.isArray(product.images)) {
          images = product.images
        }
      } catch (error) {
        console.error('Error parsing images for product:', product.id, error)
        images = []
      }
      
      // Ensure we have at least one image
      if (images.length === 0) {
        images = [`/api/placeholder/400/400?text=${encodeURIComponent(product.title || 'Product')}`]
      }

      return {
        id: product.id,
        title: product.title,
        name: product.title, // For compatibility
        description: product.description,
        price: parseFloat(product.price) || 0,
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        stock_quantity: product.stock_quantity || 0,
        availability: product.availability,
        images: images,
        featured: Boolean(product.featured),
        published: Boolean(product.published),
        rating: parseFloat(product.rating) || 4.5,
        review_count: parseInt(product.review_count) || 0,
        created_at: product.created_at,
        inStock: product.availability === 'in_stock',
        stockCount: product.stock_quantity || 0
      }
    })

    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error('❌ Error fetching category products:', error)
    return NextResponse.json([], { status: 500 })
  }
}