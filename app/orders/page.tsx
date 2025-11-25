"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Truck,
  Package,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

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
  user?: {
    id: number
    name: string
    email: string
    role: string
  }
  items?: OrderItem[]
}

interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product?: {
    id: number
    title: string
    images: string[]
    category: string
  }
}

type SortField = 'order_number' | 'total_amount' | 'created_at' | 'status'
type SortOrder = 'asc' | 'desc'

export default function OrdersPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/auth/login')
    }
  }, [currentUser, authLoading, router])

  // Fetch orders based on user role
  useEffect(() => {
    if (currentUser) {
      fetchOrders()
    }
  }, [currentUser])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      
      let url = '/api/orders'
      if (currentUser?.role !== 'admin') {
        url = '/api/orders/my-orders'
      }

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const ordersData = await response.json()
        const ordersArray = Array.isArray(ordersData) ? ordersData : 
                           ordersData.orders ? ordersData.orders : 
                           ordersData.data ? ordersData.data : []
        setOrders(ordersArray)
      } else {
        console.error('Failed to fetch orders:', response.status)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        fetchOrders()
        setShowOrderDetail(false)
      } else {
        console.error('Failed to update order:', await response.text())
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'default'
      case 'pending':
      case 'processing':
      case 'confirmed':
        return 'secondary'
      case 'cancelled':
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'shipped':
        return <Truck className="h-3 w-3 mr-1" />
      case 'processing':
        return <Package className="h-3 w-3 mr-1" />
      case 'cancelled':
        return <XCircle className="h-3 w-3 mr-1" />
      default:
        return <AlertCircle className="h-3 w-3 mr-1" />
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
      case 'refunded':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Filter orders based on active tab
  const getFilteredOrdersByTab = () => {
    if (activeTab === "all") return orders
    return orders.filter(order => order.status === activeTab)
  }

  // Filter and sort orders
  const filteredAndSortedOrders = getFilteredOrdersByTab()
    .filter(order => {
      const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter
      
      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'total_amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

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
            <p className="text-lg font-semibold text-slate-800">Loading Orders</p>
            <p className="text-sm text-slate-600">Fetching your order information...</p>
          </div>
        </div>
      </div>
    )
  }

  // If not logged in, don't render anything (will redirect)
  if (!currentUser) {
    return null
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
          {/* Back Button */}
<div className="container mx-auto px-4 pt-6">
  <Button
    variant="outline"
    onClick={() => router.push('https://voltmarket.devvoltz.com/')}
    className="border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-700 mb-4"
  >
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to Store
  </Button>
</div>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  My Orders
                </span>
                <span className="text-sm text-slate-600 ml-2">
                  {currentUser.role === 'admin' ? 'All Orders' : 'Your Orders'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-600 capitalize">{currentUser?.role}</p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={fetchOrders}
                className="border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-200"
              >
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Processing</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {orders.filter(o => o.status === 'processing').length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-slate-800">Order Management</CardTitle>
                <CardDescription className="text-slate-600">
                  {currentUser.role === 'admin' 
                    ? `Manage all customer orders • ${filteredAndSortedOrders.length} orders found`
                    : `Your order history • ${filteredAndSortedOrders.length} orders found`
                  }
                </CardDescription>
              </div>
              
              {/* Status Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 lg:mt-0">
                <TabsList className="bg-slate-100 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Processing
                  </TabsTrigger>
                  <TabsTrigger value="shipped" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">
                    Shipped
                  </TabsTrigger>
                  <TabsTrigger value="delivered" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    Delivered
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by order number, customer name or email..." 
                    className="pl-10 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                      <Filter className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-32 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                      <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="text-sm text-slate-600">Sort by:</span>
              <div className="flex gap-2 flex-wrap">
                {(['order_number', 'total_amount', 'created_at', 'status'] as const).map((field) => (
                  <Button
                    key={field}
                    variant={sortField === field ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort(field)}
                    className={`border-2 text-xs ${
                      sortField === field 
                        ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {field === 'created_at' ? 'Date' : field.replace('_', ' ')}
                    {sortField === field && (
                      sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
                      {currentUser.role === 'admin' && (
                        <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                      )}
                      <TableHead className="font-semibold text-slate-700 text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Payment Method</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden lg:table-cell">Payment Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Order Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden lg:table-cell">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                        <TableCell className="font-medium text-slate-800">{order.order_number}</TableCell>
                        
                        {currentUser.role === 'admin' && (
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-800">{order.user?.name || 'Guest'}</div>
                              <div className="text-xs text-slate-600">{order.user?.email || 'No email'}</div>
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell className="text-right font-medium text-slate-800">${order.total_amount}</TableCell>
                        
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-xs capitalize border-slate-200 text-slate-700">
                            {order.payment_method?.replace('_', ' ') || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant={getPaymentStatusVariant(order.payment_status)} className="text-xs">
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)} className="text-xs flex items-center w-fit">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm text-slate-800">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-600">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="border-2 border-slate-200 hover:bg-blue-50 hover:border-blue-200">
                                <MoreHorizontal className="h-4 w-4 text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 border border-slate-200 shadow-lg">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowOrderDetail(true)
                                }}
                                className="text-slate-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                View Details
                              </DropdownMenuItem>
                              
                              {currentUser.role === 'admin' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="text-slate-700 hover:bg-blue-50"
                                  >
                                    <Package className="h-4 w-4 mr-2 text-blue-600" />
                                    Mark Processing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                    className="text-slate-700 hover:bg-blue-50"
                                  >
                                    <Truck className="h-4 w-4 mr-2 text-blue-600" />
                                    Mark Shipped
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="text-slate-700 hover:bg-blue-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                    Mark Delivered
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {order.payment_verification_url && (
                                <DropdownMenuItem 
                                  onClick={() => window.open(order.payment_verification_url!, '_blank')}
                                  className="text-slate-700 hover:bg-blue-50"
                                >
                                  <Download className="h-4 w-4 mr-2 text-blue-600" />
                                  View Payment Proof
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredAndSortedOrders.length === 0 && (
                <div className="text-center py-16 text-slate-600 bg-slate-50/50">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-700">No orders found</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : currentUser.role === 'admin' 
                        ? 'Orders will appear here when customers make purchases'
                        : 'You haven\'t placed any orders yet'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
                    <Button 
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPaymentFilter("all")
                      }}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl">
          <DialogHeader className="bg-slate-50 border-b border-slate-200 p-6">
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Order Details - {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 p-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                      <User className="h-5 w-5 text-blue-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Customer Name</label>
                      <p className="font-medium text-slate-800">{selectedOrder.user?.name || 'Guest'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="font-medium text-slate-800">{selectedOrder.user?.email || 'No email'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Order Date</label>
                      <p className="font-medium text-slate-800">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Payment & Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-6">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-600">Total Amount</label>
                      <p className="text-xl font-bold text-emerald-600">${selectedOrder.total_amount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-600">Payment Method</label>
                      <Badge variant="outline" className="capitalize border-slate-200 text-slate-700">
                        {selectedOrder.payment_method?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-600">Payment Status</label>
                      <Badge variant={getPaymentStatusVariant(selectedOrder.payment_status)}>
                        {selectedOrder.payment_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-600">Order Status</label>
                      <Badge variant={getStatusVariant(selectedOrder.status)} className="flex items-center">
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedOrder.shipping_address).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-sm font-medium text-slate-600 capitalize">
                            {key.replace('_', ' ')}
                          </label>
                          <p className="font-medium text-slate-800">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions */}
              {currentUser.role === 'admin' && (
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <CardTitle className="text-lg text-slate-800">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                        disabled={selectedOrder.status === 'processing'}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Mark Processing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                        disabled={selectedOrder.status === 'shipped'}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Mark Shipped
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                        disabled={selectedOrder.status === 'delivered'}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Delivered
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}