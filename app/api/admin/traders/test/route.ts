import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const shopName = formData.get('shopName') as string;
    const email = formData.get('email') as string;

    console.log('✅ Test API received:', { name, shopName, email });

    return NextResponse.json({
      success: true,
      message: 'Test successful!',
      received: { name, shopName, email }
    });

  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}