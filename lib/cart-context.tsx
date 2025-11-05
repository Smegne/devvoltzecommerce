// lib/cart-context.tsx
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
  // Enhanced UX states
  recentlyAdded: string | null
  showCartNotification: boolean
  hideCartNotification: () => void
  // Cart persistence
  saveCartToLocalStorage: () => void
  loadCartFromLocalStorage: () => void
  // Cart operations
  incrementQuantity: (productId: string) => void
  decrementQuantity: (productId: string) => void
  getItemQuantity: (productId: string) => number
  // Cart validation
  validateCart: () => Promise<{ valid: boolean; errors: string[] }>
  // Bulk operations
  addMultipleItems: (items: { productId: string; product?: Product; quantity: number }[]) => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)
  const [showCartNotification, setShowCartNotification] = useState(false)
  const router = useRouter()

  // Initialize cart from localStorage on mount
  useEffect(() => {
    loadCartFromLocalStorage()
    syncCartWithServer()
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToLocalStorage()
  }, [items])

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Get user ID from localStorage or session
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          return user.id
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
    return null
  }

  // Local Storage Management
  const saveCartToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const cartData = {
          items,
          timestamp: Date.now(),
          version: '1.0'
        }
        localStorage.setItem('devvoltz_cart', JSON.stringify(cartData))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }

  const loadCartFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('devvoltz_cart')
        if (savedCart) {
          const cartData = JSON.parse(savedCart)
          // Check if cart is not too old (e.g., 7 days)
          if (Date.now() - cartData.timestamp < 7 * 24 * 60 * 60 * 1000) {
            setItems(cartData.items || [])
          } else {
            // Clear expired cart
            localStorage.removeItem('devvoltz_cart')
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        // Clear corrupted cart data
        localStorage.removeItem('devvoltz_cart')
      }
    }
  }

  // Notification Management
  const showNotification = (productName: string) => {
    setRecentlyAdded(productName)
    setShowCartNotification(true)
    
    // Auto-hide notification after 4 seconds
    setTimeout(() => {
      hideCartNotification()
    }, 4000)
  }

  const hideCartNotification = () => {
    setShowCartNotification(false)
    setTimeout(() => {
      setRecentlyAdded(null)
    }, 300)
  }

  // Server Synchronization
  const syncCartWithServer = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
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
        
        // Merge server items with local items, prioritizing server data
        setItems(prevItems => {
          const mergedItems = [...serverItems]
          // Add local items that aren't on server (for offline support)
          prevItems.forEach(localItem => {
            if (!serverItems.find(serverItem => serverItem.productId === localItem.productId)) {
              mergedItems.push(localItem)
            }
          })
          return mergedItems
        })
      } else {
        console.error('❌ Failed to sync cart:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Failed to sync cart with server:', error)
    } finally {
      setLoading(false)
    }
  }

  // Core Cart Operations
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

    // Show notification
    if (product) {
      showNotification(product.name)
    }

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

  // Quantity Helpers
  const incrementQuantity = (productId: string) => {
    const currentItem = items.find(item => item.productId === productId)
    if (currentItem) {
      updateQuantity(productId, currentItem.quantity + 1)
    }
  }

  const decrementQuantity = (productId: string) => {
    const currentItem = items.find(item => item.productId === productId)
    if (currentItem) {
      updateQuantity(productId, currentItem.quantity - 1)
    }
  }

  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  // Cart Information Getters
  const getCartCount = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartItems = (): CartItem[] => {
    return items
  }

  const getCartTotal = (): number => {
    return items.reduce((total, item) => {
      const price = item.product?.price || 0
      return total + (price * item.quantity)
    }, 0)
  }

  const isInCart = (productId: string): boolean => {
    return items.some(item => item.productId === productId)
  }

  // Bulk Operations
  const addMultipleItems = async (itemsToAdd: { productId: string; product?: Product; quantity: number }[]): Promise<boolean> => {
    const token = getToken()
    
    if (!token) {
      console.log('🛒 User not logged in, cannot add multiple items')
      return false
    }

    try {
      // Update local state
      setItems(current => {
        const updatedItems = [...current]
        itemsToAdd.forEach(newItem => {
          const existingIndex = updatedItems.findIndex(item => item.productId === newItem.productId)
          if (existingIndex >= 0) {
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
              product: newItem.product || updatedItems[existingIndex].product
            }
          } else {
            updatedItems.push({
              productId: newItem.productId,
              quantity: newItem.quantity,
              product: newItem.product
            })
          }
        })
        return updatedItems
      })

      // Sync with server
      const response = await fetch('/api/cart/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsToAdd })
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      setTimeout(() => {
        syncCartWithServer()
      }, 100)

      return true
    } catch (error) {
      console.error('❌ Failed to add multiple items:', error)
      return false
    }
  }

  // Cart Management
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

  // Cart Validation
  const validateCart = async (): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = []
    
    // Check for items that are out of stock
    const outOfStockItems = items.filter(item => !item.product?.inStock)
    if (outOfStockItems.length > 0) {
      errors.push(`Some items are out of stock: ${outOfStockItems.map(item => item.product?.name).join(', ')}`)
    }

    // Check for items with insufficient stock
    const insufficientStockItems = items.filter(item => {
      const product = item.product
      return product && product.inStock && item.quantity > product.stockCount
    })
    
    if (insufficientStockItems.length > 0) {
      errors.push(`Insufficient stock for: ${insufficientStockItems.map(item => 
        `${item.product?.name} (max: ${item.product?.stockCount})`
      ).join(', ')}`)
    }

    // Check for items that no longer exist
    const invalidItems = items.filter(item => !item.product)
    if (invalidItems.length > 0) {
      errors.push(`Some items are no longer available`)
    }

    // If we have a token, we can do server-side validation
    const token = getToken()
    if (token) {
      try {
        const response = await fetch('/api/cart/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const serverValidation = await response.json()
          if (!serverValidation.valid && serverValidation.errors) {
            errors.push(...serverValidation.errors)
          }
        }
      } catch (error) {
        console.error('Error during server cart validation:', error)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
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
      syncCartWithServer,
      recentlyAdded,
      showCartNotification,
      hideCartNotification,
      saveCartToLocalStorage,
      loadCartFromLocalStorage,
      incrementQuantity,
      decrementQuantity,
      getItemQuantity,
      validateCart,
      addMultipleItems
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