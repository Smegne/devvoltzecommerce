"use client"

import { useState } from "react"
import { Save, Upload } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function AdminSettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "EliteStore",
    storeDescription: "Your trusted destination for premium electronics, fashion, and home essentials.",
    storeEmail: "support@elitestore.com",
    storePhone: "+1 (555) 123-4567",
    storeAddress: "123 Commerce Street, San Francisco, CA 94102",
    currency: "USD",
    taxRate: "8.25",
  })

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    shippingUpdates: true,
    promotionalEmails: false,
    newsletterEnabled: true,
  })

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: "50",
    standardShippingRate: "9.99",
    expressShippingRate: "19.99",
    overnightShippingRate: "39.99",
  })

  const handleStoreSettingsSave = () => {
    console.log("Store settings saved:", storeSettings)
  }

  const handleEmailSettingsSave = () => {
    console.log("Email settings saved:", emailSettings)
  }

  const handleShippingSettingsSave = () => {
    console.log("Shipping settings saved:", shippingSettings)
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
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Store Settings</h1>
                <p className="text-muted-foreground">Configure your store preferences and settings</p>
              </div>

              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={storeSettings.currency}
                        onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Textarea
                      id="storeDescription"
                      value={storeSettings.storeDescription}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeEmail">Store Email</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={storeSettings.storeEmail}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storePhone">Store Phone</Label>
                      <Input
                        id="storePhone"
                        value={storeSettings.storePhone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Input
                      id="storeAddress"
                      value={storeSettings.storeAddress}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      value={storeSettings.taxRate}
                      onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleStoreSettingsSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Store Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Email Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Order Confirmation Emails</h4>
                        <p className="text-sm text-muted-foreground">Send confirmation emails when orders are placed</p>
                      </div>
                      <Switch
                        checked={emailSettings.orderConfirmation}
                        onCheckedChange={(checked) =>
                          setEmailSettings({ ...emailSettings, orderConfirmation: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Shipping Updates</h4>
                        <p className="text-sm text-muted-foreground">Send emails when order status changes</p>
                      </div>
                      <Switch
                        checked={emailSettings.shippingUpdates}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, shippingUpdates: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Promotional Emails</h4>
                        <p className="text-sm text-muted-foreground">Send promotional and marketing emails</p>
                      </div>
                      <Switch
                        checked={emailSettings.promotionalEmails}
                        onCheckedChange={(checked) =>
                          setEmailSettings({ ...emailSettings, promotionalEmails: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Newsletter</h4>
                        <p className="text-sm text-muted-foreground">Enable newsletter subscriptions</p>
                      </div>
                      <Switch
                        checked={emailSettings.newsletterEnabled}
                        onCheckedChange={(checked) =>
                          setEmailSettings({ ...emailSettings, newsletterEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleEmailSettingsSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Email Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Shipping Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                      <Input
                        id="freeShippingThreshold"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) =>
                          setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standardShippingRate">Standard Shipping Rate ($)</Label>
                      <Input
                        id="standardShippingRate"
                        value={shippingSettings.standardShippingRate}
                        onChange={(e) =>
                          setShippingSettings({ ...shippingSettings, standardShippingRate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expressShippingRate">Express Shipping Rate ($)</Label>
                      <Input
                        id="expressShippingRate"
                        value={shippingSettings.expressShippingRate}
                        onChange={(e) =>
                          setShippingSettings({ ...shippingSettings, expressShippingRate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overnightShippingRate">Overnight Shipping Rate ($)</Label>
                      <Input
                        id="overnightShippingRate"
                        value={shippingSettings.overnightShippingRate}
                        onChange={(e) =>
                          setShippingSettings({ ...shippingSettings, overnightShippingRate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleShippingSettingsSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Shipping Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold">E</span>
                      </div>
                      <Button variant="outline" className="bg-transparent">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Recommended size: 200x200px, PNG or JPG</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
