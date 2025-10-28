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
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get total revenue from orders
    const [revenueResult] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE payment_status = "paid"'
    )
    const totalRevenue = (revenueResult as any[])[0]?.total_revenue || 0

    // Get total products count
    const [productsResult] = await pool.execute('SELECT COUNT(*) as total_products FROM products')
    const totalProducts = (productsResult as any[])[0]?.total_products || 0

    // Get total users count
    const [usersResult] = await pool.execute('SELECT COUNT(*) as total_users FROM users')
    const totalUsers = (usersResult as any[])[0]?.total_users || 0

    // Get total orders count
    const [ordersResult] = await pool.execute('SELECT COUNT(*) as total_orders FROM orders')
    const totalOrders = (ordersResult as any[])[0]?.total_orders || 0

    // Get pending orders count
    const [pendingOrdersResult] = await pool.execute(
      'SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"'
    )
    const pendingOrders = (pendingOrdersResult as any[])[0]?.pending_orders || 0

    // Get out of stock products count
    const [outOfStockResult] = await pool.execute(
      'SELECT COUNT(*) as out_of_stock FROM products WHERE stock_quantity = 0'
    )
    const outOfStockProducts = (outOfStockResult as any[])[0]?.out_of_stock || 0

    const stats = {
      totalRevenue: parseFloat(totalRevenue),
      totalProducts: parseInt(totalProducts),
      totalUsers: parseInt(totalUsers),
      totalOrders: parseInt(totalOrders),
      pendingOrders: parseInt(pendingOrders),
      outOfStockProducts: parseInt(outOfStockProducts)
    }

    console.log('📊 Stats calculated:', stats)
    
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}