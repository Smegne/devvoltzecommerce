import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const [images] = await pool.execute(
      `SELECT id, product_id, image_url, alt_text, sort_order, image_type, created_at 
       FROM product_gallery 
       WHERE product_id = ? 
       ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    )

    return NextResponse.json({
      success: true,
      images: images || []
    })

  } catch (error) {
    console.error('Error fetching product gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product gallery' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getAuthUser(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: productId } = await params
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    const imageType = formData.get('imageType') as string || 'angle'

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Validate product exists
    const [products] = await pool.execute(
      'SELECT id, title FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const results = []
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Get current max sort_order for this product
      const [maxOrderResult] = await connection.execute(
        'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM product_gallery WHERE product_id = ?',
        [productId]
      )
      const maxOrder = (maxOrderResult as any[])[0]?.max_order || 0

      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        
        if (image.size === 0) continue

        // Validate file type
        if (!image.type.startsWith('image/')) {
          continue // Skip non-image files
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = image.type.split('/')[1] || 'jpg'
        const fileName = `gallery-${productId}-${timestamp}-${randomString}.${fileExtension}`

        // Convert image to buffer
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Define upload path
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products', 'gallery')
        const filePath = join(uploadDir, fileName)
        const publicUrl = `/uploads/products/gallery/${fileName}`

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Save file
        await writeFile(filePath, buffer)

        // Insert into database with actual image URL
        const [result] = await connection.execute(
          `INSERT INTO product_gallery (product_id, image_url, alt_text, sort_order, image_type) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            productId, 
            publicUrl, 
            `${imageType} view ${i + 1}`, 
            maxOrder + i + 1,
            imageType
          ]
        )

        results.push({
          imageId: (result as any).insertId,
          originalName: image.name,
          imageType,
          imageUrl: publicUrl
        })
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: `${results.length} image(s) uploaded successfully`,
        uploaded: results
      })

    } catch (error) {
      await connection.rollback()
      console.error('Transaction error in gallery upload:', error)
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('Error uploading gallery images:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload gallery images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}