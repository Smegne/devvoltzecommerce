"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { ProductSearch } from "@/components/product-search"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Filter, Grid, List, Home, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { Product, Category, convertToProductComponent, convertToCategoryComponent } from "@/lib/types"

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch category and products
  useEffect(() => {
    fetchCategoryData()
  }, [categorySlug])

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [categoryRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/categories/${categorySlug}`),
        fetch(`/api/categories/${categorySlug}/products`),
        fetch('/api/categories')
      ])

      if (!categoryRes.ok) {
        throw new Error('Category not found')
      }

      const categoryData = await categoryRes.json()
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      // Get unique subcategories from products
      const subcategories = Array.from(new Set(
        productsData
          .map((product: any) => product.subcategory)
          .filter(Boolean)
      )) as string[]

      // Convert data to component types
      const convertedCategory = convertToCategoryComponent(categoryData, subcategories)
      const convertedProducts = productsData.map((product: any) => convertToProductComponent(product))
      const convertedCategories = categoriesData.map((cat: any) => convertToCategoryComponent(cat))

      setCategory(convertedCategory)
      setCategoryProducts(convertedProducts)
      setAllCategories(convertedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category')
      console.error('Failed to fetch category data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    if (!categoryProducts.length) return []

    const filtered = categoryProducts.filter((product) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = product.title.toLowerCase().includes(q)
        const matchesName = product.name.toLowerCase().includes(q)
        const matchesDescription = product.description.toLowerCase().includes(q)
        const matchesBrand = product.brand?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesName && !matchesDescription && !matchesBrand) {
          return false
        }
      }

      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        return false
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      if (product.rating < minRating) {
        return false
      }

      return true
    })

    // Apply sorting logic
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
      default:
        // Featured sorting (bestseller, featured, new products first)
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
  }, [categoryProducts, searchQuery, selectedSubcategory, priceRange, minRating, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedSubcategory("")
    setPriceRange([0, 5000])
    setMinRating(0)
    setSortBy("featured")
  }

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    selectedSubcategory ? 1 : 0,
    priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].filter(Boolean).length

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-white/60" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Category Not Found
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <Button asChild className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isLoading || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="h-4 bg-white/20 rounded w-24"></div>
              <div className="h-4 bg-white/20 rounded w-4"></div>
              <div className="h-4 bg-white/20 rounded w-32"></div>
              <div className="h-4 bg-white/20 rounded w-4"></div>
              <div className="h-4 bg-white/20 rounded w-20"></div>
            </div>

            {/* Category Header Skeleton */}
            <div className="h-64 lg:h-80 bg-white/20 rounded-3xl mb-12"></div>

            {/* Content Skeleton */}
            <div className="flex gap-8">
              <div className="hidden lg:block w-80">
                <div className="space-y-4">
                  <div className="h-6 bg-white/20 rounded w-32"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-white/20 rounded w-full"></div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="bg-white/20 rounded-2xl h-64 mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-white/20 rounded-lg h-4 w-3/4"></div>
                        <div className="bg-white/20 rounded-lg h-4 w-1/2"></div>
                        <div className="bg-white/20 rounded-lg h-6 w-1/3"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb */}
        <Breadcrumb className="mb-8 animate-in fade-in duration-500">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-2 hover:text-[#0088CC] transition-colors text-white/80">
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/categories" 
                className="hover:text-[#0088CC] transition-colors text-white/80"
              >
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-[#0088CC] font-semibold">
                {category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Enhanced Category Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="relative h-64 lg:h-80 rounded-3xl overflow-hidden mb-8 group">
            <img
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051933]/80 via-[#051933]/40 to-transparent flex items-end">
              <div className="p-8 lg:p-12 text-white w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-8 bg-[#0088CC] rounded-full"></div>
                  <span className="text-sm font-semibold tracking-wider opacity-90">
                    {categoryProducts.length} Products
                  </span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-4 tracking-tight">
                  {category.name}
                </h1>
                <p className="text-lg lg:text-xl opacity-90 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#0088CC]" />
                <div>
                  <div className="font-semibold text-sm text-white">Premium Collection</div>
                  <div className="text-xs text-white/70">Curated quality</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Sort */}
          <ProductSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            productCount={filteredProducts.length}
          />
        </div>

        <div className="flex gap-8">
          {/* Enhanced Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="animate-in zoom-in duration-200">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              
              <ProductFilters
                categories={allCategories}
                selectedCategory={category.name}
                onCategoryChange={() => {}}
                selectedSubcategory={selectedSubcategory}
                onSubcategoryChange={setSelectedSubcategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onClearFilters={clearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Mobile Filters & View Toggle */}
            <div className="flex items-center justify-between mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-in fade-in duration-500">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="lg:hidden bg-white/10 backdrop-blur-sm border-white/20 hover:border-[#3132DD] hover:bg-[#3132DD]/20 transition-all duration-200 group relative text-white"
                    >
                      <Filter className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#3132DD] text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96 bg-[#051933] border-white/20">
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Filters</h3>
                        {activeFilterCount > 0 && (
                          <Button 
                            variant="ghost" 
                            onClick={clearFilters} 
                            className="text-sm text-white/80 hover:text-white"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>
                      <ProductFilters
                        categories={allCategories}
                        selectedCategory={category.name}
                        onCategoryChange={() => {}}
                        selectedSubcategory={selectedSubcategory}
                        onSubcategoryChange={setSelectedSubcategory}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        minRating={minRating}
                        onMinRatingChange={setMinRating}
                        onClearFilters={clearFilters}
                        activeFilterCount={activeFilterCount}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden sm:block">
                  <span className="text-sm text-white/80">
                    Showing <span className="font-semibold text-white">{filteredProducts.length}</span> of{" "}
                    <span className="font-semibold text-white">{categoryProducts.length}</span> products
                  </span>
                </div>
              </div>

              {/* Enhanced View Toggle */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-sm text-white/80">
                  Sort: <span className="font-medium text-white">
                    {sortBy === "featured" ? "Featured" :
                     sortBy === "price-low" ? "Price: Low to High" :
                     sortBy === "price-high" ? "Price: High to Low" :
                     sortBy === "rating" ? "Top Rated" :
                     sortBy === "newest" ? "Newest" : "Name"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 border-2 border-white/20 rounded-xl p-1 bg-white/5">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                      viewMode === "grid" 
                        ? "bg-[#3132DD] text-white border-0" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                      viewMode === "list" 
                        ? "bg-[#3132DD] text-white border-0" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid 
              products={filteredProducts} 
              viewMode={viewMode}
            />

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 lg:py-24 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 animate-in fade-in duration-500">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
                  <Filter className="w-10 h-10 text-white/60" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  No products found
                </h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto text-lg">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear all filters
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white">
                    <a href="/categories">Browse All Categories</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Badge component for filter count
function Badge({ variant = "secondary", className = "", children }: { variant?: "secondary" | "default", className?: string, children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === "secondary" 
        ? "bg-[#3132DD] text-white" 
        : "bg-[#0088CC] text-white"
    } ${className}`}>
      {children}
    </span>
  )
}