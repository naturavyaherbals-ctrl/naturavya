import { notFound } from "next/navigation"
import { Check, Star, ShieldCheck } from "lucide-react"
import { createClient } from "@/app/lib/supabase/server"

// Components
import { Button } from "@/components/ui/button"
import AddToCartButton from "@/components/add-to-cart"
import BuyNowButton from "@/components/buy-now"

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  
  // 👇 FIX: Select 'name' (or all fields) to ensure we get the product name
  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("slug", slug)
    .single()

  return { 
    title: product?.name ? `${product.name} | Naturavya` : "Naturavya Herbals" 
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Product Not Found</h1>
        <Button asChild><a href="/categories">Browse All Products</a></Button>
      </div>
    )
  }

  // 1. IMAGE LOGIC (Array vs String)
  let dbImage = null
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    dbImage = product.images[0]
  } else if (product.image) {
    dbImage = product.image
  }
  const productImage = dbImage && dbImage.trim() !== "" ? dbImage : FALLBACK_IMAGE

  // 2. NAME LOGIC (Database uses 'name', App uses 'title')
  const productName = product.name || product.title || "Untitled Product"

  // 3. Prepare product object for Cart (Cart expects 'title')
  const cartProduct = {
    ...product,
    title: productName, // Map name to title
    image: productImage
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Product Image Section */}
        <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border shadow-sm">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green-600" />
            <span>Ayush Certified</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            {/* 👇 FIX: Using productName variable */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{productName}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">(128 verified reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-primary">₹{product.price}</p>
              <p className="text-xl text-gray-400 line-through">₹{Math.round(product.price * 1.3)}</p>
              <span className="text-green-600 font-bold text-sm">30% OFF</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8 text-lg border-t border-b py-6">
            {product.description || "Experience the natural benefits of Ayurveda."}
          </p>

          {/* Action Buttons (Using fixed cartProduct) */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <AddToCartButton product={cartProduct} />
            <BuyNowButton product={cartProduct} />
          </div>

          <div className="space-y-4 bg-gray-50 p-6 rounded-xl border">
            <h3 className="font-semibold mb-2">Why Choose Naturavya?</h3>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-700" />
              </div>
              <span>100% Natural & Herbal Ingredients</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-700" />
              </div>
              <span>Free & Fast Shipping across India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}