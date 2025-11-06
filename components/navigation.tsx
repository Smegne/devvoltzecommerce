"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { CartDrawer } from "@/components/cart-drawer"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
}

export function Navigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const { getCartCount } = useCart()

  const cartCount = getCartCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-[#051933]/95 backdrop-blur supports-[backdrop-filter]:bg-[#051933]/60 transition-all duration-300 ${
      isScrolled ? "shadow-lg shadow-[#3132DD]/10" : "shadow-sm"
    } border-white/10`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 transition-transform hover:scale-105 duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3132DD] to-[#0088CC] flex items-center justify-center shadow-lg">
              <img 
                src="../logow.jpg" 
                alt="DevVoltz" 
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
            <span className="font-bold text-xl text-white">
              DevVoltz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
                >
                  {category.name}
                  <ChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180 text-white/60" />
                </Link>
                
                {/* Enhanced Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#051933] border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs text-white/60 border-b border-white/10">
                      Browse {category.name}
                    </div>
                    <Link 
                      href={`/category/${category.slug}`}
                      className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      View All
                    </Link>
                    <Link 
                      href={`/category/${category.slug}?sort=featured`}
                      className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      Featured
                    </Link>
                    <Link 
                      href={`/category/${category.slug}?sort=newest`}
                      className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Search Bar - Enhanced */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors" />
              <Input
                placeholder="Search for products, brands, and more..."
                className="pl-10 pr-4 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              />
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#051933] border border-white/20 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-white/80">Popular searches: iPhone, Laptop, Headphones</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Boost Your Shop Link - NEW */}
            <Link href="/tradershop" className="hidden lg:block">
              <Button className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:from-[#FF6B35]/90 hover:to-[#F7931E]/90 transition-all duration-200 hover:scale-105 shadow-lg border-0 text-white font-medium">
                <Rocket className="h-4 w-4 mr-2" />
                Boost Your Shop
              </Button>
            </Link>

            {/* Mobile Search */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden relative text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart with Enhanced Animation */}
            <CartDrawer>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative transition-all duration-200 hover:scale-110 text-white/80 hover:text-white hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5 transition-transform hover:scale-110" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#0088CC] text-white border-2 border-[#051933] animate-bounce">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* User Account with Enhanced Dropdown */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="rounded-full text-white/80 hover:text-white hover:bg-white/10">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#051933] border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm font-medium border-b border-white/10 text-white">
                        Hi, {user.name}
                      </div>
                      <Link href="/dashboard" className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                        Dashboard
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/orders" className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                        My Orders
                      </Link>
                      <Link href="/profile" className="block px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                        Profile Settings
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/20 rounded-md text-red-400 hover:text-red-300 transition-colors mt-2 border-t border-white/10 pt-2"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="transition-all duration-200 hover:scale-105 text-white/80 hover:text-white">
                    Login
                  </Button>
                </Link>
                {/* <Link href="/register">
                  <Button className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 transition-all duration-200 hover:scale-105 shadow-lg border-0">
                    Sign Up
                  </Button>
                </Link> */}
              </div>
            )}

            {/* Enhanced Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden transition-all duration-200 hover:scale-110 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96 bg-[#051933] border-l border-white/20">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#3132DD] to-[#0088CC] flex items-center justify-center">
                        <img 
                          src="../logow.jpg" 
                          alt="DevVoltz" 
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                      <span className="font-bold text-lg text-white">DevVoltz</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="flex items-center justify-between p-3 text-lg font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.name}
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      </Link>
                    ))}
                  </nav>

                  {/* Boost Your Shop Link for Mobile - NEW */}
                  <div className="py-4 border-t border-white/20">
                    <Link href="/tradershop" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] hover:from-[#FF6B35]/90 hover:to-[#F7931E]/90 transition-all duration-200 hover:scale-105 shadow-lg border-0 text-white font-medium">
                        <Rocket className="h-4 w-4 mr-2" />
                        Boost Your Shop
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Auth */}
                  <div className="border-t border-white/20 pt-6 space-y-4">
                    {user ? (
                      <div className="space-y-3">
                        <div className="px-3 py-2 text-sm text-white/60">
                          Signed in as {user.email}
                        </div>
                        {user.role === 'admin' && (
                          <Link href="/admin/dashboard">
                            <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
                              Admin Panel
                            </Button>
                          </Link>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-white/20 text-white hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                          onClick={logout}
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/login">
                          <Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
                            Login
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button className="w-full bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 border-0">
                            Sign Up
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Expanded */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4 animate-in fade-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search for products, brands, and more..."
                className="pl-10 pr-4 bg-white/5 border-white/20 text-white placeholder-white/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}