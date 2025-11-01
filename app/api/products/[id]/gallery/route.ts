import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    console.log('🖼️ Fetching gallery for product:', productId)

    const [images] = await pool.execute(
      `SELECT id, product_id, image_url, alt_text, sort_order, image_type, created_at 
       FROM product_gallery 
       WHERE product_id = ? 
       ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    )

    const imagesArray = Array.isArray(images) ? images : []
    console.log('✅ Gallery images fetched:', imagesArray.length)

    // Ensure all image URLs are properly formatted
    const formattedImages = imagesArray.map((img: any) => ({
      ...img,
      image_url: img.image_url || `/api/placeholder/400/400?text=Gallery+Image`
    }))

    return NextResponse.json({
      success: true,
      images: formattedImages
    })

  } catch (error) {
    console.error('❌ Error fetching product gallery:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch product gallery',
        images: [] 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('❌ No authorization token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getAuthUser(token)
    if (!user || user.role !== 'admin') {
      console.log('❌ User not authorized:', user?.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: productId } = await params
    console.log('🖼️ Starting gallery upload for product:', productId)

    // Validate product exists first
    const [products] = await pool.execute(
      'SELECT id, title FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      console.log('❌ Product not found:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = (products as any[])[0]
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    const imageType = formData.get('imageType') as string || 'angle'

    console.log('📸 Received files:', images.length, 'Type:', imageType)

    if (!images || images.length === 0) {
      console.log('❌ No images provided')
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', 'gallery')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Validate files
    const validImages = images.filter(img => 
      img instanceof File && 
      img.size > 0 && 
      img.type.startsWith('image/')
    )

    if (validImages.length === 0) {
      console.log('❌ No valid images found')
      return NextResponse.json(
        { error: 'No valid image files provided' },
        { status: 400 }
      )
    }

    console.log('✅ Valid images:', validImages.length)

    connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Get current max sort_order for this product
      const [maxOrderResult] = await connection.execute(
        'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM product_gallery WHERE product_id = ?',
        [productId]
      )
      const maxOrder = (maxOrderResult as any[])[0]?.max_order || 0
      console.log('📊 Current max order:', maxOrder)

      const results = []

      for (let i = 0; i < validImages.length; i++) {
        const image = validImages[i]
        
        // Generate unique filename and save file
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = image.name.split('.').pop() || 'jpg'
        const fileName = `gallery-${productId}-${timestamp}-${randomString}.${fileExtension}`
        const filePath = path.join(uploadDir, fileName)

        // Convert File to Buffer and save
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Create URL for frontend access
        const imageUrl = `/uploads/products/gallery/${fileName}`

        console.log(`🖼️ Inserting gallery image ${i + 1}:`, image.name)

        const [result] = await connection.execute(
          `INSERT INTO product_gallery (product_id, image_url, alt_text, sort_order, image_type) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            productId, 
            imageUrl, 
            `${product.title} - ${imageType} view ${i + 1}`, 
            maxOrder + i + 1,
            imageType
          ]
        )

        const insertedId = (result as any).insertId
        
        results.push({
          id: insertedId,
          product_id: parseInt(productId),
          image_url: imageUrl,
          alt_text: `${product.title} - ${imageType} view ${i + 1}`,
          sort_order: maxOrder + i + 1,
          image_type: imageType,
          originalName: image.name
        })
      }

      await connection.commit()
      console.log('✅ Gallery upload successful, inserted:', results.length, 'images')

      return NextResponse.json({
        success: true,
        message: `${results.length} image(s) added to gallery successfully`,
        uploaded: results,
        images: results // Also return as images for immediate frontend update
      })

    } catch (transactionError) {
      if (connection) {
        await connection.rollback()
      }
      console.error('❌ Transaction error in gallery upload:', transactionError)
      throw transactionError
    } finally {
      if (connection) {
        connection.release()
      }
    }

  } catch (error) {
    console.error('❌ Error uploading gallery images:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload gallery images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getAuthUser(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: productId, imageId } = await params
    const { image_type } = await request.json()

    await pool.execute(
      'UPDATE product_gallery SET image_type = ? WHERE id = ? AND product_id = ?',
      [image_type, imageId, productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Gallery image updated successfully'
    })

  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getAuthUser(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id: productId, imageId } = await params

    await pool.execute(
      'DELETE FROM product_gallery WHERE id = ? AND product_id = ?',
      [imageId, productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Gallery image deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery image' },
      { status: 500 }
    )
  }
}