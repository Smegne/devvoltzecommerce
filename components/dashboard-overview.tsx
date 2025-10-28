"use client"

import { Package, Truck, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock order data
const recentOrders = [
  {
    id: "ORD-12345678",
    date: "2024-01-15",
    status: "delivered",
    total: 299.99,
    items: 3,
  },
  {
    id: "ORD-12345679",
    date: "2024-01-10",
    status: "shipped",
    total: 149.99,
    items: 2,
  },
  {
    id: "ORD-12345680",
    date: "2024-01-05",
    status: "processing",
    total: 89.99,
    items: 1,
  },
]

const stats = [
  {
    title: "Total Orders",
    value: "12",
    icon: Package,
    color: "text-blue-600",
  },
  {
    title: "In Transit",
    value: "2",
    icon: Truck,
    color: "text-orange-600",
  },
  {
    title: "Delivered",
    value: "8",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Processing",
    value: "2",
    icon: Clock,
    color: "text-yellow-600",
  },
]

export function DashboardOverview() {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your account.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="bg-transparent">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <p className="font-medium">{order.id}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items} item{order.items > 1 ? "s" : ""} • {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/products">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <span>Browse Products</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/addresses">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <span>Manage Addresses</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <span>Account Settings</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
