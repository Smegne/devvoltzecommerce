import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Simple Cloudinary configuration without complex setup
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: 'dpphit1yt',
  api_key: '328153496631566', 
  api_secret: '_2EfSTbOu4lBuxMhG9xeUaEwFx0'
});

export async function POST(request: NextRequest) {
  console.log('🚀 Starting trader registration API...');
  
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

    console.log('📝 Form data extracted:', { 
      name: name?.substring(0, 10) + '...', 
      shopName: shopName?.substring(0, 10) + '...',
      email: email?.substring(0, 10) + '...',
      phone,
      hasLogo: !!shopLogo 
    });

    // Basic validation
    if (!name || !shopName || !email || !phone || !password || !shopAddress) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    try {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUsers as any[]).length > 0) {
        console.log('❌ Email already exists');
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('❌ Database error checking email:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error checking email' },
        { status: 500 }
      );
    }

    // Check if shop name already exists
    try {
      const [existingTraders] = await pool.execute(
        'SELECT id FROM traders WHERE shop_name = ?',
        [shopName]
      );

      if ((existingTraders as any[]).length > 0) {
        console.log('❌ Shop name already exists');
        return NextResponse.json(
          { success: false, message: 'Shop name already taken' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('❌ Database error checking shop name:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error checking shop name' },
        { status: 500 }
      );
    }

    let shopLogoUrl = null;

    // Handle file upload to Cloudinary - SIMPLIFIED
    if (shopLogo && shopLogo.size > 0) {
      console.log('🖼️ Starting image upload...');
      
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(shopLogo.type)) {
          console.log('❌ Invalid file type');
          return NextResponse.json(
            { success: false, message: 'Only JPG and PNG files are allowed' },
            { status: 400 }
          );
        }

        // Convert File to base64 - SIMPLIFIED
        const arrayBuffer = await shopLogo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${shopLogo.type};base64,${buffer.toString('base64')}`;

        console.log('☁️ Uploading to Cloudinary...');
        
        // Upload to Cloudinary with minimal options
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: 'devvoltz/shop-logos'
        });

        shopLogoUrl = uploadResult.secure_url;
        console.log('✅ Image uploaded successfully:', shopLogoUrl);

      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        // Continue without logo - don't fail the entire registration
        console.log('⚠️ Continuing registration without logo');
      }
    }

    // Start database transaction
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      console.log('🔐 Starting database transaction...');

      // Hash password
      const hashedPassword = await hashPassword(password);
      console.log('✅ Password hashed');

      // Create user
      console.log('👤 Creating user...');
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'customer']
      );

      const userId = (userResult as any).insertId;
      console.log('✅ User created with ID:', userId);

      // Create user profile with phone
      console.log('📞 Creating user profile...');
      await connection.execute(
        'INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)',
        [userId, phone]
      );

      // Create trader application
      console.log('🏪 Creating trader record...');
      await connection.execute(
        `INSERT INTO traders (user_id, shop_name, phone, shop_address, shop_description, shop_logo, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [userId, shopName, phone, shopAddress, shopDescription || null, shopLogoUrl]
      );

      await connection.commit();
      console.log('🎉 Transaction committed successfully!');

      return NextResponse.json({
        success: true,
        message: shopLogoUrl 
          ? 'Trader application submitted successfully with logo! You will be notified once approved.'
          : 'Trader application submitted successfully! You will be notified once approved.',
        userId
      });

    } catch (dbError) {
      await connection.rollback();
      console.error('❌ Database transaction failed:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database error. Please try again.',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Unexpected error in trader registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Trader API is working! Use POST to submit trader applications.',
    timestamp: new Date().toISOString()
  });
}