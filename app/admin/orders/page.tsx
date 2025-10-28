"use client"

import { useState } from "react"
import { Search, Eye, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock orders data
const orders = [
  {
    id: "ORD-12345678",
    customer: "John Doe",
    email: "john@example.com",
    date: "2024-01-15",
    status: "processing",
    total: 299.99,
    items: 3,
    shippingAddress: "123 Main St, San Francisco, CA 94102",
  },
  {
    id: "ORD-12345679",
    customer: "Jane Smith",
    email: "jane@example.com",
    date: "2024-01-14",
    status: "shipped",
    total: 149.99,
    items: 2,
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
  },
  {
    id: "ORD-12345680",
    customer: "Bob Johnson",
    email: "bob@example.com",
    date: "2024-01-13",
    status: "delivered",
    total: 89.99,
    items: 1,
    shippingAddress: "789 Pine St, Seattle, WA 98101",
  },
  {
    id: "ORD-12345681",
    customer: "Alice Brown",
    email: "alice@example.com",
    date: "2024-01-12",
    status: "processing",
    total: 199.99,
    items: 2,
    shippingAddress: "321 Elm St, Portland, OR 97201",
  },
]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return CheckCircle
      case "shipped":
        return Truck
      case "processing":
        return Clock
      default:
        return Package
    }
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
              <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground">Track and manage customer orders</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders, customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orders Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">Order ID</th>
                          <th className="text-left p-4 font-medium">Customer</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Items</th>
                          <th className="text-left p-4 font-medium">Total</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.status)
                          return (
                            <tr key={order.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <p className="font-medium">{order.id}</p>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{order.customer}</p>
                                  <p className="text-sm text-muted-foreground">{order.email}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-sm">{order.date}</p>
                              </td>
                              <td className="p-4">
                                <Badge className={getStatusColor(order.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <p className="font-medium">{order.items}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-medium">{formatPrice(order.total)}</p>
                              </td>
                              <td className="p-4">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {filteredOrders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No orders have been placed yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
