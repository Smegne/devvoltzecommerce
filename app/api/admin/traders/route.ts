// import { NextRequest, NextResponse } from 'next/server';
// import pool from '@/lib/db';
// import { getAuthUser } from '@/lib/auth';

// export async function GET(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
//     console.log('🔐 Admin Traders - Auth Header:', authHeader ? 'Present' : 'Missing');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       console.log('❌ No Bearer token found');
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.slice(7);
//     console.log('🔐 Token extracted, length:', token.length);

//     const user = await getAuthUser(token);
//     console.log('🔐 User from token:', user ? `Role: ${user.role}` : 'No user found');
    
//     if (!user) {
//       console.log('❌ No user found from token');
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     if (user.role !== 'admin') {
//       console.log('❌ User is not admin, role:', user.role);
//       return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
//     }

//     console.log('✅ Admin authorization successful, fetching traders...');
    
//     // Fetch all traders with user information
//     const [traders] = await pool.execute(`
//       SELECT
//         t.*,
//         u.name as owner_name,
//         u.email as owner_email,
//         u.created_at as user_created_at
//       FROM traders t
//       JOIN users u ON t.user_id = u.id
//       ORDER BY t.created_at DESC
//     `);

//     console.log('✅ Traders fetched successfully, count:', (traders as any[]).length);
    
//     return NextResponse.json(traders);

//   } catch (error) {
//     console.error('❌ Failed to fetch traders:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.slice(7);
//     const user = await getAuthUser(token);
    
//     if (!user || user.role !== 'admin') {
//       return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
//     }

//     const { traderId, action } = await request.json();

//     if (!traderId || !action) {
//       return NextResponse.json({ error: 'Trader ID and action are required' }, { status: 400 });
//     }

//     let statusUpdate = '';
    
//     switch (action) {
//       case 'approve':
//         statusUpdate = 'approved';
//         break;
//       case 'reject':
//         statusUpdate = 'rejected';
//         break;
//       case 'block':
//         statusUpdate = 'blocked';
//         break;
//       case 'unblock':
//         statusUpdate = 'approved';
//         break;
//       default:
//         return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
//     }

//     await pool.execute(
//       'UPDATE traders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
//       [statusUpdate, traderId]
//     );

//     console.log(`✅ Trader ${traderId} ${action}d successfully`);
    
//     return NextResponse.json({
//       success: true,
//       message: `Trader ${action}d successfully`
//     });

//   } catch (error) {
//     console.error('❌ Failed to update trader:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const authHeader = request.headers.get('Authorization');
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const token = authHeader.slice(7);
//     const user = await getAuthUser(token);
    
//     if (!user || user.role !== 'admin') {
//       return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
//     }

//     const { searchParams } = new URL(request.url);
//     const traderId = searchParams.get('traderId');

//     if (!traderId) {
//       return NextResponse.json({ error: 'Trader ID is required' }, { status: 400 });
//     }

//     // Delete trader record
//     await pool.execute('DELETE FROM traders WHERE id = ?', [traderId]);

//     console.log(`✅ Trader ${traderId} deleted successfully`);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Trader deleted successfully'
//     });

//   } catch (error) {
//     console.error('❌ Failed to delete trader:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Cloudinary configuration
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpphit1yt',
  api_key: process.env.CLOUDINARY_API_KEY || '328153496631566',
  api_secret: process.env.CLOUDINARY_API_SECRET || '_2EfSTbOu4lBuxMhG9xeUaEwFx0'
});

export async function POST(request: NextRequest) {
  console.log('🔄 Starting trader registration...');
  
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

    console.log('📝 Form data received:', { name, shopName, email, phone });

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
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      console.log('❌ Password too short');
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
      console.log('❌ Email already exists:', email);
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
      console.log('❌ Shop name already exists:', shopName);
      return NextResponse.json(
        { success: false, message: 'Shop name already taken' },
        { status: 400 }
      );
    }

    let shopLogoUrl = null;

    // Handle file upload to Cloudinary
    if (shopLogo && shopLogo.size > 0) {
      console.log('🖼️ Processing shop logo upload...');
      
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(shopLogo.type)) {
          console.log('❌ Invalid file type:', shopLogo.type);
          return NextResponse.json(
            { success: false, message: 'Only JPG and PNG files are allowed' },
            { status: 400 }
          );
        }

        // Validate file size (5MB)
        if (shopLogo.size > 5 * 1024 * 1024) {
          console.log('❌ File too large:', shopLogo.size);
          return NextResponse.json(
            { success: false, message: 'File size must be less than 5MB' },
            { status: 400 }
          );
        }

        console.log('☁️ Uploading to Cloudinary...');
        
        // Convert File to buffer and then to base64
        const arrayBuffer = await shopLogo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${shopLogo.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: 'devvoltz/shop-logos',
          public_id: `shop_${Date.now()}`,
          overwrite: false,
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        });

        shopLogoUrl = uploadResult.secure_url;
        console.log('✅ Cloudinary upload successful:', shopLogoUrl);

      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        // Don't fail the entire registration if image upload fails
        console.log('⚠️ Continuing registration without logo due to upload error');
      }
    } else {
      console.log('ℹ️ No shop logo provided, continuing without logo');
    }

    // Start database transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      console.log('🔐 Hashing password...');
      // Hash password
      const hashedPassword = await hashPassword(password);

      console.log('👤 Creating user...');
      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'customer']
      );

      const userId = (userResult as any).insertId;
      console.log('✅ User created with ID:', userId);

      console.log('📞 Creating user profile...');
      // Create user profile with phone
      await connection.execute(
        'INSERT INTO user_profiles (user_id, phone) VALUES (?, ?)',
        [userId, phone]
      );

      console.log('🏪 Creating trader application...');
      // Create trader application
      await connection.execute(
        `INSERT INTO traders (user_id, shop_name, phone, shop_address, shop_description, shop_logo, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [userId, shopName, phone, shopAddress, shopDescription || null, shopLogoUrl]
      );

      await connection.commit();
      console.log('🎉 Trader registration completed successfully for:', email);

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
        { success: false, message: 'Database error. Please try again.' },
        { status: 500 }
      );
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Trader registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Keep the GET function the same as before
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