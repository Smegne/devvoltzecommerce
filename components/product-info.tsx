"use client"

import { useState } from "react"
import { Star, Heart, Share2, Truck, Shield, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { Product } from "@/lib/types"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-white/60">Product information not available.</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = async () => {
    if (product) {
      await addItem(product.id.toString(), product)
    }
  }

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-white/80 ml-2">({product.reviewCount} reviews)</span>
      </div>
    )
  }

  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="space-y-4">
        {/* Category Badge */}
        <Badge variant="secondary" className="bg-[#0088CC]/20 text-[#0088CC] border-[#0088CC]/30">
          {product.category || "Uncategorized"}
        </Badge>

        {/* Product Title */}
        <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
          {product.name || "Product Name"}
        </h1>

        {/* Rating */}
        <div className="flex items-center space-x-4">
          {renderRatingStars(product.rating || 4.5)}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold bg-gradient-to-r from-[#0088CC] to-[#3132DD] bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          
          {discountPercentage > 0 && product.original_price && (
            <>
              <span className="text-xl text-white/60 line-through">
                {formatPrice(product.original_price)}
              </span>
              <Badge className="bg-red-500 text-white border-0">
                Save {discountPercentage}%
              </Badge>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            product.inStock ? "bg-green-500" : "bg-red-500"
          }`} />
          <span className="text-sm text-white/80">
            {product.inStock 
              ? `In Stock (${product.stockCount} available)` 
              : "Out of Stock"
            }
          </span>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Description</h3>
          <p className="text-white/80 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Key Features */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Key Features</h3>
        <div className="grid grid-cols-1 gap-2">
          {product.tags && product.tags.length > 0 ? (
            product.tags.slice(0, 4).map((tag, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-[#0088CC]" />
                <span>{tag}</span>
              </div>
            ))
          ) : (
            <div className="text-white/60 text-sm">
              No features specified. Check the Features section below for detailed information.
            </div>
          )}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Quantity</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-white/20 rounded-lg bg-white/5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedQuantity(prev => Math.max(1, prev - 1))}
              disabled={selectedQuantity <= 1}
              className="text-white hover:bg-white/10 h-10 w-10"
            >
              -
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center text-white font-medium">
              {selectedQuantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedQuantity(prev => prev + 1)}
              disabled={!product.inStock || selectedQuantity >= (product.stockCount || 1)}
              className="text-white hover:bg-white/10 h-10 w-10"
            >
              +
            </Button>
          </div>
          <span className="text-sm text-white/60">
            Max {product.stockCount} available
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <Button
          className="flex-1 bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white py-3 text-lg transition-all duration-200 hover:scale-105 shadow-lg border-0"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="border-white/20 text-white hover:bg-white/10 hover:border-[#0088CC] transition-all duration-200"
        >
          <Heart className={`w-5 h-5 ${
            isWishlisted ? "fill-red-500 text-red-500" : ""
          }`} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="border-white/20 text-white hover:bg-white/10 hover:border-[#0088CC] transition-all duration-200"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Shipping & Benefits */}
      <div className="space-y-4 pt-6 border-t border-white/20">
        {/* Shipping Info */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-[#0088CC]" />
            <div>
              <p className="font-medium text-white">Free Shipping</p>
              <p className="text-sm text-white/60">Delivery in 3-5 business days</p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <Shield className="w-4 h-4 text-[#0088CC]" />
            <span className="text-sm text-white/80">1-Year Warranty</span>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <Clock className="w-4 h-4 text-[#0088CC]" />
            <span className="text-sm text-white/80">30-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4 pt-6 border-t border-white/20">
        <h3 className="font-semibold text-white">Product Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Category</p>
            <p className="text-white font-medium">{product.category || "N/A"}</p>
          </div>
          
          {product.brand && (
            <div>
              <p className="text-white/60">Brand</p>
              <p className="text-white font-medium">{product.brand}</p>
            </div>
          )}
          
          {product.availability && (
            <div>
              <p className="text-white/60">Availability</p>
              <p className="text-white font-medium">{product.availability}</p>
            </div>
          )}
          
          {product.subcategory && (
            <div>
              <p className="text-white/60">Subcategory</p>
              <p className="text-white font-medium">{product.subcategory}</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Secure checkout</span>
        </div>
        <p className="text-sm text-green-400/80 mt-1">
          Your payment information is encrypted and secure. We never share your details.
        </p>
      </div>
    </div>
  )
}