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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user's cart
    const [carts] = await pool.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [user.id]
    );

    let cartId;
    const cartRows = carts as any[];
    
    if (cartRows.length === 0) {
      // Create new cart
      const [result] = await pool.execute(
        'INSERT INTO carts (user_id) VALUES (?)',
        [user.id]
      );
      cartId = (result as any).insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // Get cart items with product details - FIXED COLUMN NAMES
    const [cartItems] = await pool.execute(`
      SELECT 
        ci.product_id as productId,
        ci.quantity,
        p.title as name,
        p.description,
        p.price,
        p.images,
        p.category,
        p.stock_quantity as stockQuantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    // Transform the images field from JSON string to array
 // In the GET method, update the image transformation:
// In the GET method, update the image transformation to be more robust:
const transformedItems = (cartItems as any[]).map(item => {
  let images: string[] = [];
  
  try {
    if (item.images) {
      if (typeof item.images === 'string') {
        // Try to parse JSON, if it fails use as single image
        try {
          const parsed = JSON.parse(item.images);
          images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
        } catch {
          images = [item.images].filter(Boolean);
        }
      } else if (Array.isArray(item.images)) {
        images = item.images;
      }
    }
  } catch (error) {
    console.warn('Failed to parse images for product:', item.productId, error);
  }
  
  // Fallback to local placeholder
  if (images.length === 0) {
    images = [`/api/placeholder/300/300?text=${encodeURIComponent(item.name || 'Product')}`];
  }

  return {
    ...item,
    images: images
  };
});

    return NextResponse.json({
      cartId,
      items: transformedItems,
      totalItems: transformedItems.reduce((sum, item) => sum + item.quantity, 0)
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    const productRows = products as any[];
    if (productRows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get or create user's cart
    const [carts] = await pool.execute(
      'SELECT id FROM carts WHERE user_id = ?',
      [user.id]
    );

    let cartId;
    const cartRows = carts as any[];
    
    if (cartRows.length === 0) {
      const [result] = await pool.execute(
        'INSERT INTO carts (user_id) VALUES (?)',
        [user.id]
      );
      cartId = (result as any).insertId;
    } else {
      cartId = cartRows[0].id;
    }

    // Add or update item in cart
    await pool.execute(`
      INSERT INTO cart_items (cart_id, product_id, quantity) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE quantity = quantity + ?
    `, [cartId, productId, quantity, quantity]);

    return NextResponse.json({ success: true, message: 'Item added to cart' });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}