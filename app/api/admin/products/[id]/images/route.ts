import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Check if we're in production (where file system is read-only)
const isProduction = process.env.NODE_ENV === 'production'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🖼️ Starting image upload process...')
  console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT')
  
  try {
    // AWAIT the params first
    const { id } = await params
    console.log('📦 Product ID:', id)
    
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid Bearer token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
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
      'SELECT id, title FROM products WHERE id = ?',
      [productId]
    )

    if ((products as any[]).length === 0) {
      console.log('❌ Product not found:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = (products as any[])[0]
    console.log('✅ Product validation passed:', product.title)

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

      if (isProduction) {
        // PRODUCTION: Use placeholder images (file system is read-only)
        console.log('🚫 Production environment - using placeholder images')
        const productName = encodeURIComponent(product.title || `Product-${productId}`)
        const placeholderUrl = `/api/placeholder/400/400?text=${productName}`
        uploadedImageUrls.push(placeholderUrl)
        console.log('🎨 Using placeholder:', placeholderUrl)
      } else {
        // DEVELOPMENT: Save files locally
        try {
          // Generate unique filename
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 15)
          const fileExtension = image.name.split('.').pop() || 'jpg'
          const fileName = `product-${productId}-${timestamp}-${randomString}.${fileExtension}`

          // Convert image to buffer
          const bytes = await image.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Use public folder for development
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
        } catch (fileError) {
          console.error('❌ File system error in development:', fileError)
          // Fallback to placeholder even in development if file write fails
          const productName = encodeURIComponent(product.title || `Product-${productId}`)
          uploadedImageUrls.push(`/api/placeholder/400/400?text=${productName}`)
        }
      }
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

    // Replace placeholder with actual images (or keep placeholders in production)
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
      message: isProduction 
        ? 'Product created with placeholder images (file uploads disabled in production)' 
        : 'Images uploaded successfully',
      imageUrls: uploadedImageUrls,
      totalImages: updatedImages.length,
      environment: isProduction ? 'production' : 'development'
    })

  } catch (error) {
    console.error('❌ Image upload error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: isProduction ? 'production' : 'development'
    }, { status: 500 })
  }
}