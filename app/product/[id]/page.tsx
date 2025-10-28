"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductInfo } from "@/components/product-info"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"
import { ProductBreadcrumb } from "@/components/product-breadcrumb"
import { ProductFeatures } from "@/components/product-features"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Product } from "@/lib/types"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch product details
      const productResponse = await fetch(`/api/products/${productId}`)
      
      if (!productResponse.ok) {
        if (productResponse.status === 404) {
          throw new Error('Product not found')
        }
        throw new Error('Failed to fetch product details')
      }
      
      const productData = await productResponse.json()
      setProduct(productData)

      // Fetch related products
      if (productData.category) {
        const relatedResponse = await fetch(`/api/products?category=${productData.category}&limit=4&exclude=${productId}`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          setRelatedProducts(relatedData.products || [])
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center space-x-2 mb-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Product Details Skeleton */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                <Skeleton className="w-full h-96 rounded-xl" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-32" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              {error ? 'Error Loading Product' : 'Product Not Found'}
            </h1>
            
            <p className="text-white/80 text-lg mb-8">
              {error || 'The product you\'re looking for doesn\'t exist.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={fetchProductDetails}
                className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/products')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <ProductBreadcrumb product={product} />

        {/* Product Details Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductImageGallery 
            images={product.images} 
            productName={product.name}
            productId={product.id}
          />
          <ProductInfo product={product} />
        </div>

        {/* Product Features */}
        <ProductFeatures productId={product.id} />

        {/* Product Reviews */}
        <ProductReviews product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>

      <Footer />
    </div>
  )
}