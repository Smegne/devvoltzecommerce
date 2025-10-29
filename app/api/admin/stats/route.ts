import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAuthUser(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();
    
    try {
      // Get total revenue
      const [revenueResult] = await connection.execute(
        'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE payment_status = "paid"'
      );
      
      // Get total products
      const [productsResult] = await connection.execute(
        'SELECT COUNT(*) as total_products FROM products'
      );
      
      // Get total users
      const [usersResult] = await connection.execute(
        'SELECT COUNT(*) as total_users FROM users'
      );
      
      // Get total orders
      const [ordersResult] = await connection.execute(
        'SELECT COUNT(*) as total_orders FROM orders'
      );
      
      // Get pending orders
      const [pendingOrdersResult] = await connection.execute(
        'SELECT COUNT(*) as pending_orders FROM orders WHERE status = "pending"'
      );
      
      // Get out of stock products
      const [outOfStockResult] = await connection.execute(
        'SELECT COUNT(*) as out_of_stock FROM products WHERE stock_quantity = 0'
      );

      const totalRevenue = (revenueResult as any[])[0]?.total_revenue || 0;
      const totalProducts = (productsResult as any[])[0]?.total_products || 0;
      const totalUsers = (usersResult as any[])[0]?.total_users || 0;
      const totalOrders = (ordersResult as any[])[0]?.total_orders || 0;
      const pendingOrders = (pendingOrdersResult as any[])[0]?.pending_orders || 0;
      const outOfStockProducts = (outOfStockResult as any[])[0]?.out_of_stock || 0;

      // Calculate monthly revenue (last 30 days)
      const [monthlyRevenueResult] = await connection.execute(
        'SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue FROM orders WHERE payment_status = "paid" AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );
      const monthlyRevenue = (monthlyRevenueResult as any[])[0]?.monthly_revenue || 0;

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return NextResponse.json({
        totalRevenue: Number(totalRevenue),
        totalProducts: Number(totalProducts),
        totalUsers: Number(totalUsers),
        totalOrders: Number(totalOrders),
        pendingOrders: Number(pendingOrders),
        outOfStockProducts: Number(outOfStockProducts),
        monthlyRevenue: Number(monthlyRevenue),
        averageOrderValue: Number(averageOrderValue)
      });

    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}