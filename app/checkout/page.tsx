"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { CheckCircle2, Truck, CreditCard, Wallet, AlertCircle, ShieldCheck, Lock, Sparkles, Phone } from "lucide-react"
import { useCart } from "@/app/context/cart-context"
import { motion, AnimatePresence } from "framer-motion"

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, cartCount } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("prepaid") // Default to Prepaid for higher success rate
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

  // --- SUBMIT HANDLER ---
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (paymentMethod === "cod") {
        await processOrder("cod")
        router.push("/checkout/pending")
      } else {
        openRazorpay()
      }
    } catch (error) {
      console.error("Checkout failed", error)
      alert("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  // --- RAZORPAY LOGIC ---
  const openRazorpay = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", 
      amount: total * 100,
      currency: "INR",
      name: "Naturavya Herbals",
      description: "Wellness Products",
      handler: function (response: any) {
        processOrder("prepaid", response.razorpay_payment_id)
          .then(() => router.push("/checkout/success"))
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#059669" },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setIsSubmitting(false);
    });
  }

  // --- API CALL ---
  async function processOrder(method: string, paymentId?: string) {
    // Simulate API call for demo (replace with real fetch)
    await new Promise(resolve => setTimeout(resolve, 1500))
    // const response = await fetch("/api/place-order", ...)
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <ShoppingBag size={32} />
        </div>
        <h2 className="text-3xl font-serif text-emerald-950">Your sanctuary is empty</h2>
        <Link href="/categories">
            <button className="bg-emerald-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-emerald-900/20 transition-all">
                Return to Shop
            </button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-[#fdfbf7] text-emerald-950 pt-32 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200/50 shadow-sm mb-4">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800 tracking-[0.2em] uppercase">Secure Checkout</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-light font-serif">Finalize Your <span className="italic text-amber-600">Order</span></h1>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* --- LEFT: FORM --- */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Shipping Section */}
              <div className="bg-white/80 backdrop-blur-xl border border-amber-100 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">1</span>
                  Shipping Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">First Name</label>
                    <input id="firstName" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Last Name</label>
                    <input id="lastName" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="email" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Email Address</label>
                    <input id="email" type="email" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.email} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Street Address</label>
                    <input id="address" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.address} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">City</label>
                    <input id="city" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="pincode" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Pincode</label>
                    <input id="pincode" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.pincode} onChange={handleInputChange} required />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="phone" className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                        <input id="phone" type="tel" className="w-full bg-[#fbfbfb] border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white/80 backdrop-blur-xl border border-amber-100 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">2</span>
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Prepaid */}
                  <label 
                    className={`relative flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'prepaid' ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                    onClick={() => setPaymentMethod('prepaid')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'prepaid' ? 'border-emerald-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'prepaid' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                    </div>
                    <div className="flex-1">
                        <span className="block font-bold text-emerald-950 text-lg">Pay Online</span>
                        <span className="text-sm text-emerald-800/60">UPI, Credit/Debit Card, NetBanking</span>
                    </div>
                    <div className="flex gap-2">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    {/* Badge */}
                    <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Recommended
                    </div>
                  </label>

                  {/* COD */}
                  <label 
                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${paymentMethod === 'cod' ? 'border-amber-600' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                    </div>
                    <div className="flex-1">
                        <span className="block font-bold text-emerald-950 text-lg">Cash on Delivery</span>
                        <span className="text-sm text-emerald-800/60">Pay cash at your doorstep</span>
                    </div>
                    <Wallet className="w-6 h-6 text-amber-600" />
                  </label>

                  <AnimatePresence>
                    {paymentMethod === 'cod' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-amber-100/50 p-4 rounded-xl flex gap-3 text-sm text-amber-900 border border-amber-200"
                        >
                            <Phone className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>For COD orders, our team will call you to confirm shipping details. If we cannot reach you, the order may be automatically cancelled.</p>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* --- RIGHT: ORDER SUMMARY --- */}
            <div className="lg:col-span-5">
              <div className="bg-white/90 backdrop-blur-xl border border-amber-100 rounded-[2.5rem] p-8 shadow-xl sticky top-28 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-900" />
                
                <h3 className="font-serif text-2xl text-emerald-950 mb-6">Your Selection</h3>
                
                <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center py-3 border-b border-dashed border-gray-100 last:border-0">
                      <div className="w-16 h-16 bg-[#fbfbfb] rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-emerald-950 text-sm">{item.title}</p>
                        <p className="text-xs text-emerald-800/50">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-emerald-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-emerald-900/60">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Shipping</span>
                    <span className="flex items-center gap-1"><Sparkles size={12} /> Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-emerald-950 pt-4 border-t border-dashed border-gray-200 mt-2">
                    <span>Total to Pay</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full mt-8 h-14 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 
                    paymentMethod === 'cod' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-900/20' : 
                    'bg-emerald-900 text-white hover:bg-emerald-800 shadow-emerald-900/20'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total}`}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800/40 uppercase tracking-widest">
                  <ShieldCheck size={14} /> 256-Bit SSL Secured
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

function ArrowRight({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    )
}
