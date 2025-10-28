"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductSearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  productCount?: number
}

export function ProductSearch({ searchQuery, onSearchChange, sortBy, onSortChange, productCount }: ProductSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-background/50 backdrop-blur-sm rounded-2xl border">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 bg-background/80"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {productCount !== undefined && (
          <div className="text-sm text-muted-foreground hidden sm:block">
            {productCount} products
          </div>
        )}
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 bg-background/80">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}