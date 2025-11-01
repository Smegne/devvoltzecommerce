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

    // Process images to handle base64 and invalid URLs
    const processedImages = images.map(img => {
      if (!img || typeof img !== 'string') {
        return '/api/placeholder/400/400?text=Product+Image'
      }

      // Check if it's a valid base64 image (starts with data:image/)
      if (img.startsWith('data:image/')) {
        // Validate base64 format
        try {
          // Simple validation - check if it has proper format and reasonable length
          const base64Parts = img.split(',')
          if (base64Parts.length === 2 && base64Parts[1].length > 100) {
            return img
          } else {
            console.warn('Invalid base64 image format for product:', productId)
            return '/api/placeholder/400/400?text=Invalid+Image'
          }
        } catch (error) {
          console.warn('Error processing base64 image for product:', productId, error)
          return '/api/placeholder/400/400?text=Invalid+Image'
        }
      }
      
      // Check if it's a valid URL (http, https, or relative path)
      if (img.startsWith('http') || img.startsWith('/')) {
        return img
      }
      
      // If it's a long string that might be corrupted base64, use placeholder
      if (img.length > 1000) {
        console.warn('Long string detected, likely corrupted base64 for product:', productId)
        return '/api/placeholder/400/400?text=Corrupted+Image'
      }
      
      // Fallback to placeholder
      return '/api/placeholder/400/400?text=Product+Image'
    }).filter(img => img !== null && img !== undefined)

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

// Emergency Fix: Also update your gallery route to prevent base64 corruption
// Add this function to clean up corrupted base64 images
async function cleanupCorruptedImages() {
  try {
    // Get all products with potentially corrupted images
    const [products] = await pool.execute(
      'SELECT id, images FROM products WHERE images LIKE "%data:image/%"'
    )
    
    for (const product of products as any[]) {
      let images: string[] = []
      try {
        if (typeof product.images === 'string') {
          const parsed = JSON.parse(product.images)
          images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean)
        } else if (Array.isArray(product.images)) {
          images = product.images
        }
      } catch {
        continue
      }
      
      const cleanedImages = images.map(img => {
        if (img && img.startsWith('data:image/') && img.includes('...')) {
          // This is a truncated base64 image, replace with placeholder
          return '/api/placeholder/400/400?text=Image+Removed'
        }
        return img
      })
      
      // Update the product with cleaned images
      await pool.execute(
        'UPDATE products SET images = ? WHERE id = ?',
        [JSON.stringify(cleanedImages), product.id]
      )
    }
  } catch (error) {
    console.error('Error cleaning corrupted images:', error)
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