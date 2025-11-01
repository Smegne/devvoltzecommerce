"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, MoreHorizontal, RefreshCw } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

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

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch products data only if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        return
      }

      const response = await fetch('/api/admin/products', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      } else {
        const errorText = await response.text()
        setError(`Failed to load products: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError('Failed to load products. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const categories = [...new Set(products.map(product => product.category))]

  const openProductDetail = (product: Product) => {
    window.open(`/product/${product.id}`, '_blank')
  }

  const openEditProduct = (product: Product) => {
    router.push(`/admin/dashboard`)
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
        fetchProducts() // Refresh the list
      } else {
        const errorText = await response.text()
        alert(`Failed to delete product: ${errorText}`)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('Failed to delete product. Please try again.')
    }
  }

  const getStatusVariant = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return 'default'
      case 'pre_order':
        return 'secondary'
      case 'out_of_stock':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AdminSidebar />
            </div>
            <div className="lg:col-span-3">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking authorization...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If not admin, don't render anything (will redirect)
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Product Management</h1>
                  <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchProducts} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={() => router.push('/admin/dashboard')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-red-700">{error}</p>
                      <Button variant="outline" size="sm" onClick={fetchProducts}>
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products Table */}
              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading products...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">Product</th>
                            <th className="text-left p-4 font-medium">Category</th>
                            <th className="text-left p-4 font-medium">Price</th>
                            <th className="text-left p-4 font-medium">Stock</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  {product.images && product.images[0] && (
                                    <img
                                      src={product.images[0]}
                                      alt={product.title}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{product.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="secondary">{product.category}</Badge>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{formatPrice(product.price)}</p>
                                  {product.original_price && (
                                    <p className="text-sm text-muted-foreground line-through">
                                      {formatPrice(product.original_price)}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{product.stock_quantity}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant={getStatusVariant(product.availability)}>
                                  {product.availability.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => openProductDetail(product)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditProduct(product)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => deleteProduct(product.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Product
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredProducts.length === 0 && !isLoading && (
                        <div className="p-12 text-center">
                          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No products found</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery || categoryFilter !== "all"
                              ? "Try adjusting your search or filter criteria."
                              : "Get started by adding your first product."}
                          </p>
                          <Button onClick={() => router.push('/admin/dashboard')}>
                            Add Product
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}