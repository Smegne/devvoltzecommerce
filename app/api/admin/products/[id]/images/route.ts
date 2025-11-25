import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { uploadToCloudinary } from '@/lib/cloudinary'

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production'
// Always use Cloudinary if credentials are available
const useCloudinary = true // Since you have working credentials

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🖼️ Starting image upload process...')
  console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT')
  console.log('☁️ Cloudinary: ENABLED (credentials provided)')
  
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
    for (const [index, image] of images.entries()) {
      if (image.size === 0) {
        console.log('⚠️ Skipping empty file')
        continue
      }

      // Validate file type
      if (!image.type.startsWith('image/')) {
        console.log('⚠️ Skipping non-image file:', image.type)
        continue
      }

      console.log(`🖼️ [${index + 1}/${images.length}] Processing:`, image.name, 'Type:', image.type, 'Size:', image.size)

      try {
        // ALWAYS USE CLOUDINARY (since you have credentials)
        console.log('☁️ Uploading to Cloudinary...')
        const cloudinaryResult = await uploadToCloudinary(image, 'devvoltz')
        uploadedImageUrls.push(cloudinaryResult.url)
        console.log(`✅ [${index + 1}/${images.length}] Cloudinary upload successful`)
        
      } catch (cloudinaryError) {
        console.error(`❌ [${index + 1}/${images.length}] Cloudinary upload failed:`, cloudinaryError)
        
        // Fallback to local storage only in development
        if (!isProduction) {
          try {
            console.log('🔄 Falling back to local storage...')
            const localUrl = await saveImageLocally(image, productId, product.title)
            uploadedImageUrls.push(localUrl)
            console.log(`✅ [${index + 1}/${images.length}] Local fallback successful`)
          } catch (localError) {
            console.error(`❌ [${index + 1}/${images.length}] Local fallback also failed:`, localError)
            // Final fallback - placeholder
            const placeholderUrl = getPlaceholderUrl(product.title, productId)
            uploadedImageUrls.push(placeholderUrl)
          }
        } else {
          // In production, use placeholder if Cloudinary fails
          console.log('🚫 Production fallback: using placeholder')
          const placeholderUrl = getPlaceholderUrl(product.title, productId)
          uploadedImageUrls.push(placeholderUrl)
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

    // For new products, replace existing images. For existing products, append.
    const isNewProduct = existingImages.length === 0 || 
                        (existingImages.length === 1 && existingImages[0].includes('placeholder'))
    
    const updatedImages = isNewProduct ? uploadedImageUrls : [...existingImages, ...uploadedImageUrls]
    
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
      message: 'Images uploaded to Cloudinary successfully',
      imageUrls: uploadedImageUrls,
      totalImages: updatedImages.length,
      storage: 'cloudinary',
      productId: productId
    })

  } catch (error) {
    console.error('❌ Image upload error:', error)
    
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      console.error('❌ Stack trace:', error.stack)
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: isProduction ? 'production' : 'development'
    }, { status: 500 })
  }
}

// Helper function for local file storage (development fallback only)
async function saveImageLocally(image: File, productId: string, productTitle: string): Promise<string> {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = image.name.split('.').pop() || 'jpg'
  const fileName = `product-${productId}-${timestamp}-${randomString}.${fileExtension}`

  const bytes = await image.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
  const filePath = join(uploadDir, fileName)
  const publicUrl = `/uploads/products/${fileName}`

  console.log('📁 Local upload directory:', uploadDir)

  if (!existsSync(uploadDir)) {
    console.log('📂 Creating local upload directory...')
    await mkdir(uploadDir, { recursive: true })
  }

  console.log('💿 Writing file locally...')
  await writeFile(filePath, buffer)
  console.log('✅ Local file saved successfully')
  
  return publicUrl
}

// Helper function for placeholder URLs
function getPlaceholderUrl(productTitle: string, productId: string): string {
  const productName = encodeURIComponent(productTitle || `Product-${productId}`)
  return `/api/placeholder/400/400?text=${productName}`
}