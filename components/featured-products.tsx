"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Eye, Zap, ArrowRight, TrendingUp, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/lib/cart-context"
import { Product, convertToProductComponent } from "@/lib/types"

// Fallback images for products - using local placeholder API
const FALLBACK_IMAGES = {
  electronics: "/api/placeholder/400/400?text=Electronics",
  fashion: "/api/placeholder/400/400?text=Fashion",
  home: "/api/placeholder/400/400?text=Home+Essentials",
  default: "/api/placeholder/400/400?text=DevVoltz"
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const { addItem } = useCart()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Fetching featured products from API...')
      
      const response = await fetch('/api/products/featured')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 API response data:', data)
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array')
      }
      
      const convertedProducts = data.map((product: any) => convertToProductComponent(product))
      console.log('✨ Converted products:', convertedProducts)
      
      setProducts(convertedProducts)
    } catch (error) {
      console.error('❌ Failed to fetch featured products:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      // Fallback to demo products
      setProducts(getDemoProducts())
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const getImageSrc = (product: Product) => {
    if (imageErrors[product.id] || !product.images?.[0]) {
      // Try to match category for fallback
      const category = product.category?.toLowerCase() || ''
      if (category.includes('electronic') || category.includes('tech')) {
        return FALLBACK_IMAGES.electronics
      } else if (category.includes('fashion') || category.includes('clothing')) {
        return FALLBACK_IMAGES.fashion
      } else if (category.includes('home') || category.includes('living')) {
        return FALLBACK_IMAGES.home
      }
      return FALLBACK_IMAGES.default
    }
    return product.images[0]
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = (productId: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    addItem(productId.toString())
    
    // Safe animation feedback - check if element exists
    const button = event.currentTarget as HTMLButtonElement
    if (button && button.classList) {
      button.classList.add('scale-95')
      setTimeout(() => {
        if (button.classList) {
          button.classList.remove('scale-95')
        }
      }, 150)
    }
  }

  if (error && products.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-red-50/30 to-orange-50/20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 text-red-500 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-semibold">ERROR LOADING PRODUCTS</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Unable to Load Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {error}
            </p>
            <Button onClick={fetchFeaturedProducts} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (products.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-yellow-50/30 to-amber-50/20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-semibold">NO PRODUCTS FOUND</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              No Products Available
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              There are no products in the database yet.
            </p>
            <Button asChild>
              <Link href="/admin/dashboard">Go to Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-200/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))] -z-20"></div>
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-16 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-3 text-primary mb-4">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">FEATURED PRODUCTS</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Customer Favorites
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Handpicked premium products that DevVoltz customers love most. Quality guaranteed with fast shipping.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              <span>1-Year Warranty</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Fast Delivery</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.8+ Rating</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <FeaturedProductCard 
              key={product.id} 
              product={product} 
              index={index}
              getImageSrc={getImageSrc}
              onImageError={() => handleImageError(product.id)}
              onAddToCart={handleAddToCart}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="text-center mt-16 animate-in fade-in duration-700 delay-500">
          <Link href="/products">
            <Button 
              size="lg"
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center">
                View All Products
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

interface FeaturedProductCardProps {
  product: Product
  index: number
  getImageSrc: (product: Product) => string
  onImageError: () => void
  onAddToCart: (productId: number, event: React.MouseEvent) => void
  formatPrice: (price: number) => string
}

function FeaturedProductCard({ product, index, getImageSrc, onImageError, onAddToCart, formatPrice }: FeaturedProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const stockPercentage = Math.min(100, (product.stockCount / 50) * 100)
  const isLowStock = product.stockCount > 0 && product.stockCount <= 10

  return (
    <Card 
      className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 overflow-hidden hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Use regular img tag for reliable image loading */}
              <img
                src={getImageSrc(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={onImageError}
              />
            </div>
          </Link>
          
          {/* Enhanced Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg border-0"
              onClick={(e) => onAddToCart(product.id, e)}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg border-0"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`} 
              />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg border-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                Low Stock
              </Badge>
            )}
            {product.discountPrice && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.category || 'Uncategorized'}
            </p>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors duration-200 min-h-[3rem]">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Enhanced Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium ml-1">{product.rating || '4.5'}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount || '100'})</span>
            </div>
          </div>

          {/* Enhanced Price */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Enhanced Stock Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available stock</span>
              <span className={isLowStock ? "text-orange-600 font-medium" : ""}>
                {product.stockCount} units
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  stockPercentage > 70 ? 'bg-green-500' : 
                  stockPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full group hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
          onClick={(e) => onAddToCart(product.id, e)}
          disabled={!product.inStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center space-y-6 mb-16">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
          <div className="flex justify-center gap-8 pt-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Demo data fallback
function getDemoProducts(): Product[] {
  const demo = [
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      description: "Premium sound quality with noise cancellation",
      price: 199.99,
      discountPrice: 149.99,
      images: [FALLBACK_IMAGES.electronics],
      category: "Electronics",
      featured: true,
      rating: 4.8,
      reviewCount: 124,
      inStock: true,
      stockCount: 25
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      description: "Track your health and workouts",
      price: 299.99,
      images: [FALLBACK_IMAGES.electronics],
      category: "Electronics",
      featured: true,
      rating: 4.6,
      reviewCount: 89,
      inStock: true,
      stockCount: 8
    },
    {
      id: 3,
      name: "Premium Cotton T-Shirt",
      description: "Comfortable and stylish everyday wear",
      price: 29.99,
      images: [FALLBACK_IMAGES.fashion],
      category: "Fashion",
      featured: false,
      rating: 4.4,
      reviewCount: 67,
      inStock: true,
      stockCount: 45
    },
    {
      id: 4,
      name: "Smart Home Speaker",
      description: "Voice controlled home assistant",
      price: 129.99,
      discountPrice: 99.99,
      images: [FALLBACK_IMAGES.home],
      category: "Home Essentials",
      featured: true,
      rating: 4.7,
      reviewCount: 203,
      inStock: true,
      stockCount: 15
    }
  ]

  // Cast to Product[] to satisfy TypeScript when demo objects don't include every field from the Product type.
  return demo as unknown as Product[]
}