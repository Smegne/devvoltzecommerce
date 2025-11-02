import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // AWAIT the params first
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const productId = id
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    // Validate product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const uploadedImageUrls: string[] = []

    // Process each image
    for (const image of images) {
      if (image.size === 0) continue

      // Validate file type
      if (!image.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = image.type.split('/')[1] || 'jpg'
      const fileName = `product-${productId}-${timestamp}-${randomString}.${fileExtension}`

      // Convert image to buffer
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // ALWAYS use public folder for both dev and production
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
      const filePath = join(uploadDir, fileName)
      const publicUrl = `/uploads/products/${fileName}`

      // Create directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Save file to public folder
      await writeFile(filePath, buffer)
      uploadedImageUrls.push(publicUrl)
      
      console.log(`✅ Image saved: ${publicUrl}`)
    }

    if (uploadedImageUrls.length === 0) {
      return NextResponse.json({ error: 'No valid images uploaded' }, { status: 400 })
    }

    // Get current images from database
    const [currentProduct] = await pool.execute(
      'SELECT images FROM products WHERE id = ?',
      [productId]
    )

    const currentImages = (currentProduct as any[])[0]?.images || '[]'
    let existingImages: string[] = []

    try {
      existingImages = JSON.parse(currentImages)
    } catch {
      existingImages = []
    }

    // Replace placeholder with actual images
    const updatedImages = [...uploadedImageUrls]

    // Update product with new images
    await pool.execute(
      'UPDATE products SET images = ? WHERE id = ?',
      [JSON.stringify(updatedImages), productId]
    )

    console.log(`✅ Product ${productId} images updated successfully`)

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      imageUrls: uploadedImageUrls,
      totalImages: updatedImages.length
    })

  } catch (error) {
    console.error('❌ Image upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}