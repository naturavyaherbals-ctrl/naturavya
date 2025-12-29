"use client";

export const dynamic = "force-dynamic";

import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  return (
    <>
      <Navbar />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">
            Checkout
          </h1>

          <p className="text-muted-foreground mb-8">
            Checkout flow will be connected to payment gateway next.
          </p>

          <div className="p-6 border rounded-xl space-y-4">
            <Button className="w-full">
              Proceed to Payment
            </Button>

            <Link href="/cart" className="block text-center text-sm text-primary">
              Go to Cart
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

