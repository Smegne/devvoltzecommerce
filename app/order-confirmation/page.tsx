"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, ShoppingBag, Truck, Mail, Home, History, ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string
    orderNumber: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const orderNumber = searchParams.get('orderNumber')
    
    if (orderId) {
      setOrderDetails({
        orderId,
        orderNumber: orderNumber || `DVZ-${orderId}`
      })
      
      // Clear any pending cart items
      localStorage.removeItem('pendingCartItem')
      sessionStorage.removeItem('pendingCartItem')
    }
    setIsLoading(false)
  }, [searchParams])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0088CC] mx-auto mb-4"></div>
            <p className="text-white/80">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show empty state if no order details (direct access without parameters)
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              No Order Found
            </h1>
            <p className="text-white/80 text-lg mb-8">
              We couldn't find any order details. Please check your order history or return to shopping.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/products')}
                className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Continue Shopping
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
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
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Thank you for your purchase. Your order has been successfully placed.
          </p>

          {/* Order Details Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0088CC]" />
                    <span className="font-semibold">Order Number:</span>
                  </div>
                  <p className="text-lg font-mono">{orderDetails.orderNumber}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0088CC]" />
                    <span className="font-semibold">Order ID:</span>
                  </div>
                  <p className="text-lg">#{orderDetails.orderId}</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#0088CC]" />
                    <span className="font-semibold">What's Next?</span>
                  </div>
                  <ul className="text-white/80 space-y-1 text-sm">
                    <li>• You will receive an email confirmation shortly</li>
                    <li>• Your order will be processed within 24 hours</li>
                    <li>• We'll notify you when your order ships</li>
                    <li>• Expected delivery: 3-5 business days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/products')}
              className="bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/orders')}
              className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              View Order History
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm">
              Need help?{" "}
              <a href="mailto:support@devvoltz.com" className="text-[#0088CC] hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Add this export to prevent static generation issues
export const dynamic = 'force-dynamic'
export const runtime = 'edge' // or 'nodejs' if you prefer