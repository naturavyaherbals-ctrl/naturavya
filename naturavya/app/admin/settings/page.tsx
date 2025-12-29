"use client"

export const dynamic = "force-dynamic";


import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Store, CreditCard, Bell, Mail, Truck, Globe } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [reviewNotifications, setReviewNotifications] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
        </TabsList>

        {/* General settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="Naturavya" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Store Email</Label>
                  <Input id="store-email" type="email" defaultValue="contact@naturavya.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone Number</Label>
                  <Input id="store-phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (Rs.)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea
                  id="store-address"
                  defaultValue="123 Ayurveda Lane, Wellness District, Mumbai, Maharashtra 400001, India"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea
                  id="store-description"
                  defaultValue="Naturavya offers premium Ayurvedic wellness products crafted with ancient wisdom and modern science for holistic health."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input id="meta-title" defaultValue="Naturavya - Premium Ayurvedic Wellness Products" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  defaultValue="Discover authentic Ayurvedic supplements for men's and women's wellness. Natural, organic, and scientifically formulated for holistic health."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Keywords</Label>
                <Input id="meta-keywords" defaultValue="ayurvedic, wellness, supplements, natural, organic, health" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* Payment settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure payment gateways for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-lg font-bold text-blue-600">R</span>
                  </div>
                  <div>
                    <p className="font-medium">Razorpay</p>
                    <p className="text-sm text-muted-foreground">Accept cards, UPI, and net banking</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <span className="text-lg font-bold text-green-600">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PhonePe</p>
                    <p className="text-sm text-muted-foreground">Accept UPI payments via PhonePe</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                    <span className="text-lg font-bold text-amber-600">C</span>
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Accept payment on delivery</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure tax rates for your products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gst-number">GST Number</Label>
                  <Input id="gst-number" placeholder="Enter GST number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" defaultValue="18" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="tax-inclusive" />
                <Label htmlFor="tax-inclusive">Prices include tax</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* Notification settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about your store</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Order Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a new order is placed</p>
                </div>
                <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Review Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a new review is submitted</p>
                </div>
                <Switch checked={reviewNotifications} onCheckedChange={setReviewNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when product stock is low</p>
                </div>
                <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Templates
              </CardTitle>
              <CardDescription>Customize automated email templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">Sent when an order is placed</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Shipping Notification</p>
                    <p className="text-sm text-muted-foreground">Sent when an order is shipped</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Review Request</p>
                    <p className="text-sm text-muted-foreground">Sent after order delivery</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        {/* Shipping settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Zones</CardTitle>
              <CardDescription>Configure shipping rates for different regions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pan India</p>
                    <p className="text-sm text-muted-foreground">Standard shipping across India</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Delivery (5-7 days)</span>
                    <span>Rs. 49</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Express Delivery (2-3 days)</span>
                    <span>Rs. 99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Free shipping above</span>
                    <span>Rs. 499</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Add Shipping Zone
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Partners</CardTitle>
              <CardDescription>Integrate with shipping providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <span className="text-lg font-bold text-red-600">D</span>
                  </div>
                  <div>
                    <p className="font-medium">Delhivery</p>
                    <p className="text-sm text-muted-foreground">Pan India delivery services</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-lg font-bold text-blue-600">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Shiprocket</p>
                    <p className="text-sm text-muted-foreground">Multi-carrier shipping platform</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}