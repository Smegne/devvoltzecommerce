"use client"

import { useState, useMemo, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { ProductSearch } from "@/components/product-search"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Grid, List } from "lucide-react"
import { Product, Category, convertToProductComponent, convertToCategoryComponent } from "@/lib/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  // FIXED: Increased price range to accommodate all products
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [error, setError] = useState<string | null>(null)

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

      console.log('📦 Raw data received:', {
        productsCount: productsData.length,
        products: productsData.map((p: any) => ({ id: p.id, title: p.title, price: p.price })),
        categoriesCount: categoriesData.length
      })

      const convertedProducts = productsData.map((product: any) => convertToProductComponent(product))
      const convertedCategories = categoriesData.map((cat: any) => convertToCategoryComponent(cat))

      console.log('✅ Converted data:', {
        productsCount: convertedProducts.length,
        categoriesCount: convertedCategories.length,
        convertedProducts: convertedProducts.map((p: Product) => ({ id: p.id, name: p.name, price: p.price }))
      })

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

    console.log('🔍 Starting product filtering:', {
      totalProducts: products.length,
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      minRating,
      sortBy
    })

    const filtered = products.filter((product) => {
      // Debug each product's filtering
      const filterResults = {
        id: product.id,
        name: product.name,
        price: product.price,
        passesSearch: true,
        passesCategory: true,
        passesSubcategory: true,
        passesPrice: true,
        passesRating: true
      }

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(q)
        const matchesDescription = product.description.toLowerCase().includes(q)
        const matchesCategory = product.category.toLowerCase().includes(q)
        const matchesBrand = product.brand?.toLowerCase().includes(q)
        if (!matchesName && !matchesDescription && !matchesCategory && !matchesBrand) {
          filterResults.passesSearch = false
          return false
        }
      }

      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        filterResults.passesCategory = false
        return false
      }

      // Subcategory filter
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        filterResults.passesSubcategory = false
        return false
      }

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        filterResults.passesPrice = false
        console.log(`❌ Product ${product.id} filtered by price: ${product.price} not in range [${priceRange[0]}, ${priceRange[1]}]`)
        return false
      }

      // Rating filter
      if (product.rating < minRating) {
        filterResults.passesRating = false
        return false
      }

      console.log(`✅ Product ${product.id} passed all filters:`, filterResults)
      return true
    })

    console.log('✅ After basic filtering:', {
      filteredCount: filtered.length,
      filteredProducts: filtered.map(p => ({ id: p.id, name: p.name, price: p.price }))
    })

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

    console.log('🎯 Final filtered products:', {
      count: filtered.length,
      products: filtered.map(p => ({ id: p.id, name: p.name, price: p.price }))
    })

    return filtered
  }, [products, searchQuery, selectedCategory, selectedSubcategory, priceRange, minRating, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedSubcategory("")
    setPriceRange([0, 50000]) // FIXED: Increased range
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
    return subcategories
  }, [selectedCategory, products])

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
              <div className="hidden lg:block w-80">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            All Products
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover our complete collection of {products.length} premium products
          </p>
          <ProductSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            productCount={filteredProducts.length}
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                onSubcategoryChange={setSelectedSubcategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                onClearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters & View Toggle */}
            <div className="flex items-center justify-between mb-8 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-background/80 backdrop-blur-sm border-muted hover:border-primary hover:bg-accent/50 transition-all duration-200">
                      <Filter className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96">
                    <div className="mt-6">
                      <ProductFilters
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        onSubcategoryChange={setSelectedSubcategory}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        minRating={minRating}
                        onMinRatingChange={setMinRating}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden sm:block">
                  <span className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{products.length}</span> products
                  </span>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border-2 border-muted rounded-xl p-1 bg-background/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid products={filteredProducts} viewMode={viewMode} />

            {/* No Results */}
            {filteredProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-16 lg:py-24 bg-background/50 rounded-3xl border">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Filter className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-lg">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                  <Button asChild>
                    <a href="/">Back to Home</a>
                  </Button>
                </div>
              </div>
            )}

            {/* No Products at All */}
            {products.length === 0 && (
              <div className="text-center py-16 lg:py-24 bg-background/50 rounded-3xl border">
                <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                  <Filter className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  No products available
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-lg">
                  There are no products in the database yet.
                </p>
                <Button asChild>
                  <a href="/">Back to Home</a>
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