"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Share2, Heart, Star, Truck, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductFeatures } from "@/components/product-features"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price: number | null
  images: string[]
  category: string
  subcategory: string | null
  brand: string | null
  inStock: boolean
  stockCount: number
  rating: number
  reviewCount: number
  featured: boolean
  tags: string[]
  availability: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState("description")

  const productId = params.id as string

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else {
        console.error('Failed to fetch product')
        router.push('/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (product) {
      await addItem(product.id.toString(), product as unknown as import('@/lib/types').Product)
      // Optional: Show success message
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const discountPercentage = product?.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-white hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            <ProductImageGallery 
              images={product.images} 
              productName={product.name}
              productId={product.id}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-[#0088CC]/20 text-[#0088CC] border-[#0088CC]/30">
                {product.category}
              </Badge>
              {product.brand && (
                <Badge variant="outline" className="text-white/80 border-white/30">
                  {product.brand}
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Featured
                </Badge>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-400"
                    }`}
                  />
                ))}
                <span className="text-white/80 ml-2">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-bold bg-gradient-to-r from-[#0088CC] to-[#3132DD] bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
                
                {discountPercentage > 0 && product.original_price && (
                  <>
                    <span className="text-2xl text-white/60 line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <Badge className="bg-red-500 text-white border-0 text-sm">
                      Save {discountPercentage}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  product.inStock ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`} />
                <span className="text-white/80">
                  {product.inStock 
                    ? `In Stock (${product.stockCount} available)` 
                    : "Out of Stock"
                  }
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white py-3 text-lg transition-all duration-200 hover:scale-105 shadow-lg border-0"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                size="lg"
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="border-white/20 text-white hover:bg-white/10 hover:border-[#0088CC] transition-all duration-200 flex-shrink-0 h-12 w-12"
              >
                <Heart className={`w-6 h-6 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`} />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 text-white hover:bg-white/10 hover:border-[#0088CC] transition-all duration-200 flex-shrink-0 h-12 w-12"
              >
                <Share2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Key Features */}
            {product.tags && product.tags.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#0088CC]" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {product.tags.slice(0, 6).map((tag, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[#0088CC] rounded-full flex-shrink-0" />
                        <span className="text-white/90">{tag}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping & Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Truck className="w-6 h-6 text-[#0088CC]" />
                <div>
                  <p className="font-medium text-white">Free Shipping</p>
                  <p className="text-sm text-white/60">3-5 business days</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Shield className="w-6 h-6 text-[#0088CC]" />
                <div>
                  <p className="font-medium text-white">1-Year Warranty</p>
                  <p className="text-sm text-white/60">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20 p-1 rounded-xl">
              <TabsTrigger 
                value="description" 
                className="rounded-lg data-[state=active]:bg-[#0088CC] data-[state=active]:text-white text-white/80"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="features" 
                className="rounded-lg data-[state=active]:bg-[#0088CC] data-[state=active]:text-white text-white/80"
              >
                Features
              </TabsTrigger>
              <TabsTrigger 
                value="specifications" 
                className="rounded-lg data-[state=active]:bg-[#0088CC] data-[state=active]:text-white text-white/80"
              >
                Specifications
              </TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/90 leading-relaxed text-lg">
                      {product.description || "No description available for this product."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features">
              <ProductFeatures productId={product.id} />
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-[#0088CC]">General</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-white/70">Category</span>
                            <span className="text-white font-medium">{product.category}</span>
                          </div>
                          {product.subcategory && (
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/70">Subcategory</span>
                              <span className="text-white font-medium">{product.subcategory}</span>
                            </div>
                          )}
                          {product.brand && (
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/70">Brand</span>
                              <span className="text-white font-medium">{product.brand}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-white/70">Availability</span>
                            <span className={`font-medium ${
                              product.inStock ? "text-green-400" : "text-red-400"
                            }`}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-[#0088CC]">Pricing & Stock</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-white/70">Current Price</span>
                            <span className="text-white font-medium">{formatPrice(product.price)}</span>
                          </div>
                          {product.original_price && (
                            <div className="flex justify-between border-b border-white/10 pb-2">
                              <span className="text-white/70">Original Price</span>
                              <span className="text-white/60 line-through">{formatPrice(product.original_price)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-white/70">Stock Quantity</span>
                            <span className="text-white font-medium">{product.stockCount}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-white/70">Rating</span>
                            <span className="text-white font-medium">{product.rating}/5 ({product.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products Section (You can add this later) */}
        {/* <RelatedProducts currentProductId={product.id} category={product.category} /> */}
      </main>

      <Footer />
    </div>
  )
}