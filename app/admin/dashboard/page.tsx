"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Upload,
  Image as ImageIcon,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Copy,
  RefreshCw,
  Settings,
  Tag,
  Star,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from "lucide-react"

// Add these imports at the top
import { Grid3X3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

// Types matching your database schema
interface Product {
  id: number
  title: string
  description: string
  price: number
  original_price: number | null
  category: string
  subcategory: string | null
  brand: string | null
  stock_quantity: number
  availability: 'in_stock' | 'out_of_stock' | 'pre_order'
  images: string[]
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
  rating: number
  review_count: number
}

interface User {
  id: number
  name: string
  email: string
  password: string
  role: 'customer' | 'admin'
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface Order {
  id: number
  user_id: number
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  shipping_address: any
  billing_address: any
  payment_method: string | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_verification_url: string | null
  payment_screenshot_filename: string | null
  payment_verified: boolean
  admin_notes: string | null
  tracking_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user?: User
  customer_email?: string
  name?: string
}

interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

interface DashboardStats {
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  outOfStockProducts: number
  monthlyRevenue: number
  averageOrderValue: number
}

type SortField = 'title' | 'price' | 'stock_quantity' | 'created_at' | 'category'
type SortOrder = 'asc' | 'desc'

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])

  
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    outOfStockProducts: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0
  })

  // Add these state variables near your other state declarations:
const [showAddFeature, setShowAddFeature] = useState(false)
const [selectedProductForFeature, setSelectedProductForFeature] = useState<Product | null>(null)
const [featureForm, setFeatureForm] = useState({
  title: "",
  description: ""
})
const [isSubmittingFeature, setIsSubmittingFeature] = useState(false)
const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'rejecting'>('idle');
  const [verificationNotes, setVerificationNotes] = useState("")
const [showVerificationModal, setShowVerificationModal] = useState(false)
const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Modal states
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Product form state
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    original_price: "",
    category: "",
    subcategory: "",
    brand: "",
    stock_quantity: "",
    availability: "in_stock" as "in_stock" | "out_of_stock" | "pre_order",
    featured: false,
    published: true
  })
  const [productImages, setProductImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
// Add this function near your other API call functions:
const addProductFeature = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!selectedProductForFeature) return

  setIsSubmittingFeature(true)
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/products/${selectedProductForFeature.id}/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: featureForm.title,
        description: featureForm.description
      })
    })

    if (response.ok) {
      setShowAddFeature(false)
      setSelectedProductForFeature(null)
      setFeatureForm({ title: "", description: "" })
      // Show success message
      alert('Feature added successfully!')
    } else {
      const errorText = await response.text()
      alert('Failed to add feature: ' + errorText)
    }
  } catch (error) {
    console.error('Failed to add feature:', error)
    alert('Failed to add feature. Please try again.')
  } finally {
    setIsSubmittingFeature(false)
  }
}

  // Add these state variables
const [galleryImages, setGalleryImages] = useState<any[]>([])
const [uploadingGallery, setUploadingGallery] = useState(false)
const [newImageType, setNewImageType] = useState('angle')

// Add these functions
const fetchGalleryImages = async (productId: number) => {
  try {
    const response = await fetch(`/api/products/${productId}/gallery`)
    if (response.ok) {
      const data = await response.json()
      setGalleryImages(data.images || [])
    }
  } catch (error) {
    console.error('Error fetching gallery images:', error)
  }
}

const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (!files || files.length === 0 || !selectedProduct) return

  setUploadingGallery(true)
  const formData = new FormData()

  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i])
  }
  formData.append('imageType', newImageType)

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/products/${selectedProduct.id}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (response.ok) {
      await fetchGalleryImages(selectedProduct.id)
      event.target.value = ''
    }
  } catch (error) {
    console.error('Error uploading gallery images:', error)
  } finally {
    setUploadingGallery(false)
  }
}

const deleteGalleryImage = async (imageId: number) => {
  if (!selectedProduct) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/products/${selectedProduct.id}/gallery/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      setGalleryImages(prev => prev.filter(img => img.id !== imageId))
    }
  } catch (error) {
    console.error('Error deleting gallery image:', error)
  }
}

const updateGalleryImageType = async (imageId: number, newType: string) => {
  if (!selectedProduct) return

  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/products/${selectedProduct.id}/gallery/${imageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image_type: newType })
    })

    if (response.ok) {
      setGalleryImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, image_type: newType } : img
      ))
    }
  } catch (error) {
    console.error('Error updating image type:', error)
  }
}

// FIXED: Enhanced openEditProduct function with production-safe state updates
const openEditProduct = (product: Product) => {
  console.log('🔄 openEditProduct called with:', product.id, product.title)
  
  // Use setTimeout to ensure state updates happen in the next tick (production fix)
  setTimeout(() => {
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      category: product.category,
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      stock_quantity: product.stock_quantity.toString(),
      availability: product.availability,
      featured: product.featured,
      published: product.published
    })
    setSelectedProduct(product)
    setShowEditProduct(true)
    console.log('✅ Modal state updated, showEditProduct should be true')
    
    // Fetch gallery images when opening edit modal
    fetchGalleryImages(product.id)
  }, 10)
}
  
// FIXED: Enhanced openProductDetail function with production-safe state updates
const openProductDetail = (product: Product) => {
  console.log('👁️ openProductDetail called with:', product.id, product.title)
  
  // Use setTimeout to ensure state updates happen in the next tick (production fix)
  setTimeout(() => {
    setSelectedProduct(product)
    setShowProductDetail(true)
    console.log('✅ Modal state updated, showProductDetail should be true')
  }, 10)
}

// FIXED: Enhanced dropdown handlers to prevent event issues
const handleEditClick = (product: Product, e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('✏️ Edit button clicked for:', product.title)
  openEditProduct(product)
}

const handleViewClick = (product: Product, e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('👁️ View button clicked for:', product.title)
  openProductDetail(product)
}

const handleAddFeatureClick = (product: Product, e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('➕ Add Feature button clicked for:', product.title)
  setSelectedProductForFeature(product)
  setFeatureForm({ title: "", description: "" })
  setShowAddFeature(true)
}

const handleDeleteClick = (productId: number, e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('🗑️ Delete button clicked for product:', productId)
  deleteProduct(productId)
}
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch dashboard data only if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      const [productsRes, usersRes, ordersRes, statsRes] = await Promise.all([
        fetch('/api/admin/products', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/orders', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/stats', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        calculateLocalStats()
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      calculateLocalStats()
    } finally {
      setIsLoading(false)
    }
  }

const verifyPayment = async (orderId: number, verified: boolean, notes?: string) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        verified,
        notes 
      })
    })
    
    if (response.ok) {
      // Show success message
      alert(`Payment ${verified ? 'verified' : 'rejected'} successfully!`);
      fetchDashboardData()
      setShowVerificationModal(false)
      setSelectedOrderForVerification(null)
      setVerificationNotes("")
      setVerificationStatus('idle')
    } else {
      const errorData = await response.json();
      alert(`Failed to ${verified ? 'verify' : 'reject'} payment: ${errorData.error || 'Unknown error'}`);
      setVerificationStatus('idle')
    }
  } catch (error) {
    console.error('Failed to verify payment:', error)
    alert(`Failed to ${verified ? 'verify' : 'reject'} payment. Please try again.`);
    setVerificationStatus('idle')
  }
}

const openVerificationModal = (order: Order) => {
  setSelectedOrderForVerification(order)
  setVerificationNotes(order.admin_notes || "")
  setShowVerificationModal(true)
}

  const calculateLocalStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const outOfStockProducts = products.filter(product => product.stock_quantity === 0).length
    const monthlyRevenue = totalRevenue * 0.3 // Simulate monthly revenue
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    setStats({
      totalRevenue,
      totalProducts: products.length,
      totalUsers: users.length,
      totalOrders: orders.length,
      pendingOrders,
      outOfStockProducts,
      monthlyRevenue,
      averageOrderValue
    })
  }

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'price' || sortField === 'stock_quantity') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Get unique categories for filter
  const categories = [...new Set(products.map(product => product.category))]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const resetProductForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: "",
      original_price: "",
      category: "",
      subcategory: "",
      brand: "",
      stock_quantity: "",
      availability: "in_stock",
      featured: false,
      published: true
    })
    setProductImages([])
  }

  const openAddProduct = () => {
    resetProductForm()
    setShowAddProduct(true)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const productData = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category: productForm.category,
        subcategory: productForm.subcategory || null,
        brand: productForm.brand || null,
        stock_quantity: parseInt(productForm.stock_quantity),
        availability: productForm.availability,
        featured: productForm.featured,
        published: productForm.published,
        images: []
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        const result = await response.json()
        
        if (productImages.length > 0 && result.productId) {
          await uploadProductImages(result.productId, productImages)
        }

        setShowAddProduct(false)
        resetProductForm()
        fetchDashboardData()
      } else {
        const errorText = await response.text()
        alert('Failed to add product: ' + errorText)
      }
    } catch (error) {
      console.error('Failed to add product:', error)
      alert('Failed to add product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const productData = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        category: productForm.category,
        subcategory: productForm.subcategory || null,
        brand: productForm.brand || null,
        stock_quantity: parseInt(productForm.stock_quantity),
        availability: productForm.availability,
        featured: productForm.featured,
        published: productForm.published
      }

      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        if (productImages.length > 0) {
          await uploadProductImages(selectedProduct.id, productImages)
        }

        setShowEditProduct(false)
        setSelectedProduct(null)
        resetProductForm()
        fetchDashboardData()
      } else {
        const errorText = await response.text()
        alert('Failed to update product: ' + errorText)
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadProductImages = async (productId: number, images: File[]) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      images.forEach(image => {
        formData.append('images', image)
      })

      await fetch(`/api/admin/products/${productId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
    } catch (error) {
      console.error('Failed to upload images:', error)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setProductImages(Array.from(files))
    }
  }

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        fetchDashboardData()
      } else {
        console.error('Failed to update order:', await response.text())
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const updateProductStatus = async (productId: number, field: string, value: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      })
      
      if (response.ok) {
        fetchDashboardData()
      } else {
        console.error('Failed to update product:', await response.text())
      }
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const deleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        fetchDashboardData()
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null)
          setShowProductDetail(false)
        }
      } else {
        console.error('Failed to delete product:', await response.text())
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const updateUserRole = async (userId: number, role: 'customer' | 'admin') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      })
      
      if (response.ok) {
        fetchDashboardData()
      } else {
        console.error('Failed to update user:', await response.text())
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
      case 'in_stock':
        return 'default'
      case 'pending':
      case 'processing':
      case 'pre_order':
        return 'secondary'
      case 'cancelled':
      case 'failed':
      case 'out_of_stock':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStockLevelColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600'
    if (quantity < 10) return 'text-orange-600'
    return 'text-green-600'
  }

  const getStockLevelBg = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800'
    if (quantity < 10) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Show loading while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not admin, don't render anything (will redirect)
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <img src="../logow.jpg" alt="DevVoltz" className="w-8 h-8 rounded-lg object-cover" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  DevVoltz
                </span>
                <span className="text-sm text-muted-foreground ml-2">Admin</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="border-2 hover:border-primary hover:bg-primary/5 transition-all"
              >
                Back to Store
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                ${stats.monthlyRevenue.toLocaleString()} this month
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-emerald-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Products</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.outOfStockProducts} out of stock
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Customers</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <div className="text-xs text-slate-500 mt-1">Registered users</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Orders</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalOrders}</div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.pendingOrders} pending
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full md:w-auto grid-cols-4 bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Users
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="border-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </div>
                  <CardDescription>Latest customer orders requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-slate-100'
                          }`}>
                            {order.status === 'delivered' ? <CheckCircle className="h-4 w-4" /> :
                             order.status === 'cancelled' ? <XCircle className="h-4 w-4" /> :
                             <AlertCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.user?.email || 'Guest'} • ${order.total_amount}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(order.status)} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Stock Alerts</CardTitle>
                    <Badge variant="destructive" className="text-xs">
                      {products.filter(p => p.stock_quantity < 10).length} Alerts
                    </Badge>
                  </div>
                  <CardDescription>Products that need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products
                      .filter(product => product.stock_quantity < 10)
                      .slice(0, 5)
                      .map((product) => (
                        <div 
                          key={product.id} 
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => openProductDetail(product)}
                        >
                          <div className="flex items-center space-x-3">
                            {product.images && product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-10 h-10 rounded-lg object-cover border"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={product.stock_quantity === 0 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} left`}
                          </Badge>
                        </div>
                      ))}
                    {products.filter(product => product.stock_quantity < 10).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>All products have sufficient stock</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Enhanced Product Toolbar */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search products..." 
                        className="pl-10 border-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40 border-2">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={openAddProduct} className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <div className="flex gap-2 flex-wrap">
                    {(['title', 'price', 'stock_quantity', 'created_at'] as const).map((field) => (
                      <Button
                        key={field}
                        variant={sortField === field ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSort(field)}
                        className="border-2 text-xs"
                      >
                        {field === 'created_at' ? 'Date' : field.replace('_', ' ')}
                        {sortField === field && (
                          sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Products Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your product catalog • {filteredAndSortedProducts.length} products found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold text-right">Price</TableHead>
                        <TableHead className="font-semibold text-right">Stock</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Featured</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell>
                            <div 
                              className="flex items-center space-x-3 cursor-pointer group"
                              onClick={() => openProductDetail(product)}
                            >
                              {product.images && product.images[0] && (
                                <div className="relative">
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-12 h-12 rounded-lg object-cover border group-hover:scale-105 transition-transform"
                                  />
                                  {product.featured && (
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 absolute -top-1 -right-1" />
                                  )}
                                </div>
                              )}
                              <div>
                                <div className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                  {product.title}
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span>{product.category}</span>
                              {product.brand && (
                                <Badge variant="outline" className="text-xs">
                                  {product.brand}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">${product.price}</div>
                            {product.original_price && product.original_price > product.price && (
                              <div className="text-xs text-muted-foreground line-through">
                                ${product.original_price}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="outline" 
                              className={getStockLevelBg(product.stock_quantity)}
                            >
                              {product.stock_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(product.availability)}>
                              {product.availability.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={product.featured ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateProductStatus(product.id, 'featured', !product.featured)}
                              className="w-20 border-2"
                            >
                              {product.featured ? "Yes" : "No"}
                            </Button>
                          </TableCell>
                          {/* FIXED: Enhanced Actions Dropdown with production-safe handlers */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="border-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={(e) => handleViewClick(product, e)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => handleEditClick(product, e)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => handleAddFeatureClick(product, e)}
                                  className="cursor-pointer"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Feature
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                  onClick={(e) => handleDeleteClick(product.id, e)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Product
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      <Button 
                        onClick={openAddProduct} 
                        className="mt-4 bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Process and manage customer orders • {orders.length} total orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-semibold">Order ID</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="font-semibold">Payment Method</TableHead>
                        <TableHead className="font-semibold">Payment Proof</TableHead>
                        <TableHead className="font-semibold">Verified</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Payment</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.name || 'Guest'}</div>
                              <div className="text-xs text-muted-foreground">{order.customer_email || 'No email'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">${order.total_amount}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {order.payment_method?.replace('_', ' ') || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.payment_verification_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => window.open(order.payment_verification_url!, '_blank')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Proof
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No Proof
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {order.payment_verified ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-yellow-100"
                                onClick={() => openVerificationModal(order)}>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Verify
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32 border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(order.payment_status)}>
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="border-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {!order.payment_verified && order.payment_verification_url && (
                                  <DropdownMenuItem onClick={() => openVerificationModal(order)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify Payment
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {orders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No orders yet</p>
                      <p className="text-sm mt-1">Orders will appear here when customers make purchases</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage customer accounts and permissions • {users.length} registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50/30 transition-colors">
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value: 'customer' | 'admin') => updateUserRole(user.id, value)}
                            >
                              <SelectTrigger className="w-28 border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                              {user.email_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="border-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Block User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-sm mt-1">User accounts will appear here when they register</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail Modal */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedProduct?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Images */}
              <div>
                {selectedProduct.images && selectedProduct.images[0] && (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.title}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg border"
                  />
                )}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {selectedProduct.images?.slice(0, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedProduct.title} ${index + 1}`}
                      className="w-full h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedProduct.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <p className="text-xl font-bold">${selectedProduct.price}</p>
                    {selectedProduct.original_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        ${selectedProduct.original_price}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <p className={`text-xl font-bold ${getStockLevelColor(selectedProduct.stock_quantity)}`}>
                      {selectedProduct.stock_quantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <p>{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <p>{selectedProduct.brand || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Availability</Label>
                    <Badge variant={getStatusVariant(selectedProduct.availability)}>
                      {selectedProduct.availability.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Featured</Label>
                    <Badge variant={selectedProduct.featured ? "default" : "secondary"}>
                      {selectedProduct.featured ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => openEditProduct(selectedProduct)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteProduct(selectedProduct.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Review payment proof and verify the payment for order {selectedOrderForVerification?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderForVerification && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
                <div>
                  <Label className="text-sm font-medium">Order Number</Label>
                  <p className="font-semibold">{selectedOrderForVerification.order_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="font-semibold">${selectedOrderForVerification.total_amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="font-semibold capitalize">{selectedOrderForVerification.payment_method?.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="font-semibold">{selectedOrderForVerification.customer_email}</p>
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Payment Proof</Label>
                {selectedOrderForVerification.payment_verification_url ? (
                  <div className="border rounded-lg p-4">
                    {selectedOrderForVerification.payment_method === 'telebirr' ? (
                      <div className="space-y-4">
                        <div className="max-h-80 overflow-y-auto rounded-lg border bg-slate-50/50">
                          <img 
                            src={selectedOrderForVerification.payment_verification_url} 
                            alt="Payment Screenshot" 
                            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105 cursor-zoom-in"
                            onClick={() => window.open(selectedOrderForVerification.payment_verification_url!, '_blank')}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(selectedOrderForVerification.payment_verification_url!, '_blank')}
                            className="flex-1 transition-all duration-200 hover:scale-105"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Open Full Image
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const img = new Image();
                              img.src = selectedOrderForVerification.payment_verification_url!;
                              img.onload = () => {
                                window.open(selectedOrderForVerification.payment_verification_url!, '_blank');
                              };
                            }}
                            className="flex-1 transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View in New Tab
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50/50 rounded-lg border">
                          <p className="text-sm font-medium mb-2">Bank Transfer Receipt URL:</p>
                          <div className="max-h-20 overflow-y-auto p-2 bg-white rounded border">
                            <a 
                              href={selectedOrderForVerification.payment_verification_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all transition-colors duration-200 hover:text-blue-700"
                            >
                              {selectedOrderForVerification.payment_verification_url}
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(selectedOrderForVerification.payment_verification_url!, '_blank')}
                            className="flex-1 transition-all duration-200 hover:scale-105"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Receipt
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrderForVerification.payment_verification_url!);
                              alert('URL copied to clipboard!');
                            }}
                            className="flex-1 transition-all duration-200 hover:scale-105"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-lg p-6 text-center text-muted-foreground bg-slate-50/50 transition-all duration-300 hover:bg-slate-100/50">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-400 transition-transform duration-300 hover:scale-110" />
                    <p className="text-lg font-medium">No payment proof provided</p>
                    <p className="text-sm mt-1">Customer did not upload any payment verification</p>
                  </div>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <Label htmlFor="verificationNotes" className="text-sm font-medium mb-2 block">
                  Verification Notes
                </Label>
                <Textarea
                  id="verificationNotes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about this payment verification..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  These notes will be saved with the order record
                </p>
              </div>

              {/* Additional Order Details */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50/50">
                <div>
                  <Label className="text-sm font-medium">Order Status</Label>
                  <p className="font-semibold capitalize">{selectedOrderForVerification.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <p className="font-semibold capitalize">{selectedOrderForVerification.payment_status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="font-semibold">
                    {new Date(selectedOrderForVerification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <p className="font-semibold">
                    {selectedOrderForVerification.payment_verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Pending Verification
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Fixed at bottom */}
          <DialogFooter className="flex gap-3 pt-4 border-t mt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowVerificationModal(false)
                setSelectedOrderForVerification(null)
                setVerificationNotes("")
              }}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!selectedOrderForVerification) return;
                setVerificationStatus('rejecting');
                verifyPayment(selectedOrderForVerification.id, false, verificationNotes);
              }}
              disabled={verificationStatus === 'verifying' || verificationStatus === 'rejecting'}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              {verificationStatus === 'rejecting' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
              onClick={() => {
                if (!selectedOrderForVerification) return;
                setVerificationStatus('verifying');
                verifyPayment(selectedOrderForVerification.id, true, verificationNotes);
              }}
              disabled={verificationStatus === 'verifying' || verificationStatus === 'rejecting'}
            >
              {verificationStatus === 'verifying' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product for your store
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm
            formData={productForm}
            onFormChange={setProductForm}
            productImages={productImages}
            onImageUpload={handleImageUpload}
            onSubmit={handleAddProduct}
            isSubmitting={isSubmitting}
            mode="add"
          />
        </DialogContent>
      </Dialog>

      {/* Add Feature Modal */}
      <Dialog open={showAddFeature} onOpenChange={setShowAddFeature}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#0088CC]" />
              Add Product Feature
            </DialogTitle>
            <DialogDescription>
              Add a new feature for {selectedProductForFeature?.title}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={addProductFeature} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featureTitle" className="text-sm font-medium">
                Feature Title *
              </Label>
              <Input
                id="featureTitle"
                placeholder="e.g., Free Warranty, Hand-made, Fast Charging"
                value={featureForm.title}
                onChange={(e) => setFeatureForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Short, descriptive title for the feature
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featureDescription" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="featureDescription"
                placeholder="Detailed description of this feature..."
                value={featureForm.description}
                onChange={(e) => setFeatureForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Additional details about this feature
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Preview:</span>
              </div>
              <div className="mt-2 p-2 bg-white rounded border">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-[#0088CC] rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{featureForm.title || "Feature Title"}</p>
                    {featureForm.description && (
                      <p className="text-slate-600 text-xs mt-1">{featureForm.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddFeature(false)
                  setSelectedProductForFeature(null)
                  setFeatureForm({ title: "", description: "" })
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-[#0088CC] hover:bg-[#0088CC]/90"
                disabled={!featureForm.title.trim() || isSubmittingFeature}
              >
                {isSubmittingFeature ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal with Image Gallery */}
      <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and manage images for {selectedProduct?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image Gallery Management */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#0088CC]" />
                    Product Images & Gallery
                  </h3>
                  
                  {/* Current Main Images */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Current Main Images</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.images?.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`${selectedProduct.title} - Image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <Badge className="absolute top-1 left-1 bg-black/70 text-white text-xs border-0">
                            Main {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery Management Section */}
                  <Card className="border-2 border-dashed border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-[#0088CC]" />
                            Additional Gallery Images
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Add different angles, colors, and lifestyle shots
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Select value={newImageType} onValueChange={(value: string) => setNewImageType(value)}>
                            <SelectTrigger className="w-32 border-[#0088CC]">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="angle">Angle View</SelectItem>
                              <SelectItem value="color">Color Variant</SelectItem>
                              <SelectItem value="lifestyle">Lifestyle</SelectItem>
                              <SelectItem value="detail">Close-up</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="relative">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleGalleryImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              disabled={uploadingGallery}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={uploadingGallery}
                              className="border-[#0088CC] text-[#0088CC] hover:bg-[#0088CC] hover:text-white"
                            >
                              {uploadingGallery ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Add to Gallery
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Images Grid */}
                      {galleryImages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No gallery images yet</p>
                          <p className="text-xs mt-1">Add images showing different angles and details</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {galleryImages.map((galleryImage) => (
                            <div key={galleryImage.id} className="relative group">
                              <img
                                src={galleryImage.image_url}
                                alt={galleryImage.alt_text}
                                className="w-full h-20 object-cover rounded-lg border"
                              />
                              <Badge 
                                variant="secondary" 
                                className="absolute top-1 left-1 text-xs bg-black/70 text-white border-0"
                              >
                                {galleryImage.image_type}
                              </Badge>
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <Select 
                                  value={galleryImage.image_type} 
                                  onValueChange={(value: string) => updateGalleryImageType(galleryImage.id, value)}
                                >
                                  <SelectTrigger className="h-6 w-20 text-xs border-white/30 bg-black/80 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="angle">Angle</SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                    <SelectItem value="detail">Detail</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteGalleryImage(galleryImage.id)}
                                  className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Gallery Statistics */}
                      {galleryImages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Gallery Summary:</span>
                            <div className="flex gap-4">
                              <span>Total: {galleryImages.length} images</span>
                              <span>Angles: {galleryImages.filter(img => img.image_type === 'angle').length}</span>
                              <span>Colors: {galleryImages.filter(img => img.image_type === 'color').length}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Product Form */}
              <div className="space-y-6">
                <ProductForm
                  formData={productForm}
                  onFormChange={setProductForm}
                  productImages={productImages}
                  onImageUpload={handleImageUpload}
                  onSubmit={handleEditProduct}
                  isSubmitting={isSubmitting}
                  mode="edit"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product Form Component
interface ProductFormProps {
  formData: any
  onFormChange: (data: any) => void
  productImages: File[]
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  mode: 'add' | 'edit'
}

function ProductForm({ 
  formData, 
  onFormChange, 
  productImages, 
  onImageUpload, 
  onSubmit, 
  isSubmitting, 
  mode 
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Product Images */}
      <div>
        <Label htmlFor="images" className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-4 w-4" />
          Product Images
        </Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <Label
            htmlFor="images"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload product images
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 10MB
            </span>
          </Label>
          {productImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {productImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Title */}
      <div>
        <Label htmlFor="title">Product Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
          placeholder="Enter product title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          rows={4}
          required
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => onFormChange({ ...formData, price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="original_price">Original Price ($)</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) => onFormChange({ ...formData, original_price: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Category and Brand */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
            placeholder="e.g., Electronics"
            required
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => onFormChange({ ...formData, brand: e.target.value })}
            placeholder="e.g., Apple"
          />
        </div>
      </div>

      {/* Stock and Availability */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock_quantity">Stock Quantity *</Label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => onFormChange({ ...formData, stock_quantity: e.target.value })}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select
            value={formData.availability}
            onValueChange={(value: "in_stock" | "out_of_stock" | "pre_order") => 
              onFormChange({ ...formData, availability: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="pre_order">Pre-order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured and Published */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Input
            id="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => onFormChange({ ...formData, featured: e.target.checked })}
            className="w-4 h-4"
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            id="published"
            type="checkbox"
            checked={formData.published}
            onChange={(e) => onFormChange({ ...formData, published: e.target.checked })}
            className="w-4 h-4"
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      {/* Action Buttons */}
      <DialogFooter className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'add' ? 'Adding...' : 'Updating...'}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {mode === 'add' ? 'Add Product' : 'Update Product'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}