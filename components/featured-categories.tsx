"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  product_count: number
}

// Fallback images for categories
const FALLBACK_IMAGES = {
  electronics: "/electro2.jpg?text=Electronics",
  fashion: "/fashion.avif?text=Fashion",
  home: "/home and decore.avif?text=Home+Essentials",
  default: "/api/placeholder/400/320?text=DevVoltz"
}

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchFeaturedCategories()
  }, [])

  const fetchFeaturedCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories/featured')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        // Fallback demo data if API fails
        setCategories(getDemoCategories())
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories(getDemoCategories())
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = (categoryId: number) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }))
  }

  const getImageSrc = (category: Category) => {
    if (imageErrors[category.id] || !category.image) {
      // Try to match category name for fallback, otherwise use default
      const categoryName = category.name.toLowerCase()
      if (categoryName.includes('electronic') || categoryName.includes('tech')) {
        return FALLBACK_IMAGES.electronics
      } else if (categoryName.includes('fashion') || categoryName.includes('clothing')) {
        return FALLBACK_IMAGES.fashion
      } else if (categoryName.includes('home') || categoryName.includes('living')) {
        return FALLBACK_IMAGES.home
      }
      return FALLBACK_IMAGES.default
    }
    return category.image
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))] -z-20"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-16 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-3 text-primary mb-4">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">TRENDING CATEGORIES</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Shop by Category
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Discover cutting-edge technology, premium fashion, and smart home essentials 
              curated for the modern lifestyle
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Premium Quality</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Fast Shipping</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Verified Products</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              index={index}
              getImageSrc={getImageSrc}
              onImageError={() => handleImageError(category.id)}
            />
          ))}
        </div>

        {/* Enhanced CTA */}
        <div className="text-center mt-16 animate-in fade-in duration-700 delay-500">
          <Link href="/categories">
            <Button 
              size="lg"
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center">
                Explore All Categories
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

interface CategoryCardProps {
  category: Category
  index: number
  getImageSrc: (category: Category) => string
  onImageError: () => void
}

function CategoryCard({ category, index, getImageSrc, onImageError }: CategoryCardProps) {
  return (
    <Link 
      href={`/category/${category.slug}`}
      className="group block animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <Card className="group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden border border-gray-200/50 bg-white/70 backdrop-blur-sm hover:bg-white/90 h-full hover:-translate-y-2">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative overflow-hidden flex-1">
            {/* Image with fallback */}
            <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={getImageSrc(category)}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={onImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-wide drop-shadow-lg leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed drop-shadow line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 bg-white/20 p-2 rounded-lg">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-200 shadow-lg mt-4"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              {/* Enhanced Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {category.product_count}+ Products
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Demo data fallback
function getDemoCategories(): Category[] {
  return [
    {
      id: 1,
      name: "Smart Electronics",
      slug: "smart-electronics",
      description: "Latest gadgets and smart devices for modern living",
      image: FALLBACK_IMAGES.electronics,
      product_count: 156
    },
    {
      id: 2,
      name: "Premium Fashion",
      slug: "premium-fashion",
      description: "Stylish clothing and accessories for every occasion",
      image: FALLBACK_IMAGES.fashion,
      product_count: 89
    },
    {
      id: 3,
      name: "Home Essentials",
      slug: "home-essentials",
      description: "Everything you need for a comfortable home",
      image: FALLBACK_IMAGES.home,
      product_count: 203
    }
  ]
}