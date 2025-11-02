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
  console.log('🖼️ Starting image upload process...')
  
  try {
    // AWAIT the params first
    const { id } = await params
    console.log('📦 Product ID:', id)
    
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid Bearer token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    console.log('🔐 Token length:', token.length)

    const user = await getAuthUser(token)
    console.log('👤 User found:', user ? `Role: ${user.role}` : 'No user')
    
    if (!user) {
      console.log('❌ No user found from token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const productId = id
    console.log('🛍️ Processing images for product:', productId)

    // Validate product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      console.log('❌ Product not found:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('✅ Product validation passed')

    // Get form data
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]
    console.log('📸 Images received:', images.length)

    if (!images || images.length === 0) {
      console.log('❌ No images provided')
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const uploadedImageUrls: string[] = []

    // Process each image
    for (const image of images) {
      if (image.size === 0) {
        console.log('⚠️ Skipping empty file')
        continue
      }

      // Validate file type
      if (!image.type.startsWith('image/')) {
        console.log('⚠️ Skipping non-image file:', image.type)
        continue
      }

      console.log('🖼️ Processing image:', image.name, 'Type:', image.type, 'Size:', image.size)

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = image.name.split('.').pop() || 'jpg'
      const fileName = `product-${productId}-${timestamp}-${randomString}.${fileExtension}`

      // Convert image to buffer
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // ALWAYS use public folder for both dev and production
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
      const filePath = join(uploadDir, fileName)
      const publicUrl = `/uploads/products/${fileName}`

      console.log('📁 Upload directory:', uploadDir)
      console.log('💾 File path:', filePath)
      console.log('🌐 Public URL:', publicUrl)

      // Create directory if it doesn't exist
      if (!existsSync(uploadDir)) {
        console.log('📂 Creating upload directory...')
        await mkdir(uploadDir, { recursive: true })
        console.log('✅ Upload directory created')
      }

      // Save file to public folder
      console.log('💿 Writing file...')
      await writeFile(filePath, buffer)
      console.log('✅ File saved successfully')
      
      uploadedImageUrls.push(publicUrl)
      
      console.log(`✅ Image processed: ${publicUrl}`)
    }

    if (uploadedImageUrls.length === 0) {
      console.log('❌ No valid images uploaded after processing')
      return NextResponse.json({ error: 'No valid images uploaded' }, { status: 400 })
    }

    console.log('📊 Total uploaded images:', uploadedImageUrls.length)

    // Get current images from database
    const [currentProduct] = await pool.execute(
      'SELECT images FROM products WHERE id = ?',
      [productId]
    )

    const currentImages = (currentProduct as any[])[0]?.images || '[]'
    let existingImages: string[] = []

    try {
      existingImages = JSON.parse(currentImages)
      console.log('📋 Existing images count:', existingImages.length)
    } catch (error) {
      console.log('⚠️ Error parsing existing images, starting fresh')
      existingImages = []
    }

    // Replace placeholder with actual images
    const updatedImages = [...uploadedImageUrls]
    console.log('🔄 Final images array:', updatedImages)

    // Update product with new images
    console.log('💾 Updating database...')
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
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}