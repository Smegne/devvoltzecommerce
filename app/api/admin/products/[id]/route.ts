import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Admin Products PUT - Auth Header:', authHeader ? 'Present' : 'Missing')
    
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

    const productId = params.id
    console.log('🔄 Updating product ID:', productId)

    const productData = await request.json()
    console.log('📦 Update data received:', productData)

    // Validate required fields
    if (!productData.title || !productData.description || !productData.price || !productData.category || !productData.stock_quantity) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )

    const productRows = existingProducts as any[]
    if (productRows.length === 0) {
      console.log('❌ Product not found')
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Update product
    const [result] = await pool.execute(
      `UPDATE products 
       SET title = ?, description = ?, price = ?, original_price = ?, category = ?, 
           subcategory = ?, brand = ?, stock_quantity = ?, availability = ?, 
           featured = ?, published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
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
        productData.featured,
        productData.published,
        productId
      ]
    )

    console.log('✅ Product updated successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully',
      affectedRows: (result as any).affectedRows
    })

  } catch (error) {
    console.error('❌ Failed to update product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const productId = params.id
    const updateData = await request.json()

    // Build dynamic update query based on provided fields
    const fields = Object.keys(updateData)
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const values = fields.map(field => updateData[field])
    values.push(productId)

    const [result] = await pool.execute(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully',
      affectedRows: (result as any).affectedRows
    })

  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    console.log('🔐 Admin Products DELETE - Auth Header:', authHeader ? 'Present' : 'Missing')
    
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

    const productId = params.id
    console.log('🗑️ Deleting product ID:', productId)

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )

    const productRows = existingProducts as any[]
    if (productRows.length === 0) {
      console.log('❌ Product not found')
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete product
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [productId]
    )

    console.log('✅ Product deleted successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully',
      affectedRows: (result as any).affectedRows
    })

  } catch (error) {
    console.error('❌ Failed to delete product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}