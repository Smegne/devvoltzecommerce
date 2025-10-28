"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, Users, ShoppingCart, Settings, Menu, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Admin Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start" size="lg">
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Back to Store */}
      <div className="pt-4 border-t">
        <Link href="/">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Store
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-24">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden mb-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <Menu className="mr-2 h-4 w-4" />
              Admin Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="mt-6">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
