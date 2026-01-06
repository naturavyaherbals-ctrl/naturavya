"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script" // Import Script for Razorpay
import { CheckCircle2, Truck, CreditCard, Wallet, AlertCircle } from "lucide-react"
import { useCart } from "@/app/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Declare Razorpay on window to avoid TS errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, cartCount } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cod") // Default to COD

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "", // Added Email
    address: "",
    city: "",
    pincode: "",
    phone: ""
  })

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 0 
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  // 1. MAIN SUBMIT HANDLER
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (paymentMethod === "cod") {
        // FLOW A: CASH ON DELIVERY
        await processOrder("cod")
        router.push("/checkout/pending")
      } else {
        // FLOW B: PREPAID (Razorpay)
        openRazorpay()
      }
    } catch (error) {
      console.error("Checkout failed", error)
      alert("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  // 2. RAZORPAY LOGIC
  const openRazorpay = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // 🔴 REPLACE THIS WITH YOUR TEST KEY ID
      amount: total * 100, // Amount in paise
      currency: "INR",
      name: "Naturavya Herbals",
      description: "Wellness Products",
      handler: function (response: any) {
        // Payment Success!
        console.log("Payment ID: ", response.razorpay_payment_id)
        processOrder("prepaid", response.razorpay_payment_id)
          .then(() => router.push("/checkout/success"))
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#16a34a", // Primary green color
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    
    rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setIsSubmitting(false);
    });
  }

  // 3. API CALL TO SAVE ORDER
  async function processOrder(method: string, paymentId?: string) {
    const response = await fetch("/api/place-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: items,
        shippingDetails: formData,
        paymentMethod: method,
        paymentId: paymentId,
        total: total
      })
    })

    if (!response.ok) throw new Error("Failed to save order")
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Button asChild><Link href="/categories">Shop Now</Link></Button>
      </div>
    )
  }

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-7xl mx-auto px-4 py-16 bg-gray-50/50 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Updates will be sent here" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={formData.pincode} onChange={handleInputChange} required />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                
                {/* PREPAID OPTION */}
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'prepaid' ? 'border-primary bg-green-50' : 'hover:bg-gray-50'}`}>
                  <RadioGroupItem value="prepaid" id="prepaid" />
                  <Label htmlFor="prepaid" className="flex-1 cursor-pointer">
                    <span className="font-bold block">Pay Online (Instant Confirmation)</span>
                    <span className="text-xs text-gray-500">UPI, Cards, NetBanking via Razorpay</span>
                  </Label>
                  <CheckCircle2 className={`w-5 h-5 ${paymentMethod === 'prepaid' ? 'text-primary' : 'text-gray-300'}`} />
                </div>
                
                {/* COD OPTION */}
                <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <span className="font-bold block text-gray-900">Cash on Delivery</span>
                    <span className="text-xs text-orange-600 font-medium">Verification Call Required</span>
                  </Label>
                  <Wallet className="w-4 h-4 text-gray-500" />
                </div>
              </RadioGroup>

              {paymentMethod === 'cod' && (
                <div className="mt-4 p-3 bg-orange-100 text-orange-800 text-xs rounded flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>For COD orders, our team will call you to confirm. If we cannot reach you, the order may be cancelled.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div>
            <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full mt-6 h-12 text-lg font-bold transition-all ${paymentMethod === 'cod' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-primary hover:bg-primary/90'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : paymentMethod === 'cod' ? `Place Order (COD)` : `Pay ₹${total}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
