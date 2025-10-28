"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(formData.email, formData.password)
    if (!success) {
      setError("Invalid email or password")
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password })
    
    // Auto-submit after a brief delay to show the form filling
    setTimeout(async () => {
      const success = await login(email, password)
      if (!success) {
        setError("Invalid demo credentials")
      }
    }, 500)
  }

  // Enhanced login function that handles cart redirects
  const enhancedLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Check if there's a pending cart item
        await handlePendingCartItem(data.token)
        
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
      return false
    }
  }

  // Handle pending cart items after login
  const handlePendingCartItem = async (token: string) => {
    if (typeof window === 'undefined') return

    const pendingItem = sessionStorage.getItem('pendingCartItem')
    if (pendingItem) {
      try {
        const { productId, product, redirectUrl } = JSON.parse(pendingItem)
        
        console.log('🛒 Processing pending cart item after login:', { productId })
        
        // Add the pending item to cart
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: 1 })
        })
        
        if (response.ok) {
          console.log('✅ Pending cart item added successfully')
          sessionStorage.removeItem('pendingCartItem')
          
          // Show success message
          if (typeof window !== 'undefined') {
            // You can show a toast notification here
            console.log('Item added to cart successfully!')
          }
          
          // Redirect back to original page or products
          if (redirectUrl && redirectUrl !== window.location.href) {
            window.location.href = redirectUrl
            return
          }
        } else {
          console.error('❌ Failed to add pending cart item')
        }
      } catch (error) {
        console.error('❌ Error processing pending cart item:', error)
        sessionStorage.removeItem('pendingCartItem')
      }
    }
    
    // Default redirect based on user role
    redirectAfterLogin()
  }

  // Redirect user after login based on role
  const redirectAfterLogin = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/products'
        }
      } catch (error) {
        window.location.href = '/products'
      }
    } else {
      window.location.href = '/products'
    }
  }

  // Override the login function from auth context if needed
  // If your auth context doesn't handle cart redirects, use this enhanced version
  const handleLoginWithRedirect = async (email: string, password: string): Promise<boolean> => {
    return await enhancedLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051933] via-[#051933] to-[#3132DD]/10">
      <Navigation />

      <main className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-md mx-auto animate-in fade-in duration-700">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3132DD] to-[#0088CC] flex items-center justify-center shadow-lg">
                <img 
                  src="../logow.jpg" 
                  alt="DevVoltz" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
              </div>
              <span className="font-bold text-2xl text-white">
                DevVoltz
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">
              Welcome Back
            </h1>
            <p className="text-lg text-white/80">
              Sign in to access your account and continue shopping
            </p>
          </div>

          <Card className="group hover:shadow-xl transition-all duration-500 border-white/20 bg-white/10 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3132DD] to-[#0088CC]"></div>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center gap-2 text-white">
                <Sparkles className="w-6 h-6 text-[#0088CC]" />
                Sign In
              </CardTitle>
              <p className="text-white/80">Access your DevVoltz account</p>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-white/90">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors group-focus-within:text-[#0088CC]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 pr-4 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-white/90">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-[#0088CC] hover:underline font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors group-focus-within:text-[#0088CC]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/60 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm animate-in fade-in duration-300">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 transition-all duration-300 transform hover:scale-105 shadow-lg border-0"
                  disabled={isLoading}
                  size="lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Demo Credentials Section - Commented out but styled */}
              {/* <div className="space-y-3">
                <Separator className="bg-white/20" />
                <div className="text-center">
                  <p className="text-sm text-white/80 mb-3">Quick demo access:</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs group hover:bg-[#3132DD]/20 hover:border-[#3132DD] transition-all duration-200 border-white/20 text-white"
                      onClick={() => handleDemoLogin("customer@example.com", "password")}
                      disabled={isLoading}
                    >
                      <Zap className="w-3 h-3 mr-1 text-[#0088CC] group-hover:scale-110 transition-transform" />
                      Customer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs group hover:bg-[#0088CC]/20 hover:border-[#0088CC] transition-all duration-200 border-white/20 text-white"
                      onClick={() => handleDemoLogin("melkaadmin@gmail.com", "mySecret123")}
                    >
                      <Shield className="w-3 h-3 mr-1 text-[#0088CC] group-hover:scale-110 transition-transform" />
                      Real Admin
                    </Button>
                  </div>
                </div>
                <Separator className="bg-white/20" />
              </div> */}

              {/* Enhanced Sign Up Link */}
              <div className="text-center space-y-4">
                <p className="text-sm text-white/80">New to DevVoltz?</p>
                <Link href="/register">
                  <Button 
                    variant="outline" 
                    className="w-full group border-2 border-white/20 hover:border-[#0088CC] hover:bg-[#0088CC]/10 text-white transition-all duration-300"
                  >
                    Create New Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-[#0088CC]" />
                  <div className="text-xs text-white/80">Secure Login</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Zap className="w-5 h-5 mx-auto mb-2 text-[#3132DD]" />
                  <div className="text-xs text-white/80">Fast Access</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#0088CC]" />
                  <div className="text-xs text-white/80">Premium</div>
                </div>
              </div>

              {/* Cart Redirect Info */}
              <div className="bg-[#0088CC]/20 border border-[#0088CC]/30 rounded-lg p-3 text-center">
                <p className="text-xs text-white">
                  <strong>Cart Items Protected:</strong> Your pending cart items will be automatically added after login
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Background decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3132DD]/10 rounded-full blur-3xl animate-pulse -z-10"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#0088CC]/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>
        </div>
      </main>

      <Footer />
    </div>
  )
}