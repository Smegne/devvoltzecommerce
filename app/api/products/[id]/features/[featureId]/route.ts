import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; featureId: string }> }
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

    const { id: productId, featureId } = await params

    await pool.execute(
      'DELETE FROM product_features WHERE id = ? AND product_id = ?',
      [featureId, productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Feature deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product feature:', error)
    return NextResponse.json(
      { error: 'Failed to delete product feature' },
      { status: 500 }
    )
  }
}