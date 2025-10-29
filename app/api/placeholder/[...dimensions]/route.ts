import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const { dimensions } = params
    const [width = 400, height = 400] = dimensions[0].split('x').map(Number)
    
    // Get text parameter from search params
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text') || `${width}x${height}`
    
    // Create a simple SVG placeholder - OPTIMIZED VERSION
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect width="100%" height="100%" fill="rgba(255,255,255,0.8)"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${Math.min(width, height) / 10}" 
          fill="#6B7280" 
          text-anchor="middle" 
          dy=".3em"
          font-weight="500"
        >
          ${decodeURIComponent(text)}
        </text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    // Ultra-fast fallback
    const fallbackSvg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="system-ui" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">
          Product
        </text>
      </svg>
    `
    
    return new Response(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  }
}

// Add this to improve performance
export const runtime = 'edge'
export const dynamic = 'force-static'