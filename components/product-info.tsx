"use client"

import { useState } from "react"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem(product.id, quantity)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Product Title and Rating */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{product.category}</Badge>
          {product.tags.includes("bestseller") && <Badge className="bg-green-500">Bestseller</Badge>}
          {product.tags.includes("new") && <Badge className="bg-blue-500">New</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 font-medium">{product.rating}</span>
          </div>
          <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              <Badge className="bg-red-500">Save {discountPercentage}%</Badge>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {product.inStock ? `In stock (${product.stockCount} available)` : "Out of stock"}
        </p>
      </div>

      {/* Description */}
      <div>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="font-semibold mb-3">Key Features</h3>
        <ul className="space-y-2">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
              disabled={quantity >= product.stockCount}
            >
              +
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">Max {product.stockCount} items</span>
        </div>

        <div className="flex space-x-3">
          <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={isWishlisted ? "text-red-500 border-red-500" : ""}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Shipping & Returns */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">30-Day Returns</p>
                <p className="text-sm text-muted-foreground">Easy returns & exchanges</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">2-Year Warranty</p>
                <p className="text-sm text-muted-foreground">Manufacturer warranty included</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Tabs */}
      <Tabs defaultValue="specifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
        </TabsList>
        <TabsContent value="specifications" className="space-y-4">
          <div className="grid gap-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b">
                <span className="font-medium">{key}</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">Shipping Options</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Standard Shipping (5-7 business days): Free on orders over $50</li>
                <li>• Express Shipping (2-3 business days): $9.99</li>
                <li>• Overnight Shipping (1 business day): $19.99</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Return Policy</h4>
              <p className="text-sm text-muted-foreground">
                Items can be returned within 30 days of delivery for a full refund. Items must be in original condition
                with all packaging.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
