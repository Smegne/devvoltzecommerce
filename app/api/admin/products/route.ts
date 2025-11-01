import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Admin Products GET - Auth Header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7) // Remove 'Bearer ' prefix
    console.log('🔐 Token extracted, length:', token.length)

    const user = await getAuthUser(token)
    console.log('🔐 User from token:', user ? `Role: ${user.role}` : 'No user found')
    
    if (!user) {
      console.log('❌ No user found from token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin authorization successful, fetching products...')
    
    const [products] = await pool.execute(`
      SELECT id, title, description, price, original_price, category, subcategory, brand, 
             stock_quantity, availability, images, featured, published, created_at
      FROM products 
      ORDER BY created_at DESC
    `)

    console.log('✅ Products fetched successfully, count:', (products as any[]).length)
    
    // FIX: Ensure we always return a consistent array format
    const productsArray = Array.isArray(products) ? products : []
    
    // FIX: Format products with proper image handling
    const formattedProducts = productsArray.map((product: any) => {
      // Handle images - ensure it's always an array
      let images: string[] = []
      try {
        if (typeof product.images === 'string') {
          images = JSON.parse(product.images)
        } else if (Array.isArray(product.images)) {
          images = product.images
        }
      } catch (error) {
        console.error('❌ Error parsing images for product:', product.id, error)
        images = []
      }
      
      // Ensure images is always an array
      if (!Array.isArray(images)) {
        images = []
      }
      
      // Add placeholder if no images
      if (images.length === 0) {
        images = ['/api/placeholder/400/400?text=No+Image']
      }

      return {
        id: product.id,
        title: product.title || 'Untitled Product',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        category: product.category || 'Uncategorized',
        subcategory: product.subcategory || null,
        brand: product.brand || null,
        stock_quantity: parseInt(product.stock_quantity) || 0,
        availability: product.availability || 'in_stock',
        images: images,
        featured: Boolean(product.featured),
        published: Boolean(product.published !== false),
        created_at: product.created_at,
        updated_at: product.updated_at,
        rating: parseFloat(product.rating) || 4.5,
        review_count: parseInt(product.review_count) || 0
      }
    })

    console.log('✅ Formatted products count:', formattedProducts.length)
    
    // FIX: Return as array directly (not wrapped in object)
    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
    // FIX: Return empty array on error to prevent frontend crashes
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Admin Products POST - Auth Header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    console.log('🔐 Token extracted, length:', token.length)

    const user = await getAuthUser(token)
    console.log('🔐 User from token:', user ? `Role: ${user.role}` : 'No user found')
    
    if (!user) {
      console.log('❌ No user found from token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin authorization successful, creating product...')

    // Check content type and handle accordingly
    const contentType = request.headers.get('content-type')
    console.log('📦 Content-Type:', contentType)

    let productData: any = {}
    let imageFiles: File[] = []

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data with file uploads
      const formData = await request.formData()
      
      // Get product data
      productData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
        category: formData.get('category') as string,
        subcategory: formData.get('subcategory') as string || null,
        brand: formData.get('brand') as string || null,
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        availability: formData.get('availability') as string,
        featured: formData.get('featured') === 'true',
        published: formData.get('published') === 'true'
      }

      // Get image files
      const images = formData.getAll('images')
      imageFiles = images.filter(img => img instanceof File) as File[]
      console.log('📸 Image files received:', imageFiles.length)

    } else if (contentType?.includes('application/json')) {
      // Handle JSON data (from your dashboard)
      productData = await request.json()
      console.log('📦 JSON data received:', productData)
    } else {
      console.log('❌ Unsupported content type:', contentType)
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    // Validate required fields
    if (!productData.title || !productData.description || !productData.price || !productData.category || !productData.stock_quantity) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('💾 Inserting product into database...')
    
    // Start with empty images array
    const initialImages: string[] = []

    const [result] = await pool.execute(
      `INSERT INTO products (title, description, price, original_price, category, subcategory, brand, stock_quantity, availability, images, featured, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.title, 
        productData.description, 
        productData.price, 
        productData.original_price, 
        productData.category, 
        productData.subcategory, 
        productData.brand, 
        productData.stock_quantity, 
        productData.availability, 
        JSON.stringify(initialImages),
        productData.featured || false,
        productData.published !== false
      ]
    )

    const productId = (result as any).insertId
    console.log('✅ Product created successfully, ID:', productId)

    // Handle image uploads if there are any
    if (imageFiles.length > 0) {
      console.log('📸 Uploading product images...')
      
      const imageFormData = new FormData()
      imageFiles.forEach(file => {
        imageFormData.append('images', file)
      })

      try {
        const imageResponse = await fetch(`${request.nextUrl.origin}/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        })

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json()
          console.log('✅ Images uploaded successfully:', imageResult.imageUrls)
        } else {
          console.error('❌ Failed to upload images:', await imageResponse.text())
        }
      } catch (imageError) {
        console.error('❌ Image upload failed:', imageError)
      }
    }
    
    // FIX: Return consistent success response
    return NextResponse.json({ 
      success: true, 
      productId,
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('❌ Failed to create product:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}