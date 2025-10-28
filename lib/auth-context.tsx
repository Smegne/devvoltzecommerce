"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  email_verified: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to add pending cart items
  const addPendingCartItem = async (token: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    const pendingItem = sessionStorage.getItem('pendingCartItem')
    if (!pendingItem) return false

    try {
      const { productId, redirectUrl } = JSON.parse(pendingItem)
      
      console.log('🛒 Processing pending cart item after login:', { productId })
      
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
        
        // Show success message (you can replace this with a toast notification)
        if (typeof window !== 'undefined') {
          console.log('Item added to cart successfully!')
        }
        
        // Redirect back to original page
        if (redirectUrl && redirectUrl !== window.location.href) {
          window.location.href = redirectUrl
          return true
        }
      } else {
        console.error('❌ Failed to add pending cart item')
        sessionStorage.removeItem('pendingCartItem')
      }
    } catch (error) {
      console.error('❌ Error processing pending cart item:', error)
      sessionStorage.removeItem('pendingCartItem')
    }
    
    return false
  }

  // Redirect user after login based on role and pending items
  const redirectAfterLogin = (userRole: string, token: string) => {
    // First check for pending cart items
    const hadPendingItem = sessionStorage.getItem('pendingCartItem')
    
    if (hadPendingItem) {
      // If there was a pending item, we'll handle redirect in addPendingCartItem
      return
    }
    
    // Default redirect based on user role
    if (userRole === 'admin') {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/dashboard'
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        
        // Check for and process pending cart items
        const hadRedirect = await addPendingCartItem(data.token)
        
        // If no redirect happened from pending cart item, do default redirect
        if (!hadRedirect) {
          redirectAfterLogin(data.user.role, data.token)
        }
        
        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Store token and user data
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        
        // Check for and process pending cart items (for users who tried to add to cart before registering)
        const hadRedirect = await addPendingCartItem(data.token)
        
        // If no redirect happened from pending cart item, do default redirect
        if (!hadRedirect) {
          // New users are customers by default
          window.location.href = '/dashboard'
        }
        
        return true
      } else {
        console.error('Registration failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    
    // Redirect to home page
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}