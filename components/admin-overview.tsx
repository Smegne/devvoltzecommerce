"use client"

import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock analytics data
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    title: "Total Products",
    value: "567",
    change: "+3.1%",
    trend: "up",
    icon: Package,
    color: "text-purple-600",
  },
  {
    title: "Total Users",
    value: "8,945",
    change: "-2.4%",
    trend: "down",
    icon: Users,
    color: "text-orange-600",
  },
]

const recentOrders = [
  {
    id: "ORD-12345678",
    customer: "John Doe",
    email: "john@example.com",
    total: 299.99,
    status: "processing",
    date: "2024-01-15",
  },
  {
    id: "ORD-12345679",
    customer: "Jane Smith",
    email: "jane@example.com",
    total: 149.99,
    status: "shipped",
    date: "2024-01-15",
  },
  {
    id: "ORD-12345680",
    customer: "Bob Johnson",
    email: "bob@example.com",
    total: 89.99,
    status: "delivered",
    date: "2024-01-14",
  },
]

const topProducts = [
  { name: "iPhone 15 Pro Max", sales: 156, revenue: 186840 },
  { name: 'MacBook Pro 16"', sales: 89, revenue: 222411 },
  { name: "AirPods Pro (2nd Gen)", sales: 234, revenue: 58266 },
  { name: "Premium Cotton T-Shirt", sales: 456, revenue: 13224 },
]

export function AdminOverview() {
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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your e-commerce store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon className={`h-4 w-4 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`} />
                      <span
                        className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
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
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="bg-transparent">
                Manage Products
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Package className="h-6 w-6 mx-auto mb-2" />
                  <span>Add Product</span>
                </div>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
                  <span>View Orders</span>
                </div>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span>Manage Users</span>
                </div>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-20 bg-transparent">
                <div className="text-center">
                  <Settings className="h-6 w-6 mx-auto mb-2" />
                  <span>Settings</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
