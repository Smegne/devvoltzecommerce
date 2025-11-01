"use client"

import { useState } from "react"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck, Shield } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartTotal, getCartItems, clearCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const cartItems = getCartItems()
  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax - discount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ET", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(subtotal * 0.1)
    } else if (promoCode.toLowerCase() === "welcome20") {
      setDiscount(subtotal * 0.2)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <div className="relative">
                <ShoppingBag className="w-24 h-24 text-white/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-dashed border-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white mb-2">Your cart is empty</h1>
              <p className="text-white/70 text-lg">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-2 h-8 bg-[#0088CC] rounded-full"></div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">Shopping Cart</h1>
          </div>
          <p className="text-white/80 text-lg">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Header */}
            <div className="flex items-center justify-between">
              <Link href="/products">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <div className="text-white/80">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.productId} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product?.images?.[0] || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        className="w-20 h-20 object-cover rounded-lg border border-white/20"
                      />

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <Link href={`/product/${item.product?.id || item.productId}`}>
                              <h3 className="font-semibold text-white hover:text-[#0088CC] transition-colors text-lg">
                                {item.product?.name || "Product"}
                              </h3>
                            </Link>
                            <p className="text-white/60 text-sm">{item.product?.category || "Category"}</p>
                            {item.product?.inStock ? (
                              <p className="text-green-400 text-sm flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                In Stock
                              </p>
                            ) : (
                              <p className="text-red-400 text-sm">Out of Stock</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-white/20 rounded-lg bg-white/5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="text-white hover:bg-white/10 h-8 w-8"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="px-3 py-1 min-w-[2rem] text-center text-white font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stockCount || 999)}
                                className="text-white hover:bg-white/10 h-8 w-8"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="text-sm text-white/60">
                              Max {item.product?.stockCount || 999} available
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-lg text-white">
                              {formatPrice((item.product?.price || 0) * item.quantity)}
                            </div>
                            <div className="text-sm text-white/60">
                              {formatPrice(item.product?.price || 0)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={clearCart} 
                className="text-red-400 border-red-400/50 bg-transparent hover:bg-red-400/20 hover:text-red-300"
              >
                Clear Entire Cart
              </Button>
              <Link href="/products">
                <Button 
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  Add More Items
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/80">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Shipping</span>
                    <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Tax</span>
                    <span className="text-white">{formatPrice(tax)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-white/20" />

                {/* Total */}
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-[#0088CC]">{formatPrice(total)}</span>
                </div>

                {/* Promo Code */}
                <div className="space-y-3 pt-2">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Promo code" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-[#0088CC]"
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyPromoCode}
                      className="border-[#0088CC] text-[#0088CC] hover:bg-[#0088CC] hover:text-white"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 text-center">
                    Try: <strong>SAVE10</strong> or <strong>WELCOME20</strong>
                  </p>
                </div>

                {/* Security Features */}
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <div className="flex items-center text-sm text-white/80">
                    <Shield className="w-4 h-4 mr-2 text-[#0088CC]" />
                    Secure encrypted checkout
                  </div>
                  <div className="flex items-center text-sm text-white/80">
                    <Truck className="w-4 h-4 mr-2 text-[#0088CC]" />
                    {shipping === 0 ? "Free shipping included!" : "Free shipping on orders over $50"}
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white transition-all duration-300 transform hover:scale-105 shadow-lg border-0"
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-white/60">
                    You won't be charged until you complete checkout
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}