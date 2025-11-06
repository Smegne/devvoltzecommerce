import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('🔐 Admin Traders - Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    console.log('🔐 Token extracted, length:', token.length);

    const user = await getAuthUser(token);
    console.log('🔐 User from token:', user ? `Role: ${user.role}` : 'No user found');
    
    if (!user) {
      console.log('❌ No user found from token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('✅ Admin authorization successful, fetching traders...');
    
    // Fetch all traders with user information
    const [traders] = await pool.execute(`
      SELECT 
        t.*,
        u.name as owner_name,
        u.email as owner_email,
        u.created_at as user_created_at
      FROM traders t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    console.log('✅ Traders fetched successfully, count:', (traders as any[]).length);
    
    return NextResponse.json(traders);

  } catch (error) {
    console.error('❌ Failed to fetch traders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const user = await getAuthUser(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { traderId, action } = await request.json();

    if (!traderId || !action) {
      return NextResponse.json({ error: 'Trader ID and action are required' }, { status: 400 });
    }

    let statusUpdate = '';
    
    switch (action) {
      case 'approve':
        statusUpdate = 'approved';
        break;
      case 'reject':
        statusUpdate = 'rejected';
        break;
      case 'block':
        statusUpdate = 'blocked';
        break;
      case 'unblock':
        statusUpdate = 'approved';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await pool.execute(
      'UPDATE traders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [statusUpdate, traderId]
    );

    console.log(`✅ Trader ${traderId} ${action}d successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Trader ${action}d successfully` 
    });

  } catch (error) {
    console.error('❌ Failed to update trader:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const user = await getAuthUser(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const traderId = searchParams.get('traderId');

    if (!traderId) {
      return NextResponse.json({ error: 'Trader ID is required' }, { status: 400 });
    }

    // Delete trader record
    await pool.execute('DELETE FROM traders WHERE id = ?', [traderId]);

    console.log(`✅ Trader ${traderId} deleted successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trader deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Failed to delete trader:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}