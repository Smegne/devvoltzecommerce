"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  ShoppingBag, 
  Settings,
  ArrowLeft,
  Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/auth/login')
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (currentUser) {
      setIsLoading(false)
    }
  }, [currentUser])

  // Show loading while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Profile</p>
            <p className="text-sm text-slate-600">Getting your information ready...</p>
          </div>
        </div>
      </div>
    )
  }

  // If not logged in, don't render anything (will redirect)
  if (!currentUser) {
    return null
  }

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'user':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'user':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  My Profile
                </span>
                <span className="text-sm text-slate-600 ml-2">
                  Account Information
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-600 capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="outline"
          onClick={() => router.push('https://voltmarket.devvoltz.com/')}
          className="border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 mb-4 shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Welcome back, {currentUser.name}! 👋
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We're glad to see you again. Here's your profile information and account details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Your basic profile details
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-200 hover:bg-blue-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </label>
                    <p className="text-lg font-semibold text-slate-800">{currentUser.name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <p className="text-lg font-semibold text-slate-800">{currentUser.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Account Role
                    </label>
                    <Badge 
                      variant={getRoleVariant(currentUser.role)} 
                      className={`text-sm capitalize ${getRoleColor(currentUser.role)}`}
                    >
                      {currentUser.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </label>
                    <p className="text-lg font-semibold text-slate-800">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Manage your account and orders
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => router.push('/orders')}
                    className="h-16 justify-start bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800"
                  >
                    <ShoppingBag className="h-5 w-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">My Orders</div>
                      <div className="text-xs text-slate-600">View order history</div>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-16 justify-start bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800"
                  >
                    <Settings className="h-5 w-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">Account Settings</div>
                      <div className="text-xs text-slate-600">Update preferences</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Account Summary */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="text-slate-800 text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Verified</span>
                    <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Security</span>
                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                      Protected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Need Help?</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Our support team is here to help you with any questions.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}