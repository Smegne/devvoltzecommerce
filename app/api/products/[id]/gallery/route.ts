import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const [images] = await pool.execute(
      `SELECT id, product_id, image_url, alt_text, sort_order, created_at 
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
        
        // For demo purposes, we'll use the placeholder API
        // In production, integrate with cloud storage (AWS S3, Cloudinary, etc.)
        const imageUrl = `/api/placeholder/800/800?text=${imageType}+${i+1}`
        
        const [result] = await connection.execute(
          `INSERT INTO product_gallery (product_id, image_url, alt_text, sort_order, image_type) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            productId, 
            imageUrl, 
            `${imageType} view ${i + 1} for product ${productId}`, 
            maxOrder + i + 1,
            imageType
          ]
        )

        results.push({
          imageId: (result as any).insertId,
          originalName: image.name,
          imageType
        })
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'Images uploaded successfully',
        uploaded: results
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('Error uploading gallery images:', error)
    return NextResponse.json(
      { error: 'Failed to upload gallery images' },
      { status: 500 }
    )
  }
}