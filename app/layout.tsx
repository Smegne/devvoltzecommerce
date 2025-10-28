import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"

export const metadata: Metadata = {
  title: {
    default: "DevVoltz Store - Premium E-commerce Platform",
    template: "%s | DevVoltz Store"
  },
  description: "Discover premium electronics, fashion, and home essentials with DevVoltz. Quality products, exceptional service, and innovative solutions for modern life.",
  keywords: ["electronics", "fashion", "home essentials", "premium products", "e-commerce", "DevVoltz"],
  authors: [{ name: "DevVoltz Team" }],
  creator: "DevVoltz",
  publisher: "DevVoltz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://devvoltz-store.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devvoltz-store.vercel.app',
    title: 'DevVoltz Store - Premium E-commerce Platform',
    description: 'Discover premium electronics, fashion, and home essentials with DevVoltz.',
    siteName: 'DevVoltz Store',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DevVoltz Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevVoltz Store - Premium E-commerce Platform',
    description: 'Discover premium electronics, fashion, and home essentials with DevVoltz.',
    images: ['/og-image.jpg'],
    creator: '@devvoltz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DevVoltz Store",
              "description": "Premium E-commerce Platform for electronics, fashion, and home essentials",
              "url": "https://devvoltz-store.vercel.app",
              "logo": "https://devvoltz-store.vercel.app/logo.png",
              "sameAs": [
                "https://twitter.com/devvoltz",
                "https://facebook.com/devvoltz",
                "https://instagram.com/devvoltz"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "email": "support@devvoltz.com"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        
        {/* Performance monitoring script (optional) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simple performance monitoring
              window.addEventListener('load', function() {
                if ('performance' in window) {
                  const navTiming = performance.getEntriesByType('navigation')[0];
                  if (navTiming) {
                    console.log('Page loaded in:', navTiming.loadEventEnd - navTiming.navigationStart, 'ms');
                  }
                }
              });
            `
          }}
        />
      </body>
    </html>
  )
}