import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    const [features] = await pool.execute(
      `SELECT id, product_id, title, description, icon, created_at 
       FROM product_features 
       WHERE product_id = ? 
       ORDER BY created_at ASC`,
      [productId]
    )

    return NextResponse.json({
      success: true,
      features: features || []
    })

  } catch (error) {
    console.error('Error fetching product features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product features' },
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
    const { title, description, icon } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Feature title is required' },
        { status: 400 }
      )
    }

    const [result] = await pool.execute(
      `INSERT INTO product_features (product_id, title, description, icon) 
       VALUES (?, ?, ?, ?)`,
      [productId, title, description, icon || null]
    )

    return NextResponse.json({
      success: true,
      featureId: (result as any).insertId,
      message: 'Feature added successfully'
    })

  } catch (error) {
    console.error('Error adding product feature:', error)
    return NextResponse.json(
      { error: 'Failed to add product feature' },
      { status: 500 }
    )
  }
}