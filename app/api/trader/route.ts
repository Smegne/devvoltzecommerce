import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const shopName = formData.get('shopName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const shopAddress = formData.get('shopAddress') as string;
    const shopDescription = formData.get('shopDescription') as string;
    const shopLogo = formData.get('shopLogo') as File | null;

    // Basic validation
    if (!name || !shopName || !email || !phone || !password || !shopAddress) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if shop name already exists
    const [existingTraders] = await pool.execute(
      'SELECT id FROM traders WHERE shop_name = ?',
      [shopName]
    );

    if ((existingTraders as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Shop name already taken' },
        { status: 400 }
      );
    }

    let shopLogoPath = null;

    // Handle file upload
    if (shopLogo && shopLogo.size > 0) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(shopLogo.type)) {
        return NextResponse.json(
          { success: false, message: 'Only JPG and PNG files are allowed' },
          { status: 400 }
        );
      }

      // Validate file size (5MB)
      if (shopLogo.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'File size must be less than 5MB' },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'shop-logos');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(shopLogo.name);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      shopLogoPath = path.join('/uploads/shop-logos', fileName);

      // Convert File to Buffer and save
      const bytes = await shopLogo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(process.cwd(), 'public', shopLogoPath), buffer);
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'customer'] // Start as customer, can be upgraded to trader after approval
      );

      const userId = (userResult as any).insertId;

      // Create user profile with phone
      await connection.execute(
        'INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)',
        [userId, phone]
      );

      // Create trader application
      await connection.execute(
        `INSERT INTO traders (user_id, shop_name, phone, shop_address, shop_description, shop_logo, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [userId, shopName, phone, shopAddress, shopDescription || null, shopLogoPath]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Trader application submitted successfully. You will be notified once approved.',
        userId
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Trader registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get trader data
    const [traders] = await pool.execute(
      `SELECT t.*, u.name, u.email 
       FROM traders t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.user_id = ?`,
      [userId]
    );

    const trader = (traders as any[])[0];
    
    if (!trader) {
      return NextResponse.json(
        { success: false, message: 'Trader not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trader
    });

  } catch (error) {
    console.error('Get trader error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}