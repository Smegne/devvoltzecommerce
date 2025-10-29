import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getAuthUser(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params object first
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const { verified, notes } = await request.json();

    const connection = await pool.getConnection();
    
    try {
      // Use the exact ENUM values from your database
      const newPaymentStatus = verified ? 'paid' : 'Failed'; // Note: 'Failed' with capital F
      const newOrderStatus = verified ? 'processing' : 'pending';

      await connection.execute(
        `UPDATE orders 
         SET payment_verified = ?, 
             admin_notes = ?,
             payment_status = ?,
             status = ?
         WHERE id = ?`,
        [
          verified,
          notes || null,
          newPaymentStatus,
          newOrderStatus,
          orderId
        ]
      );

      console.log(`✅ Payment ${verified ? 'verified' : 'rejected'} for order ${orderId}`);

      return NextResponse.json({ 
        success: true, 
        message: `Payment ${verified ? 'verified' : 'rejected'} successfully` 
      });

    } catch (error) {
      console.error('Failed to verify payment:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error code:', (error as any).code);
      }
      
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}