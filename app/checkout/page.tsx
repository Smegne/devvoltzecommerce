"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Truck, Shield, Upload, Link, Smartphone, Lock, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  paymentMethod: "card" | "telebirr" | "bank_transfer"
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  bankReceiptUrl: string
  telebirrScreenshot: File | null
  saveInfo: boolean
}

// List of countries for the dropdown
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Ethiopia",
  "Kenya",
  "Nigeria",
  "South Africa",
  "Egypt",
  "Ghana",
  "Uganda",
  "Tanzania"
].sort();

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [formData, setFormData] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
    phone: "",
    paymentMethod: "telebirr",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    bankReceiptUrl: "",
    telebirrScreenshot: null,
    saveInfo: false
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({})

  // Handle empty cart redirect
  useEffect(() => {
    if (items.length === 0 && !isRedirecting) {
      setIsRedirecting(true)
      router.push('/cart')
    }
  }, [items, router, isRedirecting])

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutForm, string>> = {}

    // Required fields validation
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.address) newErrors.address = "Address is required"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.zipCode) newErrors.zipCode = "ZIP code is required"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.phone) newErrors.phone = "Phone number is required"

    // Payment method specific validation
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber) newErrors.cardNumber = "Card number is required"
      if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required"
      if (!formData.cvv) newErrors.cvv = "CVV is required"
      if (!formData.nameOnCard) newErrors.nameOnCard = "Name on card is required"
    } else if (formData.paymentMethod === "bank_transfer") {
      if (!formData.bankReceiptUrl) newErrors.bankReceiptUrl = "Bank receipt URL is required"
      else if (!isValidUrl(formData.bankReceiptUrl)) newErrors.bankReceiptUrl = "Please enter a valid URL"
    } else if (formData.paymentMethod === "telebirr") {
      if (!formData.telebirrScreenshot) newErrors.telebirrScreenshot = "Payment screenshot is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, telebirrScreenshot: "Please upload an image file" }))
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, telebirrScreenshot: "File size must be less than 5MB" }))
        return
      }
      handleInputChange('telebirrScreenshot', file)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) {
    alert("Please fix the errors before submitting")
    return
  }

  setLoading(true)

  try {
    const token = localStorage.getItem('token')
    
    // Prepare form data for file upload
    const submitData = new FormData()
    
    // Add order data
    submitData.append('orderData', JSON.stringify({
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || 0
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone
      },
      paymentMethod: formData.paymentMethod,
      totalAmount: total,
      email: formData.email,
      bankReceiptUrl: formData.bankReceiptUrl
    }))

    // Add payment verification files
    if (formData.paymentMethod === "telebirr" && formData.telebirrScreenshot) {
      submitData.append('paymentScreenshot', formData.telebirrScreenshot)
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: submitData
    })

    // Read response as text first to avoid cloning issues
    const responseText = await response.text()
    
    if (response.ok) {
      const result = JSON.parse(responseText)
      
      // Clear the cart immediately
      clearCart()
      
      // Force sync with server to ensure cart is empty
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'))
      }, 100)
      
      // Redirect to order confirmation with both IDs
      router.push(`/order-confirmation?orderId=${result.orderId}&orderNumber=${result.orderNumber}`)
    } else {
      const errorData = JSON.parse(responseText)
      throw new Error(errorData.error || 'Checkout failed')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert(`Checkout failed: ${error instanceof Error ? error.message : 'Please try again.'}`)
  } finally {
    setLoading(false)
  }
}
  // Don't render anything if cart is empty (will redirect)
  if (items.length === 0 || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#051933] to-[#3132DD]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0088CC] mx-auto mb-4"></div>
          <p className="text-white/80">Redirecting to cart...</p>
        </div>
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
            <h1 className="text-4xl lg:text-5xl font-bold text-white">Secure Checkout</h1>
          </div>
          <p className="text-white/80 text-lg">Complete your purchase with confidence</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="border-b border-white/20">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5 text-[#0088CC]" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <Label htmlFor="email" className="text-white/90">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                        errors.email ? "border-red-500" : "focus:border-[#0088CC]"
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="border-b border-white/20">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Truck className="w-5 h-5 text-[#0088CC]" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white/90">First Name *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                          errors.firstName ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white/90">Last Name *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                          errors.lastName ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-white/90">Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                        errors.address ? "border-red-500" : "focus:border-[#0088CC]"
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-white/90">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                          errors.city ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}
                        placeholder="New York"
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-white/90">State/Province *</Label>
                      <Input
                        id="state"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                          errors.state ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}
                        placeholder="NY"
                      />
                      {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode" className="text-white/90">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                          errors.zipCode ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}
                        placeholder="10001"
                      />
                      {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-white/90">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                      >
                        <SelectTrigger className={`bg-white/5 border-white/20 text-white ${
                          errors.country ? "border-red-500" : "focus:border-[#0088CC]"
                        }`}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#051933] border-white/20 text-white">
                          {countries.map((country) => (
                            <SelectItem key={country} value={country} className="focus:bg-[#3132DD]">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white/90">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                        errors.phone ? "border-red-500" : "focus:border-[#0088CC]"
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="border-b border-white/20">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5 text-[#0088CC]" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value: "card" | "telebirr" | "bank_transfer") => 
                      handleInputChange('paymentMethod', value)
                    }
                  >
                    {/* Credit Card Option */}
                    <div className="flex items-center space-x-2 p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200 hover:border-[#0088CC]">
                      <RadioGroupItem value="card" id="card" className="text-[#0088CC] border-white/40" />
                      <Label htmlFor="card" className="flex items-center cursor-pointer flex-1 text-white">
                        <CreditCard className="w-5 h-5 mr-3 text-[#0088CC]" />
                        <div>
                          <div className="font-medium">Credit Card</div>
                          <div className="text-sm text-white/70">Pay with your credit or debit card</div>
                        </div>
                      </Label>
                    </div>

                    {/* Telebirr Option */}
                    <div className="flex items-center space-x-2 p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200 hover:border-[#0088CC]">
                      <RadioGroupItem value="telebirr" id="telebirr" className="text-[#0088CC] border-white/40" />
                      <Label htmlFor="telebirr" className="flex items-center cursor-pointer flex-1 text-white">
                        <Smartphone className="w-5 h-5 mr-3 text-[#0088CC]" />
                        <div>
                          <div className="font-medium">Telebirr</div>
                          <div className="text-sm text-white/70">Mobile payment solution</div>
                        </div>
                      </Label>
                    </div>

                    {/* Bank Transfer Option */}
                    <div className="flex items-center space-x-2 p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-200 hover:border-[#0088CC]">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" className="text-[#0088CC] border-white/40" />
                      <Label htmlFor="bank_transfer" className="flex items-center cursor-pointer flex-1 text-white">
                        <Link className="w-5 h-5 mr-3 text-[#0088CC]" />
                        <div>
                          <div className="font-medium">Bank Transfer</div>
                          <div className="text-sm text-white/70">Direct bank transfer</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Credit Card Details */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t border-white/20">
                      <div>
                        <Label htmlFor="cardNumber" className="text-white/90">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                            errors.cardNumber ? "border-red-500" : "focus:border-[#0088CC]"
                          }`}
                        />
                        {errors.cardNumber && <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="expiryDate" className="text-white/90">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                              errors.expiryDate ? "border-red-500" : "focus:border-[#0088CC]"
                            }`}
                          />
                          {errors.expiryDate && <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-white/90">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                              errors.cvv ? "border-red-500" : "focus:border-[#0088CC]"
                            }`}
                          />
                          {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="nameOnCard" className="text-white/90">Name on Card *</Label>
                        <Input
                          id="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                          className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                            errors.nameOnCard ? "border-red-500" : "focus:border-[#0088CC]"
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.nameOnCard && <p className="text-red-400 text-sm mt-1">{errors.nameOnCard}</p>}
                      </div>
                    </div>
                  )}

                  {/* Telebirr Payment Details */}
                  {formData.paymentMethod === "telebirr" && (
                    <div className="space-y-4 pt-4 border-t border-white/20">
                      <div className="bg-[#0088CC]/20 border border-[#0088CC]/30 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          Telebirr Payment Instructions
                        </h4>
                        <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside">
                          <li>Open your Telebirr app</li>
                          <li>Send payment to: <strong className="text-white">+251 9XX XXX XXX</strong></li>
                          <li>Take a screenshot of the payment confirmation</li>
                          <li>Upload the screenshot below</li>
                        </ol>
                      </div>

                      <div>
                        <Label htmlFor="telebirrScreenshot" className="flex items-center gap-2 text-white/90">
                          <Upload className="w-4 h-4" />
                          Upload Payment Screenshot *
                        </Label>
                        <Input
                          id="telebirrScreenshot"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="mt-2 bg-white/5 border-white/20 text-white file:bg-[#0088CC] file:text-white file:border-0"
                        />
                        {formData.telebirrScreenshot && (
                          <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {formData.telebirrScreenshot.name} uploaded successfully
                          </p>
                        )}
                        {errors.telebirrScreenshot && (
                          <p className="text-red-400 text-sm mt-1">{errors.telebirrScreenshot}</p>
                        )}
                        <p className="text-xs text-white/60 mt-2">
                          Supported formats: JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Details */}
                  {formData.paymentMethod === "bank_transfer" && (
                    <div className="space-y-4 pt-4 border-t border-white/20">
                      <div className="bg-[#3132DD]/20 border border-[#3132DD]/30 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Bank Transfer Instructions
                        </h4>
                        <div className="text-sm text-white/80 space-y-2">
                          <p><strong className="text-white">Bank:</strong> Commercial Bank of Ethiopia</p>
                          <p><strong className="text-white">Account Name:</strong> DevVoltz Market</p>
                          <p><strong className="text-white">Account Number:</strong> 1000 1234 5678</p>
                          <p><strong className="text-white">Reference:</strong> Your Order ID</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bankReceiptUrl" className="flex items-center gap-2 text-white/90">
                          <Link className="w-4 h-4" />
                          Bank Receipt URL *
                        </Label>
                        <Input
                          id="bankReceiptUrl"
                          type="url"
                          placeholder="https://example.com/receipt.jpg"
                          value={formData.bankReceiptUrl}
                          onChange={(e) => handleInputChange('bankReceiptUrl', e.target.value)}
                          className={`bg-white/5 border-white/20 text-white placeholder-white/50 ${
                            errors.bankReceiptUrl ? "border-red-500" : "focus:border-[#0088CC]"
                          }`}
                        />
                        {errors.bankReceiptUrl && (
                          <p className="text-red-400 text-sm mt-1">{errors.bankReceiptUrl}</p>
                        )}
                        <p className="text-xs text-white/60 mt-2">
                          Paste the URL to your bank transfer receipt or screenshot
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="border-b border-white/20">
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product?.images?.[0] || "/placeholder.svg"}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded-lg border border-white/20"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{item.product?.name}</p>
                            <p className="text-xs text-white/60">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium text-white">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Pricing */}
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
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-[#0088CC]">{formatPrice(total)}</span>
                  </div>

                  {/* Security Features */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <div className="flex items-center text-sm text-white/80">
                      <Shield className="w-4 h-4 mr-2 text-[#0088CC]" />
                      Secure encrypted checkout
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Lock className="w-4 h-4 mr-2 text-[#0088CC]" />
                      Your data is protected
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Truck className="w-4 h-4 mr-2 text-[#0088CC]" />
                      Free shipping over $50
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-[#3132DD] to-[#0088CC] hover:from-[#3132DD]/90 hover:to-[#0088CC]/90 text-white transition-all duration-300 transform hover:scale-105 shadow-lg border-0 mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      `Complete Order - ${formatPrice(total)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}