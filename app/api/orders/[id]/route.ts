import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin can update order status
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status, admin_notes } = body

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Check if order exists
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    )

    if ((orders as any[]).length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = []
    const updateParams: any[] = []

    if (status) {
      updateFields.push('status = ?')
      updateParams.push(status)
    }

    if (admin_notes !== undefined) {
      updateFields.push('admin_notes = ?')
      updateParams.push(admin_notes)
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP')

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateParams.push(id)

    const query = `
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    const [result] = await pool.execute(query, updateParams)

    // Fetch the updated order
    const [updatedOrders] = await pool.execute(
      `SELECT 
        o.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    )

    const updatedOrder = (updatedOrders as any[])[0]

    const formattedOrder = {
      id: updatedOrder.id,
      user_id: updatedOrder.user_id,
      order_number: updatedOrder.order_number,
      total_amount: parseFloat(updatedOrder.total_amount),
      shipping_address: typeof updatedOrder.shipping_address === 'string' 
        ? JSON.parse(updatedOrder.shipping_address) 
        : updatedOrder.shipping_address,
      payment_method: updatedOrder.payment_method,
      status: updatedOrder.status,
      payment_status: updatedOrder.payment_status,
      customer_email: updatedOrder.customer_email,
      payment_verification_url: updatedOrder.payment_verification_url,
      payment_screenshot_filename: updatedOrder.payment_screenshot_filename,
      payment_verified: Boolean(updatedOrder.payment_verified),
      admin_notes: updatedOrder.admin_notes,
      created_at: updatedOrder.created_at,
      updated_at: updatedOrder.updated_at,
      user: updatedOrder.user_id ? {
        id: updatedOrder.user_id,
        name: updatedOrder.user_name,
        email: updatedOrder.user_email,
        role: updatedOrder.user_role
      } : null
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: formattedOrder
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also add GET method to fetch single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = `
      SELECT 
        o.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `

    const [orders] = await pool.execute(query, [id])

    if ((orders as any[]).length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = (orders as any[])[0]

    // Check if user has permission to view this order
    if (user.role !== 'admin' && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formattedOrder = {
      id: order.id,
      user_id: order.user_id,
      order_number: order.order_number,
      total_amount: parseFloat(order.total_amount),
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
      payment_method: order.payment_method,
      status: order.status,
      payment_status: order.payment_status,
      customer_email: order.customer_email,
      payment_verification_url: order.payment_verification_url,
      payment_screenshot_filename: order.payment_screenshot_filename,
      payment_verified: Boolean(order.payment_verified),
      admin_notes: order.admin_notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      user: order.user_id ? {
        id: order.user_id,
        name: order.user_name,
        email: order.user_email,
        role: order.user_role
      } : null
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}