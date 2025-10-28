"use client"

import { useState } from "react"
import { Search, Eye, Edit, Trash2, Shield, User } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock users data
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    joinDate: "2024-01-15",
    orders: 5,
    totalSpent: 1299.95,
    status: "active",
    avatar: "/placeholder.svg?key=user1",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "customer",
    joinDate: "2024-01-10",
    orders: 3,
    totalSpent: 599.97,
    status: "active",
    avatar: "/placeholder.svg?key=user2",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    joinDate: "2023-12-01",
    orders: 0,
    totalSpent: 0,
    status: "active",
    avatar: "/placeholder.svg?key=admin",
  },
  {
    id: "4",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "customer",
    joinDate: "2024-01-05",
    orders: 1,
    totalSpent: 89.99,
    status: "inactive",
    avatar: "/placeholder.svg?key=user4",
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
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
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage customer accounts and permissions</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">User</th>
                          <th className="text-left p-4 font-medium">Role</th>
                          <th className="text-left p-4 font-medium">Join Date</th>
                          <th className="text-left p-4 font-medium">Orders</th>
                          <th className="text-left p-4 font-medium">Total Spent</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                {user.role === "admin" ? (
                                  <Shield className="w-3 h-3 mr-1" />
                                ) : (
                                  <User className="w-3 h-3 mr-1" />
                                )}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <p className="text-sm">{user.joinDate}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium">{user.orders}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium">{formatPrice(user.totalSpent)}</p>
                            </td>
                            <td className="p-4">
                              <Badge className={user.status === "active" ? "bg-green-500" : "bg-red-500"}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {filteredUsers.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No users have registered yet."}
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
