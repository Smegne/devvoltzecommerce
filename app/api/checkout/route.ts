import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle FormData instead of JSON
    const formData = await request.formData();
    const orderDataString = formData.get('orderData') as string;
    
    if (!orderDataString) {
      return NextResponse.json({ error: 'Order data is required' }, { status: 400 });
    }

    let orderData;
    try {
      orderData = JSON.parse(orderDataString);
    } catch (error) {
      console.error('Failed to parse order data:', error);
      return NextResponse.json({ error: 'Invalid order data format' }, { status: 400 });
    }

    const { items, shippingAddress, paymentMethod, totalAmount, email, bankReceiptUrl } = orderData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingAddress || !paymentMethod || !totalAmount || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate order number
      const orderNumber = `DVZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order with customer email
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, status, payment_status, customer_email) 
         VALUES (?, ?, ?, ?, ?, 'pending', 'pending', ?)`,
        [user.id, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod, email]
      );

      const orderId = (orderResult as any).insertId;

      // Create order items and update product stock
      for (const item of items) {
        // Verify product exists and get current price
        const [products] = await connection.execute(
          'SELECT id, price, stock_quantity FROM products WHERE id = ?',
          [item.productId]
        );

        const product = (products as any[])[0];
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Check stock availability
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const unitPrice = item.price || product.price;
        const totalPrice = unitPrice * item.quantity;

        // Add order item
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, unitPrice, totalPrice]
        );

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Clear user's cart after successful order
      await connection.execute(`
        DELETE ci FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
      `, [user.id]);

      await connection.commit();

      console.log(`✅ Order created successfully: ${orderNumber} for user ${user.id}`);

      // Enhanced response with order details
      return NextResponse.json({ 
        success: true, 
        orderId,
        orderNumber,
        message: 'Order placed successfully',
        clearCart: true
      });

    } catch (error) {
      await connection.rollback();
      console.error('Order creation failed:', error);
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}