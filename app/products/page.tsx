"use client"

import { useState, useMemo, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductFilters } from "@/components/product-filters"
import { ProductSearch } from "@/components/product-search"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Grid, List, X, RotateCcw, Sparkles, ChevronRight, Star, ShoppingCart, Heart, Eye, Zap, Check } from "lucide-react"
import { Product, Category, convertToProductComponent, convertToCategoryComponent } from "@/lib/types"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"

// Fallback images for products
const FALLBACK_IMAGES = {
  electronics: "/api/placeholder/400/400?text=Electronics",
  fashion: "/api/placeholder/400/400?text=Fashion",
  home: "/api/placeholder/400/400?text=Home+Essentials",
  default: "/api/placeholder/400/400?text=DevVoltz"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const { addItem, isInCart } = useCart()

  // Fetch products and categories from database
  useEffect(() => {
    fetchProductsAndCategories()
  }, [])

  const fetchProductsAndCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Fetching products and categories...')

      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      console.log('📊 API Responses:', {
        products: productsRes.status,
        categories: categoriesRes.status
      })

      if (!productsRes.ok) {
        throw new Error(`Failed to fetch products: ${productsRes.status}`)
      }

      if (!categoriesRes.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesRes.status}`)
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      const convertedProducts = productsData.map((product: any) => convertToProductComponent(product))
      const convertedCategories = categoriesData.map((cat: any) => convertToCategoryComponent(cat))

      console.log('📦 Categories data:', convertedCategories)
      console.log('📦 Products data:', convertedProducts)

      setProducts(convertedProducts)
      setCategories(convertedCategories)
    } catch (error) {
      console.error('❌ Failed to fetch data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and search products
  const filteredProducts = useMemo(() => {
    if (!products.length) return []

    console.log('🔍 Filtering products with:', {
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      minRating,
      totalProducts: products.length
    })

    const filtered = products.filter((product) => {
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(q)
        const matchesDescription = product.description.toLowerCase().includes(q)
        const matchesCategory = product.category.toLowerCase().includes(q)
        const matchesBrand = product.brand?.toLowerCase().includes(q)
        if (!matchesName && !matchesDescription && !matchesCategory && !matchesBrand) {
          return false
        }
      }

      // Category filter - FIXED: Check if category matches
      if (selectedCategory && product.category !== selectedCategory) {
        console.log(`❌ Filtered out by category: ${product.category} !== ${selectedCategory}`)
        return false
      }

      // Subcategory filter - FIXED: Check if subcategory matches
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        console.log(`❌ Filtered out by subcategory: ${product.subcategory} !== ${selectedSubcategory}`)
        return false
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      // Rating filter
      if (product.rating < minRating) {
        return false
      }

      return true
    })

    console.log('✅ After filtering:', filtered.length, 'products')

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // featured
        filtered.sort((a, b) => {
          const aScore =
            (a.tags?.includes("bestseller") ? 3 : 0) +
            (a.featured ? 2 : 0) +
            (a.tags?.includes("new") ? 1 : 0)
          const bScore =
            (b.tags?.includes("bestseller") ? 3 : 0) +
            (b.featured ? 2 : 0) +
            (b.tags?.includes("new") ? 1 : 0)
          return bScore - aScore
        })
    }

    return filtered
  }, [products, searchQuery, selectedCategory, selectedSubcategory, priceRange, minRating, sortBy])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery || selectedCategory || selectedSubcategory || priceRange[0] > 0 || priceRange[1] < 50000 || minRating > 0 || sortBy !== "featured"
  }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, minRating, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedSubcategory("")
    setPriceRange([0, 50000])
    setMinRating(0)
    setSortBy("featured")
  }

  // Get unique subcategories for the selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return []
    const categoryProducts = products.filter(product => product.category === selectedCategory)
    const subcategories = Array.from(new Set(
      categoryProducts
        .map(product => product.subcategory)
        .filter(Boolean)
    )) as string[]
    console.log('📊 Available subcategories:', subcategories)
    return subcategories
  }, [selectedCategory, products])

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const getImageSrc = (product: Product) => {
    if (imageErrors[product.id] || !product.images?.[0]) {
      const category = product.category?.toLowerCase() || ''
      if (category.includes('electronic') || category.includes('tech')) {
        return FALLBACK_IMAGES.electronics
      } else if (category.includes('fashion') || category.includes('clothing')) {
        return FALLBACK_IMAGES.fashion
      } else if (category.includes('home') || category.includes('living')) {
        return FALLBACK_IMAGES.home
      }
      return FALLBACK_IMAGES.default
    }
    return product.images[0]
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Filter className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Error Loading Products</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={fetchProductsAndCategories} variant="outline">
                Try Again
              </Button>
              <Button asChild>
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-12 bg-muted rounded mb-8"></div>

            {/* Content Skeleton */}
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i}>
                      <div className="bg-muted rounded-2xl h-64 mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-muted rounded-lg h-4 w-3/4"></div>
                        <div className="bg-muted rounded-lg h-4 w-1/2"></div>
                        <div className="bg-muted rounded-lg h-6 w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/10">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">All Products</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Discover Our Collection
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Explore our complete collection of {products.length} premium products
          </p>
          
          <div className="max-w-2xl">
            <ProductSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              productCount={filteredProducts.length}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Enhanced Desktop Filters Sidebar with Blue/Black Theme */}
          {showDesktopFilters && (
            <aside className="hidden lg:block w-80 flex-shrink-0 animate-in slide-in-from-left duration-300">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/30 rounded-xl border border-blue-500/20">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-300">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs text-blue-300 hover:text-white transition-colors hover:bg-blue-500/20"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDesktopFilters(false)}
                      className="text-blue-300 hover:text-white hover:bg-blue-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm font-medium text-blue-300 mb-2">Active Filters</p>
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Search: "{searchQuery}"
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearchQuery("")} />
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Category: {selectedCategory}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedCategory("")} />
                        </span>
                      )}
                      {selectedSubcategory && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Subcategory: {selectedSubcategory}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedSubcategory("")} />
                        </span>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Price: ${priceRange[0]} - ${priceRange[1]}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setPriceRange([0, 50000])} />
                        </span>
                      )}
                      {minRating > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          Rating: {minRating}+ stars
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setMinRating(0)} />
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-4">
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    onSubcategoryChange={setSelectedSubcategory}
                    availableSubcategories={availableSubcategories}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    minRating={minRating}
                    onMinRatingChange={setMinRating}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className={`flex-1 min-w-0 ${showDesktopFilters ? 'lg:max-w-[calc(100%-320px)]' : 'w-full'}`}>
            {/* Enhanced Mobile Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-lg">
              <div className="flex items-center gap-3">
                {/* Desktop Filter Toggle */}
                <Button 
                  onClick={() => setShowDesktopFilters(!showDesktopFilters)}
                  className="hidden lg:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showDesktopFilters ? 'Hide Filters' : 'Show Filters'}
                  {hasActiveFilters && !showDesktopFilters && (
                    <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
                  )}
                </Button>

                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white shadow-lg"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 p-0 overflow-y-auto bg-slate-900 border-r border-blue-500/20">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/30 rounded-xl border border-blue-500/20">
                        <h3 className="text-xl font-semibold text-blue-300">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                          className="text-blue-300 hover:text-white hover:bg-blue-500/20"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20">
                        <ProductFilters
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onCategoryChange={setSelectedCategory}
                          selectedSubcategory={selectedSubcategory}
                          onSubcategoryChange={setSelectedSubcategory}
                          availableSubcategories={availableSubcategories}
                          priceRange={priceRange}
                          onPriceRangeChange={setPriceRange}
                          minRating={minRating}
                          onMinRatingChange={setMinRating}
                          onClearFilters={() => {
                            clearFilters()
                            setIsFilterOpen(false)
                          }}
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Results Counter */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <span className="text-sm text-gray-300">
                      Showing <span className="font-semibold text-white">{filteredProducts.length}</span> of{" "}
                      <span className="font-semibold text-white">{products.length}</span> products
                    </span>
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                      <ChevronRight className="w-3 h-3" />
                      {selectedCategory && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          {selectedCategory}
                        </span>
                      )}
                      {minRating > 0 && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          ⭐ {minRating}+
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-sm text-gray-300">
                  Sorted by: <span className="font-medium text-white capitalize">{sortBy.replace('-', ' ')}</span>
                </div>

                <div className="flex items-center gap-1 border border-blue-500/30 rounded-xl p-1 bg-slate-800/50 backdrop-blur-sm">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-lg transition-all duration-200 hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-lg transition-all duration-200 hover:scale-105 text-gray-300 hover:text-white hover:bg-blue-500/20 border-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {viewMode === "grid" ? (
              <div className={
                showDesktopFilters 
                  ? "grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                  : "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              }>
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                    getImageSrc={getImageSrc}
                    onImageError={() => handleImageError(product.id)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                    getImageSrc={getImageSrc}
                    onImageError={() => handleImageError(product.id)}
                    formatPrice={formatPrice}
                    viewMode="list"
                  />
                ))}
              </div>
            )}

            {/* No Results State */}
            {filteredProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-16 lg:py-24 bg-gradient-to-br from-slate-900 to-blue-900/30 rounded-3xl border border-blue-500/20 shadow-lg">
                <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Filter className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  No products found
                </h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto text-lg">
                  {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters to find what you're looking for."}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {hasActiveFilters && (
                    <Button onClick={clearFilters} variant="outline" className="gap-2 border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                      <RotateCcw className="w-4 h-4" />
                      Clear all filters
                    </Button>
                  )}
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                    <a href="/" className="gap-2">
                      Back to Home
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* No Products State */}
            {products.length === 0 && (
              <div className="text-center py-16 lg:py-24 bg-gradient-to-br from-slate-900 to-blue-900/30 rounded-3xl border border-blue-500/20 shadow-lg">
                <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Filter className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  No products available
                </h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto text-lg">
                  We're preparing something amazing for you. Check back soon!
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0">
                  <a href="/" className="gap-2">
                    Back to Home
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Enhanced Product Card Component with Smart Cart Button
interface ProductCardProps {
  product: Product
  index: number
  getImageSrc: (product: Product) => string
  onImageError: () => void
  formatPrice: (price: number) => string
  viewMode?: "grid" | "list"
}

function ProductCard({ product, index, getImageSrc, onImageError, formatPrice, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, isInCart } = useCart()
  const [isProductInCart, setIsProductInCart] = useState(false)
  
  const stockPercentage = Math.min(100, (product.stockCount / 50) * 100)
  const isLowStock = product.stockCount > 0 && product.stockCount <= 10

  // Update cart status when cart changes
  useEffect(() => {
    setIsProductInCart(isInCart(product.id.toString()))
  }, [isInCart, product.id])

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setIsAdding(true)
    
    try {
      const success = await addItem(product.id.toString(), product)
      
      if (success) {
        // Success feedback
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
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (isAdding) return "Adding..."
    if (isProductInCart) return "Added to Cart"
    if (!product.inStock) return "Out of Stock"
    return "Add to Cart"
  }

  const getButtonVariant = () => {
    if (isProductInCart) return "success"
    if (!product.inStock) return "outline"
    return "default"
  }

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-500 border-muted/50 hover:border-muted bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="w-48 flex-shrink-0">
            <Link href={`/product/${product.id}`}>
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={getImageSrc(product)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={onImageError}
                />
              </div>
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
                  variant={getButtonVariant()}
                  size="sm"
                  className={`group transition-all duration-200 ${
                    isProductInCart 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'hover:bg-primary hover:text-primary-foreground'
                  }`}
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding || isProductInCart}
                >
                  {isProductInCart ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  {getButtonText()}
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
          {isProductInCart && (
            <Badge className="bg-green-500 text-white border-0 shadow-lg">
              In Cart
            </Badge>
          )}
        </div>
      </Card>
    )
  }

  // Grid View
  return (
    <Card 
      className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 overflow-hidden hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <div className="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200">
              <img
                src={getImageSrc(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={onImageError}
              />
            </div>
          </Link>
          
          {/* Enhanced Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
            <Button 
              variant={isProductInCart ? "success" : "secondary"}
              size="icon"
              className={`rounded-full backdrop-blur-sm hover:scale-110 transition-all duration-200 shadow-lg ${
                isProductInCart 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-background/80 hover:bg-background'
              }`}
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding || isProductInCart}
            >
              {isProductInCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200 shadow-lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isWishlisted ? 'fill-red-500 text-red-500' : ''
                }`} 
              />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
            {isLowStock && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                Low Stock
              </Badge>
            )}
            {product.discountPrice && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </Badge>
            )}
            {isProductInCart && (
              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                In Cart
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {product.category || 'Uncategorized'}
            </p>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors duration-200 min-h-[3rem]">
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Enhanced Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium ml-1">{product.rating || '4.5'}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount || '100'})</span>
            </div>
          </div>

          {/* Enhanced Price */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Enhanced Stock Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available stock</span>
              <span className={isLowStock ? "text-orange-600 font-medium" : ""}>
                {product.stockCount} units
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  stockPercentage > 70 ? 'bg-green-500' : 
                  stockPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          variant={getButtonVariant()}
          className={`w-full group transition-all duration-200 hover:scale-105 shadow-lg ${
            isProductInCart 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding || isProductInCart}
        >
          {isProductInCart ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
          )}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}