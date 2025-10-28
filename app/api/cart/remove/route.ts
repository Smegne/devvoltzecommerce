import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await pool.execute(`
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ? AND ci.product_id = ?
    `, [user.id, productId]);

    return NextResponse.json({ success: true, message: 'Item removed from cart' });

  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}