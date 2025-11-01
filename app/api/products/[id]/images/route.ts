import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { put } from '@vercel/blob'

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
    
    // Validate product exists
    const [products] = await pool.execute(
      'SELECT id, title FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = (products as any[])[0]
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    // Check file sizes (limit to 4MB per image for Vercel Blob)
    const maxSize = 4 * 1024 * 1024; // 4MB
    const oversizedImages = images.filter(img => img.size > maxSize)
    if (oversizedImages.length > 0) {
      return NextResponse.json({ 
        error: `Some images exceed 4MB limit: ${oversizedImages.map(img => img.name).join(', ')}` 
      }, { status: 400 })
    }

    const uploadedImageUrls: string[] = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      if (image.size === 0 || !image.type.startsWith('image/')) continue

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = image.name.split('.').pop() || 'jpg'
      const fileName = `product-${productId}-${timestamp}-${randomString}.${fileExtension}`

      // Upload to Vercel Blob Storage
      const blob = await put(`products/${productId}/${fileName}`, image, {
        access: 'public',
      })

      console.log('✅ Image uploaded to Vercel Blob:', blob.url)
      uploadedImageUrls.push(blob.url)
    }

    if (uploadedImageUrls.length === 0) {
      return NextResponse.json({ error: 'No valid images uploaded' }, { status: 400 })
    }

    // Get current images and append new ones
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

    // Combine existing images with new ones
    const allImages = [...existingImages, ...uploadedImageUrls]

    // Update product with new images
    await pool.execute(
      'UPDATE products SET images = ? WHERE id = ?',
      [JSON.stringify(allImages), productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Images uploaded successfully',
      imageUrls: uploadedImageUrls,
      totalImages: allImages.length
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}