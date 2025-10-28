"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: User },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.role === "admin" && (
                <span className="inline-block px-2 py-1 text-xs bg-primary text-primary-foreground rounded mt-1">
                  Admin
                </span>
              )}
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

      {/* Admin Panel Link */}
      {user?.role === "admin" && (
        <div className="pt-4 border-t">
          <Link href="/admin">
            <Button variant="outline" className="w-full bg-transparent">
              Admin Panel
            </Button>
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
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
              Dashboard Menu
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
