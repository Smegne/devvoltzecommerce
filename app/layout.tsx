import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"

export const metadata: Metadata = {
  title: {
    default: "DevVoltz Market - Premium E-commerce Platform for Traders & Customers",
    template: "%s | DevVoltz Market"
  },
  description: "DevVoltz Market - Your ultimate e-commerce destination. Connect with verified traders, discover unique products, and grow your business. Secure platform with 24/7 support.",
  keywords: [
    "e-commerce", "online shopping", "DevVoltz", "traders", "customers", 
    "electronics", "fashion", "home essentials", "premium products", 
    "online marketplace", "business platform", "secure shopping"
  ],
  authors: [{ name: "DevVoltz Team" }],
  creator: "DevVoltz",
  publisher: "DevVoltz",
  category: "E-commerce",
  classification: "Online Marketplace",
  
  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },
  
  metadataBase: new URL('https://voltmarket.devvoltz.com'),
  
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voltmarket.devvoltz.com',
    siteName: 'DevVoltz Market',
    title: 'DevVoltz Market - Premium E-commerce Platform',
    description: 'Connect with verified traders, discover unique products, and grow your business on DevVoltz Market.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DevVoltz Market - Premium E-commerce Platform',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    site: '@devvoltz',
    creator: '@devvoltz',
    title: 'DevVoltz Market - Premium E-commerce Platform',
    description: 'Connect with verified traders and discover unique products on DevVoltz Market.',
    images: ['/og-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-search-console-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  
  // Additional SEO enhancements
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3132DD',
      },
    ],
  },
  
  // App Links for mobile
  appLinks: {
    web: {
      url: 'https://voltmarket.devvoltz.com',
      should_fallback: false,
    },
  },
  
  // Additional metadata
  other: {
    'msapplication-TileColor': '#3132DD',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#3132DD',
  }
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
        
        {/* Favicon Configuration */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3132DD" />
        <meta name="msapplication-TileColor" content="#3132DD" />
        
        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DevVoltz Market" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DevVoltz Market",
              "description": "Premium E-commerce Platform connecting traders and customers",
              "url": "https://voltmarket.devvoltz.com",
              "logo": "https://voltmarket.devvoltz.com/logow.jpg",
              "foundingDate": "2024",
              "founders": [
                {
                  "@type": "Person",
                  "name": "DevVoltz Team"
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "email": "support@devvoltz.com",
                "areaServed": "US",
                "availableLanguage": ["English"]
              },
              "sameAs": [
                "https://twitter.com/devvoltz",
                "https://facebook.com/devvoltz",
                "https://instagram.com/devvoltz",
                "https://linkedin.com/company/devvoltz"
              ]
            })
          }}
        />
        
        {/* Additional Schema for E-commerce */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DevVoltz Market",
              "url": "https://voltmarket.devvoltz.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://voltmarket.devvoltz.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "DevVoltz",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://voltmarket.devvoltz.com/logow.jpg"
                }
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
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              window.addEventListener('load', function() {
                if ('performance' in window) {
                  const navTiming = performance.getEntriesByType('navigation')[0];
                  if (navTiming) {
                    const loadTime = navTiming.loadEventEnd - navTiming.navigationStart;
                    const domReady = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
                    
                    // Log performance metrics
                    console.log('Page Load Time:', loadTime, 'ms');
                    console.log('DOM Ready Time:', domReady, 'ms');
                    
                    // Send to analytics (optional)
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'timing_complete', {
                        'name': 'page_load',
                        'value': Math.round(loadTime),
                        'event_category': 'Load Time'
                      });
                    }
                  }
                }
                
                // Core Web Vitals monitoring
                if ('PerformanceObserver' in window) {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      console.log(entry.name + ': ' + entry.value);
                    });
                  });
                  
                  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift'] });
                }
              });
            `
          }}
        />
      </body>
    </html>
  )
}