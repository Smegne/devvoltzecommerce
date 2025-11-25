import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const user = await getAuthUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('payment_status')

    let query = `
      SELECT 
        o.*,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
    `
    const params: any[] = [user.id]

    // Add filters
    if (status && status !== 'all') {
      query += ' AND o.status = ?'
      params.push(status)
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query += ' AND o.payment_status = ?'
      params.push(paymentStatus)
    }

    // Order by latest first
    query += ' ORDER BY o.created_at DESC'

    const [orders] = await pool.execute(query, params)

    // Format the response
    const formattedOrders = (orders as any[]).map(order => ({
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
      user: {
        id: order.user_id,
        name: order.user_name,
        email: order.user_email,
        role: order.user_role
      }
    }))

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.length
    })

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}