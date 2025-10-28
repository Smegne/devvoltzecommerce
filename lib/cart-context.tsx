"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/types'

export interface CartItem {
  productId: string
  quantity: number
  product?: Product
}

interface CartContextType {
  items: CartItem[]
  addItem: (productId: string, product?: Product) => Promise<boolean>
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getCartCount: () => number
  getCartItems: () => CartItem[]
  getCartTotal: () => number
  clearCart: () => void
  isInCart: (productId: string) => boolean
  loading: boolean
  syncCartWithServer: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getToken()
  }

  // Sync cart with server on component mount
  useEffect(() => {
    syncCartWithServer()
  }, [])

  // Add event listener for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🛒 Cart update event received, syncing with server...')
      syncCartWithServer()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const syncCartWithServer = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      console.log('🛒 Syncing cart with server, token exists:', !!token)
      
      if (!token) {
        console.log('🛒 No token found, using local cart only')
        return
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('🛒 Cart sync response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('🛒 Server cart data:', data)
        
        // Transform the server data to match our CartItem format
        const serverItems: CartItem[] = (data.items || []).map((item: any) => {
          // Handle images field - it could be JSON string, array, or single string
          let images: string[] = [];
          if (item.images) {
            if (typeof item.images === 'string') {
              try {
                // Try to parse as JSON array
                const parsed = JSON.parse(item.images);
                images = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
              } catch {
                // If parsing fails, treat as single image URL
                images = [item.images].filter(Boolean);
              }
            } else if (Array.isArray(item.images)) {
              images = item.images;
            }
          }
          
          // If no images, use placeholder
          if (images.length === 0) {
            images = ['/api/placeholder/300/300?text=Product'];
          }

          return {
            productId: item.productId.toString(),
            quantity: item.quantity,
            product: {
              id: item.productId,
              name: item.name,
              description: item.description,
              price: parseFloat(item.price),
              images: images,
              category: item.category,
              stockCount: item.stockQuantity || 0,
              inStock: (item.stockQuantity || 0) > 0,
              rating: 0,
              reviewCount: 0,
              featured: false,
              original_price: null
            }
          }
        })
        
        setItems(serverItems)
      } else {
        console.error('❌ Failed to sync cart:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to sync cart with server:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: string, product?: Product): Promise<boolean> => {
    const token = getToken()
    
    console.log('🛒 Adding item to cart:', { 
      productId, 
      product, 
      tokenExists: !!token,
      hasProductData: !!product 
    })

    // Check if user is authenticated
    if (!token) {
      console.log('🛒 User not logged in, redirecting to login...')
      
      // Store the intended product to add in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingCartItem', JSON.stringify({
          productId,
          product,
          redirectUrl: window.location.href
        }))
      }
      
      // Redirect to login page
      router.push('/login')
      return false // Return false to indicate redirect happened
    }

    // Update local state immediately for better UX
    setItems(current => {
      const existing = current.find(item => item.productId === productId)
      if (existing) {
        return current.map(item =>
          item.productId === productId
            ? { 
                ...item, 
                quantity: item.quantity + 1, 
                product: product || item.product 
              }
            : item
        )
      }
      return [...current, { productId, quantity: 1, product }]
    })

    // Sync with server since user is authenticated
    try {
      console.log('🛒 Sending add to cart request to server...')
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      console.log('🛒 Add to cart response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error:', errorText)
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Add to cart success:', result)
      
      // Force immediate cart sync to ensure navigation shows correct count
      setTimeout(() => {
        syncCartWithServer()
      }, 100)
      
      return true

    } catch (error) {
      console.error('❌ Failed to sync with server:', error)
      // Revert local changes if server sync fails
      setItems(current => current.filter(item => item.productId !== productId))
      return false
    }
  }

  const removeItem = async (productId: string) => {
    const token = getToken()
    
    console.log('🛒 Removing item from cart:', { productId, tokenExists: !!token })

    // Update local state immediately
    setItems(current => current.filter(item => item.productId !== productId))

    // Sync with server if user is authenticated
    if (token) {
      try {
        const response = await fetch(`/api/cart/remove?productId=${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('🛒 Remove from cart response status:', response.status)

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`)
        }
        
        // Force sync after removal
        setTimeout(() => {
          syncCartWithServer()
        }, 100)
      } catch (error) {
        console.error('❌ Failed to sync with server:', error)
      }
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    const token = getToken()
    
    console.log('🛒 Updating cart quantity:', { productId, quantity, tokenExists: !!token })

    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    // Update local state immediately
    setItems(current =>
      current.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )

    // Sync with server if user is authenticated
    if (token) {
      try {
        const response = await fetch('/api/cart/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity })
        })

        console.log('🛒 Update quantity response status:', response.status)

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`)
        }
        
        // Force sync after quantity update
        setTimeout(() => {
          syncCartWithServer()
        }, 100)
      } catch (error) {
        console.error('❌ Failed to sync with server:', error)
      }
    }
  }

  const getCartCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartItems = () => {
    return items
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const clearCart = async () => {
    const token = getToken()
    
    console.log('🛒 Clearing cart, token exists:', !!token)

    // Clear local state immediately
    setItems([])

    // Clear server cart if user is authenticated
    if (token) {
      try {
        // Remove each item from server
        for (const item of items) {
          await fetch(`/api/cart/remove?productId=${item.productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
        console.log('✅ Server cart cleared')
        
        // Force sync after clearing
        setTimeout(() => {
          syncCartWithServer()
        }, 100)
      } catch (error) {
        console.error('❌ Failed to clear server cart:', error)
      }
    }
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  // Function to check for pending cart items after login
  const checkPendingCartItems = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false

    const pendingItem = sessionStorage.getItem('pendingCartItem')
    if (pendingItem) {
      try {
        const { productId, product } = JSON.parse(pendingItem)
        console.log('🛒 Processing pending cart item:', { productId })
        
        // Add the pending item to cart
        const success = await addItem(productId, product)
        
        if (success) {
          // Clear the pending item
          sessionStorage.removeItem('pendingCartItem')
          console.log('✅ Pending cart item processed successfully')
        }
        
        return success
      } catch (error) {
        console.error('❌ Failed to process pending cart item:', error)
        sessionStorage.removeItem('pendingCartItem')
        return false
      }
    }
    return false
  }

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      getCartCount,
      getCartItems,
      getCartTotal,
      clearCart,
      isInCart,
      loading,
      syncCartWithServer
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}