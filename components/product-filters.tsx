"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category } from "@/lib/types"
import { Filter, X } from "lucide-react"

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
  const [isOpen, setIsOpen] = useState(false)

  const currentCategory = categories.find(cat => cat.name === selectedCategory)
  const availableSubcategories = currentCategory?.subcategories || []

  const handleClearFilters = () => {
    onClearFilters()
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger Button - Always visible */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Filter size={16} />
        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>

      {/* Slide-in Panel - Hidden by default */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-background p-6 overflow-y-auto z-50 border-l shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </Button>
            </div>
            
            <FiltersContent 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={onSubcategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={onPriceRangeChange}
              minRating={minRating}
              onMinRatingChange={onMinRatingChange}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
              availableSubcategories={availableSubcategories}
            />
          </div>
        </>
      )}
    </>
  )
}

// Extracted filters content for reusability
function FiltersContent({
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
  activeFilterCount,
  availableSubcategories
}: Omit<ProductFiltersProps, 'activeFilterCount'> & { availableSubcategories: string[] }) {
  
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value)
    // Reset subcategory when category changes
    if (value !== selectedCategory) {
      onSubcategoryChange("all")
    }
  }

  const handleSubcategoryChange = (value: string) => {
    onSubcategoryChange(value)
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategories - Only show if a category is selected and has subcategories */}
      {selectedCategory && selectedCategory !== "all" && availableSubcategories.length > 0 && (
        <div className="space-y-3">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All subcategories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subcategories</SelectItem>
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
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}