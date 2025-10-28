import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  const { dimensions } = params
  const [width, height] = dimensions[0].split('x').map(Number)
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dy=".3em">
        ${width}x${height}
      </text>
    </svg>
  `

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}