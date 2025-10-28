"use client"

import Link from "next/link"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface RelatedProductsProps {
  products: Product[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Related Products</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative overflow-hidden">
                <Link href={`/product/${product.id}`}>
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </div>

              <div className="p-4 space-y-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                </Link>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button className="w-full" size="sm" onClick={() => addItem(product.id)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
