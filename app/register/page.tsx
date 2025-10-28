"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Check, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (passwordStrength < 3) {
      setError("Please choose a stronger password")
      return
    }

    const success = await register(formData.email, formData.password, formData.name)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Registration failed. Please try again.")
    }
  }

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    checkPasswordStrength(newPassword)
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "bg-white/20"
      case 1: return "bg-red-500"
      case 2: return "bg-yellow-500"
      case 3: return "bg-[#0088CC]"
      case 4: return "bg-green-500"
      default: return "bg-white/20"
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very Weak"
      case 1: return "Weak"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Strong"
      default: return ""
    }
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
              Join DevVoltz
            </h1>
            <p className="text-lg text-white/80">
              Create your account and discover premium products
            </p>
          </div>

          <Card className="group hover:shadow-xl transition-all duration-500 border-white/20 bg-white/10 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3132DD] to-[#0088CC]"></div>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl flex items-center justify-center gap-2 text-white">
                <Sparkles className="w-6 h-6 text-[#0088CC]" />
                Create Account
              </CardTitle>
              <p className="text-white/80">Join thousands of satisfied customers</p>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium text-white/90">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors group-focus-within:text-[#0088CC]" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 pr-4 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password" className="text-sm font-medium text-white/90">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors group-focus-within:text-[#0088CC]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                      value={formData.password}
                      onChange={handlePasswordChange}
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength >= 4 ? 'text-green-400' :
                          passwordStrength >= 3 ? 'text-[#0088CC]' :
                          passwordStrength >= 2 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-colors group-focus-within:text-[#0088CC]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-[#0088CC]/20 border-white/20 bg-white/5 text-white placeholder-white/50"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/60 hover:text-white transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      className="mt-1 data-[state=checked]:bg-[#0088CC] data-[state=checked]:border-[#0088CC] border-white/40"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed text-white/90">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#0088CC] hover:underline font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#0088CC] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="newsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => setFormData({ ...formData, subscribeNewsletter: checked as boolean })}
                      className="mt-1 data-[state=checked]:bg-[#0088CC] data-[state=checked]:border-[#0088CC] border-white/40"
                    />
                    <Label htmlFor="newsletter" className="text-sm leading-relaxed text-white/90">
                      Subscribe to our newsletter for exclusive deals and updates
                    </Label>
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <Separator className="bg-white/20" />

              {/* Enhanced Sign In Link */}
              <div className="text-center space-y-4">
                <p className="text-sm text-white/80">Already have an account?</p>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full group border-2 border-white/20 hover:border-[#0088CC] hover:bg-[#0088CC]/10 text-white transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    Sign In to Your Account
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-[#0088CC]" />
                  <div className="text-xs text-white/80">Secure</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Check className="w-5 h-5 mx-auto mb-2 text-[#3132DD]" />
                  <div className="text-xs text-white/80">Verified</div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#0088CC]" />
                  <div className="text-xs text-white/80">Premium</div>
                </div>
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