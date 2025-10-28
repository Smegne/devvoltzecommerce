/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization configuration - CORRECTED VERSION
  images: {
    // Allow images from these domains
    domains: [
      'localhost',
      '127.0.0.1', 
      'via.placeholder.com',
      'images.unsplash.com',
      'picsum.photos'
    ],
    
    // Remote patterns for image optimization
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http', 
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
    
    // Image sizes for optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Only allow webp and avif formats
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables exposed to the browser
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard', 
        destination: '/admin/dashboard',
        permanent: false,
      },
    ]
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/placeholder/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,
}

export default nextConfig