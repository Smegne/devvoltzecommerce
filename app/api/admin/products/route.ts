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

    console.log('✅ Admin authorization successful, fetching products...')
    
    const [products] = await pool.execute(`
      SELECT id, title, description, price, original_price, category, subcategory, brand, 
             stock_quantity, availability, images, featured, published, created_at,
             rating, review_count
      FROM products 
      ORDER BY created_at DESC
    `)

    console.log('✅ Products fetched successfully, count:', (products as any[]).length)
    
    const productsArray = Array.isArray(products) ? products : []
    
    // ENHANCED: Better image handling for production
    const formattedProducts = productsArray.map((product: any) => {
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
      
      if (!Array.isArray(images)) {
        images = []
      }
      
      // ENHANCED: Ensure all images are properly formatted
      images = images.map(img => {
        // Convert any local paths to proper URLs
        if (img.startsWith('/uploads/')) {
          // These are now in public folder, so they work in both dev and production
          return img
        }
        
        // Replace external placeholders with local ones
        if (img.includes('via.placeholder.com') || img.includes('placeholder.com')) {
          const productName = encodeURIComponent(product.title || 'Product')
          return `/api/placeholder/400/400?text=${productName}`
        }
        
        return img
      })
      
      // Use placeholder if no valid images
      if (images.length === 0 || images.every(img => !img || img === '')) {
        const productName = encodeURIComponent(product.title || 'Product')
        images = [`/api/placeholder/400/400?text=${productName}`]
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
    
    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error('❌ Failed to fetch products:', error)
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
    const user = await getAuthUser(token)
    
    if (!user) {
      console.log('❌ No user found from token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role)
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    console.log('✅ Admin authorization successful, creating product...')

    const contentType = request.headers.get('content-type')
    console.log('📦 Content-Type:', contentType)

    let productData: any = {}
    let imageFiles: File[] = []

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      
      productData = {
        title: (formData.get('title') as string)?.trim(),
        description: (formData.get('description') as string)?.trim(),
        price: parseFloat(formData.get('price') as string),
        original_price: formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null,
        category: (formData.get('category') as string)?.trim(),
        subcategory: (formData.get('subcategory') as string)?.trim() || null,
        brand: (formData.get('brand') as string)?.trim() || null,
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        availability: formData.get('availability') as string,
        featured: formData.get('featured') === 'true',
        published: formData.get('published') !== 'false'
      }

      const images = formData.getAll('images')
      imageFiles = images.filter(img => img instanceof File) as File[]
      console.log('📸 Image files received:', imageFiles.length)

    } else if (contentType?.includes('application/json')) {
      productData = await request.json()
      
      productData = {
        title: productData.title?.trim(),
        description: productData.description?.trim(),
        price: parseFloat(productData.price),
        original_price: productData.original_price ? parseFloat(productData.original_price) : null,
        category: productData.category?.trim(),
        subcategory: productData.subcategory?.trim() || null,
        brand: productData.brand?.trim() || null,
        stock_quantity: parseInt(productData.stock_quantity),
        availability: productData.availability || 'in_stock',
        featured: Boolean(productData.featured),
        published: productData.published !== false
      }
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    // Validation
    if (!productData.title || productData.title.length < 2) {
      return NextResponse.json({ error: 'Product title must be at least 2 characters' }, { status: 400 })
    }
    
    if (!productData.description || productData.description.length < 10) {
      return NextResponse.json({ error: 'Product description must be at least 10 characters' }, { status: 400 })
    }
    
    if (!productData.price || productData.price <= 0) {
      return NextResponse.json({ error: 'Product price must be greater than 0' }, { status: 400 })
    }
    
    if (!productData.category) {
      return NextResponse.json({ error: 'Product category is required' }, { status: 400 })
    }
    
    if (!productData.stock_quantity || productData.stock_quantity < 0) {
      return NextResponse.json({ error: 'Valid stock quantity is required' }, { status: 400 })
    }

    console.log('💾 Inserting product into database...')
    
    // Start with placeholder image
    const productName = encodeURIComponent(productData.title || 'New Product')
    const initialImages = [`/api/placeholder/400/400?text=${productName}`]

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

    // Upload images if provided
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
    
    return NextResponse.json({ 
      success: true, 
      productId,
      message: 'Product created successfully'
    })

  } catch (error) {
    console.error('❌ Failed to create product:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}