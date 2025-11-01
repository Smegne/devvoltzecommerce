"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface ProductCardProps {
  product: Product
  viewMode: "grid" | "list"
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ET", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setIsAdding(true)
    
    try {
      const success = await addItem(product.id.toString(), product)
      
      if (success) {
        // Success feedback - safely check for classList
        const button = event.currentTarget as HTMLButtonElement
        if (button && button.classList) {
          button.classList.add('scale-95', 'bg-green-500')
          setTimeout(() => {
            if (button.classList) {
              button.classList.remove('scale-95', 'bg-green-500')
            }
          }, 300)
        }
      }
      // If not successful (redirect happened), no need for feedback
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getImageSrc = () => {
    if (imageError || !product.images?.[0]) {
      return `/api/placeholder/400/400?text=${encodeURIComponent(product.name)}`
    }
    return product.images[0]
  }

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-500 border-muted/50 hover:border-muted bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="w-48 flex-shrink-0">
            <Link href={`/product/${product.id}`}>
              <img
                src={getImageSrc()}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={handleImageError}
              />
            </Link>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  {product.category}
                </p>
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-xl font-semibold hover:text-primary transition-colors duration-200 mb-2">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Rating and Stock */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium ml-1">{product.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.inStock ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-muted-foreground">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
                <Button variant="ghost" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.original_price && product.original_price > product.price && (
            <Badge className="bg-red-500 text-white border-0 shadow-lg animate-pulse">
              Save {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
              Featured
            </Badge>
          )}
        </div>
      </Card>
    )
  }

  // Grid View (default)
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-muted/50 hover:border-muted bg-background/50 backdrop-blur-sm overflow-hidden hover:-translate-y-1">
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <img
              src={getImageSrc()}
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={handleImageError}
            />
          </Link>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200 shadow-lg"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.original_price && product.original_price > product.price && (
              <Badge className="bg-red-500 text-white border-0 shadow-lg animate-pulse">
                Save {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.category}
            </p>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors duration-200">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-muted px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium ml-1">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, (product.stockCount / 50) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full group hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg"
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
        >
          <ShoppingCart className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
          {isAdding ? "Adding..." : (product.inStock ? 'Add to Cart' : 'Out of Stock')}
        </Button>
      </CardFooter>
    </Card>
  )
}