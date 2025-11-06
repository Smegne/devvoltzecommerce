import { NextRequest, NextResponse } from 'next/server';

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dpphit1yt',
  api_key: '328153496631566',
  api_secret: '_2EfSTbOu4lBuxMhG9xeUaEwFx0'
});

export async function GET(request: NextRequest) {
  try {
    // Test Cloudinary configuration
    const result = await cloudinary.uploader.upload(
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwODhDQyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldlZvbHR6PC90ZXh0Pjwvc3ZnPg==',
      {
        folder: 'devvoltz/test',
        public_id: 'test_image'
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Cloudinary is working!',
      cloudinaryUrl: result.secure_url
    });

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Cloudinary test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}