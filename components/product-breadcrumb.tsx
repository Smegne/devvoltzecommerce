import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductBreadcrumbProps {
  product: Product
}

export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      <ChevronRight className="w-4 h-4" />
      <Link href="/products" className="hover:text-foreground transition-colors">
        Products
      </Link>
      <ChevronRight className="w-4 h-4" />
      <Link
        href={`/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
        className="hover:text-foreground transition-colors"
      >
        {product.category}
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-foreground font-medium">{product.name}</span>
    </nav>
  )
}
