import Link from "next/link"
import { PhoneCall, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8 text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock className="w-10 h-10 text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-orange-900">Order Pending Verification</h1>
        <p className="text-gray-600 mb-6">
          Since you chose <strong>Cash on Delivery</strong>, our team needs to verify your order manually.
        </p>

        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8 text-left flex gap-3">
          <PhoneCall className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-orange-900 text-sm">What happens next?</p>
            <p className="text-xs text-orange-800 mt-1">
              You will receive a call from our representative within 24 hours to confirm your address and items. The order will be shipped only after this confirmation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
            <Link href="/categories">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
