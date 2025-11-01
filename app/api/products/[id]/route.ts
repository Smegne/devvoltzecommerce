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

    // Handle base64 images and ensure all images are properly formatted
    const processedImages = images.map(img => {
      // If it's already a base64 image or valid URL, return as is
      if (img.startsWith('data:image/') || img.startsWith('http') || img.startsWith('/')) {
        return img
      }
      // If it's a base64 string without data prefix, add it
      if (img.length > 100 && !img.includes(' ')) { // Likely base64
        return `data:image/jpeg;base64,${img}`
      }
      // Fallback to placeholder
      return '/api/placeholder/400/400?text=Product'
    })

    // Parse tags safely
    let tags: string[] = []
    if (product.tags) {
      try {
        if (typeof product.tags === 'string') {
          const parsedTags = JSON.parse(product.tags)
          tags = Array.isArray(parsedTags) ? parsedTags : []
        } else if (Array.isArray(product.tags)) {
          tags = product.tags
        }
      } catch {
        tags = []
      }
    }

    const formattedProduct = {
      id: product.id,
      name: product.title,
      description: product.description,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      images: processedImages.length > 0 ? processedImages : ['/api/placeholder/400/400?text=Product'],
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      inStock: product.stock_quantity > 0 && product.availability === 'in_stock',
      stockCount: product.stock_quantity,
      rating: product.rating ? parseFloat(product.rating) : 4.5,
      reviewCount: product.review_count || 0,
      featured: Boolean(product.featured),
      tags: tags,
      availability: product.availability,
      createdAt: product.created_at
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()

    const {
      title,
      description,
      price,
      original_price,
      category,
      subcategory,
      brand,
      stock_quantity,
      availability,
      featured,
      published
    } = body

    // Validate required fields
    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      `UPDATE products 
       SET title = ?, description = ?, price = ?, original_price = ?, category = ?, 
           subcategory = ?, brand = ?, stock_quantity = ?, availability = ?, 
           featured = ?, published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        description,
        price,
        original_price,
        category,
        subcategory,
        brand,
        stock_quantity,
        availability,
        featured,
        published,
        productId
      ]
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Also delete associated gallery images
    await pool.execute(
      'DELETE FROM product_gallery WHERE product_id = ?',
      [productId]
    )

    // Also delete associated features
    await pool.execute(
      'DELETE FROM product_features WHERE product_id = ?',
      [productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()

    // Build dynamic update query based on provided fields
    const updateFields: string[] = []
    const updateValues: any[] = []

    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        updateFields.push(`${key} = ?`)
        updateValues.push(body[key])
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(productId)

    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`

    const [result] = await pool.execute(query, updateValues)

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}