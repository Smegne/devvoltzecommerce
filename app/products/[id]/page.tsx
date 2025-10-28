"use client"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductInfo } from "@/components/product-info"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"
import { ProductBreadcrumb } from "@/components/product-breadcrumb"
import { products } from "@/lib/mock-data"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string

  const product = products.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Get related products from the same category
  const relatedProducts = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <ProductBreadcrumb product={product} />

        {/* Product Details Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductImageGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Product Reviews */}
        <ProductReviews product={product} />

        {/* Related Products */}
        {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      </main>

      <Footer />
    </div>
  )
}
