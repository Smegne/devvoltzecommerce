"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category } from "@/lib/types"

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedSubcategory: string
  onSubcategoryChange: (subcategory: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  minRating: number
  onMinRatingChange: (rating: number) => void
  onClearFilters: () => void
  activeFilterCount?: number
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  priceRange,
  onPriceRangeChange,
  minRating,
  onMinRatingChange,
  onClearFilters,
  activeFilterCount = 0
}: ProductFiltersProps) {
  // Get unique subcategories from the selected category
  const currentCategory = categories.find(cat => cat.name === selectedCategory)
  const availableSubcategories = currentCategory?.subcategories || []

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategories */}
      {availableSubcategories.length > 0 && (
        <div className="space-y-3">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select value={selectedSubcategory} onValueChange={onSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All subcategories</SelectItem>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <Label htmlFor="price-range">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          max={5000}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>$0</span>
          <span>$5000</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <Label htmlFor="rating">Minimum Rating</Label>
        <Select
          value={minRating.toString()}
          onValueChange={(value) => onMinRatingChange(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="4">4 stars & up</SelectItem>
            <SelectItem value="3">3 stars & up</SelectItem>
            <SelectItem value="2">2 stars & up</SelectItem>
            <SelectItem value="1">1 star & up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full bg-transparent"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )
}