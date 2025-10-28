import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await pool.execute(`
        DELETE ci FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ? AND ci.product_id = ?
      `, [user.id, productId]);
    } else {
      // Update quantity
      await pool.execute(`
        UPDATE cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        SET ci.quantity = ?
        WHERE c.user_id = ? AND ci.product_id = ?
      `, [quantity, user.id, productId]);
    }

    return NextResponse.json({ success: true, message: 'Cart updated' });

  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}