"use client"

import { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

interface ProductGridProps {
  products: Product[]
  viewMode: "grid" | "list"
  className?: string
}

export function ProductGrid({ products, viewMode, className = "" }: ProductGridProps) {
  const gridClass = viewMode === "grid" 
    ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    : "grid grid-cols-1 gap-6"

  return (
    <div className={`${gridClass} ${className}`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}