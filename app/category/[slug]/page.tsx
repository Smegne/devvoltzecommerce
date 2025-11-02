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
import { Filter, Grid, List, Home, ChevronRight, Sparkles, TrendingUp, SlidersHorizontal, X, Star, Zap, Clock, Shield, Truck, Tag, Award, Users, ShoppingBag } from "lucide-react"
import { Product, Category, convertToProductComponent, convertToCategoryComponent } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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
      console.error('❌ Failed to fetch category data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load category')
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
    setPriceRange([0, 50000])
    setMinRating(0)
    setSortBy("featured")
  }

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    selectedSubcategory ? 1 : 0,
    priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].filter(Boolean).length

  // Category-specific styling with banner images
  const getCategoryTheme = (categoryName: string) => {
    const themes: { [key: string]: { 
      gradient: string, 
      accent: string, 
      icon: React.ReactNode,
      bannerImage: string,
      statsColor: string
    } } = {
      'Electronics': {
        gradient: 'from-blue-500/20 via-purple-500/10 to-cyan-500/20',
        accent: 'text-blue-400',
        icon: <Zap className="w-5 h-5" />,
        bannerImage: '/api/placeholder/1200/400?text=Electronics+Collection&bg=linear-gradient(135deg,#667eea,#764ba2)',
        statsColor: 'bg-blue-500/20 text-blue-700'
      },
      'Fashion': {
        gradient: 'from-pink-500/20 via-rose-500/10 to-red-500/20',
        accent: 'text-pink-400',
        icon: <Sparkles className="w-5 h-5" />,
        bannerImage: '/api/placeholder/1200/400?text=Fashion+Collection&bg=linear-gradient(135deg,#f093fb,#f5576c)',
        statsColor: 'bg-pink-500/20 text-pink-700'
      },
      'Home & Kitchen': {
        gradient: 'from-green-500/20 via-emerald-500/10 to-teal-500/20',
        accent: 'text-green-400',
        icon: <Home className="w-5 h-5" />,
        bannerImage: '/api/placeholder/1200/400?text=Home+%26+Kitchen&bg=linear-gradient(135deg,#4facfe,#00f2fe)',
        statsColor: 'bg-green-500/20 text-green-700'
      },
      'Sports': {
        gradient: 'from-orange-500/20 via-amber-500/10 to-yellow-500/20',
        accent: 'text-orange-400',
        icon: <TrendingUp className="w-5 h-5" />,
        bannerImage: '/api/placeholder/1200/400?text=Sports+Equipment&bg=linear-gradient(135deg,#fa709a,#fee140)',
        statsColor: 'bg-orange-500/20 text-orange-700'
      },
      'Books': {
        gradient: 'from-indigo-500/20 via-violet-500/10 to-purple-500/20',
        accent: 'text-indigo-400',
        icon: <Star className="w-5 h-5" />,
        bannerImage: '/api/placeholder/1200/400?text=Books+%26+Education&bg=linear-gradient(135deg,#a8edea,#fed6e3)',
        statsColor: 'bg-indigo-500/20 text-indigo-700'
      }
    }
    return themes[categoryName] || themes['Electronics']
  }

  const categoryTheme = category ? getCategoryTheme(category.name) : getCategoryTheme('Electronics')

  // Calculate category stats
  const categoryStats = useMemo(() => {
    if (!categoryProducts.length) return null
    
    const prices = categoryProducts.map(p => p.price)
    const ratings = categoryProducts.map(p => p.rating)
    
    return {
      totalProducts: categoryProducts.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgRating: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
      featuredCount: categoryProducts.filter(p => p.featured).length,
      inStockCount: categoryProducts.filter(p => p.inStock).length
    }
  }, [categoryProducts])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Category Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-8 animate-pulse">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-4 w-4 bg-gray-200" />
            <Skeleton className="h-4 w-32 bg-gray-200" />
            <Skeleton className="h-4 w-4 bg-gray-200" />
            <Skeleton className="h-4 w-20 bg-gray-200" />
          </div>

          {/* Category Header Skeleton */}
          <Skeleton className="h-64 lg:h-80 w-full rounded-3xl mb-12 bg-gradient-to-r from-gray-200 to-gray-300" />

          {/* Content Skeleton */}
          <div className="flex gap-8">
            <div className="hidden lg:block w-80">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 bg-gray-200" />
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-gray-200" />
                      <Skeleton className="h-4 w-1/2 bg-gray-200" />
                      <Skeleton className="h-6 w-1/3 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100/50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <Home className="w-4 h-4" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/categories" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-semibold text-gray-900">
                {category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Enhanced Category Header with Banner Image */}
        <div className="mb-12">
          <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden mb-8 group shadow-2xl">
            {/* Banner Image */}
            <div className="absolute inset-0">
              <img
                src={category.image || categoryTheme.bannerImage}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 text-white">
              {/* Category Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-8 ${categoryTheme.accent.replace('text', 'bg')} rounded-full`}></div>
                <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white px-4 py-2">
                  <ShoppingBag className="w-3 h-3 mr-2" />
                  Premium Collection
                </Badge>
              </div>

              {/* Main Title */}
              <div className="mb-6">
                <h1 className="text-5xl lg:text-7xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <p className="text-xl lg:text-2xl opacity-90 max-w-2xl leading-relaxed bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                  {category.description}
                </p>
              </div>

              {/* Quick Stats */}
              {categoryStats && (
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">{categoryStats.totalProducts} Products</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{categoryStats.avgRating} Avg Rating</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <Award className="w-4 h-4" />
                    <span className="text-sm font-medium">{categoryStats.featuredCount} Featured</span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Elements */}
            <div className="absolute top-6 right-6 flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3">
                  {categoryTheme.icon}
                  <div>
                    <div className="font-semibold text-sm text-white">Premium Quality</div>
                    <div className="text-xs text-white/70">100% Verified</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/30 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-green-300" />
                  <div>
                    <div className="font-semibold text-sm text-white">Free Delivery</div>
                    <div className="text-xs text-white/70">On orders over ETB 500</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left Elements */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Sort */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
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
          {/* Enhanced Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Filters Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters & Sorting
                  </h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
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

              {/* Category Stats Card */}
              {categoryStats && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Category Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Total Products</span>
                      </div>
                      <span className="font-semibold text-gray-900">{categoryStats.totalProducts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Price Range</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-right">
                        ETB {categoryStats.minPrice.toLocaleString()}<br/>
                        - ETB {categoryStats.maxPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">Avg Rating</span>
                      </div>
                      <span className="font-semibold text-gray-900">{categoryStats.avgRating}/5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Featured</span>
                      </div>
                      <span className="font-semibold text-gray-900">{categoryStats.featuredCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSortBy('featured')}>
                    <Star className="w-4 h-4" />
                    Show Featured
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setPriceRange([0, 10000])}>
                    <Tag className="w-4 h-4" />
                    Under ETB 10K
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Enhanced Mobile Filters & View Toggle */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="lg:hidden bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group relative shadow-sm"
                      >
                        <Filter className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                        Filters
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center animate-bounce shadow-lg">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 sm:w-96 bg-white border-gray-200 shadow-xl">
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Filters & Sorting</h3>
                          <div className="flex items-center gap-2">
                            {activeFilterCount > 0 && (
                              <Button 
                                variant="ghost" 
                                onClick={clearFilters} 
                                className="text-sm text-gray-600 hover:text-gray-900"
                              >
                                Clear all
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setMobileFiltersOpen(false)}
                              className="hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{" "}
                        <span className="font-semibold text-gray-900">{categoryProducts.length}</span> products
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced View Toggle */}
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-sm text-gray-600">
                    Sort: <span className="font-medium text-gray-900">
                      {sortBy === "featured" ? "Featured" :
                       sortBy === "price-low" ? "Price: Low to High" :
                       sortBy === "price-high" ? "Price: High to Low" :
                       sortBy === "rating" ? "Top Rated" :
                       sortBy === "newest" ? "Newest" : "Name"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 border-2 border-gray-200 rounded-xl p-1 bg-gray-50 shadow-sm">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                        viewMode === "grid" 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-white"
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
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <ProductGrid 
                products={filteredProducts} 
                viewMode={viewMode}
              />
            ) : (
              <div className="text-center py-16 lg:py-24 bg-white rounded-3xl shadow-lg border border-gray-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                  <Filter className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  >
                    Clear all filters
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
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