"use client"

import { useState } from "react"
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

// Mock orders data
const orders = [
  {
    id: "ORD-12345678",
    date: "2024-01-15",
    status: "delivered",
    total: 299.99,
    items: [{ name: "iPhone 15 Pro Max", quantity: 1, price: 299.99 }],
    shippingAddress: "123 Main St, San Francisco, CA 94102",
    trackingNumber: "1Z999AA1234567890",
  },
  {
    id: "ORD-12345679",
    date: "2024-01-10",
    status: "shipped",
    total: 149.99,
    items: [{ name: "AirPods Pro (2nd Gen)", quantity: 1, price: 149.99 }],
    shippingAddress: "123 Main St, San Francisco, CA 94102",
    trackingNumber: "1Z999AA1234567891",
  },
  {
    id: "ORD-12345680",
    date: "2024-01-05",
    status: "processing",
    total: 89.99,
    items: [{ name: "Premium Cotton T-Shirt", quantity: 2, price: 44.99 }],
    shippingAddress: "123 Main St, San Francisco, CA 94102",
    trackingNumber: null,
  },
]

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => statusFilter === "all" || order.status === statusFilter)

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
            <DashboardSidebar />
          </div>
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Order History</h1>
                  <p className="text-muted-foreground">Track and manage your orders</p>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
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

              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status)
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg">{order.id}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Ordered on {order.date}</p>
                            {order.trackingNumber && (
                              <p className="text-sm">
                                <span className="font-medium">Tracking:</span> {order.trackingNumber}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Items ({order.items.length})</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Shipping to:</span> {order.shippingAddress}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {filteredOrders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {statusFilter === "all"
                        ? "You haven't placed any orders yet."
                        : `No ${statusFilter} orders found.`}
                    </p>
                    <Link href="/products">
                      <Button>Start Shopping</Button>
                    </Link>
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
