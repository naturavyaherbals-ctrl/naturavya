import { supabaseServer } from "@/app/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Star, ShieldCheck, Truck, Clock } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Badge } from "@/components/ui/badge"

// FIXED: Added 'Promise' to params and await it
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await supabaseServer()
  const { data: product } = await supabase.from("products").select("title").eq("slug", slug).single()
  return { title: product ? `${product.title} | Naturavya` : "Product Not Found" }
}

// FIXED: Added 'Promise' to params and await it
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // <--- THIS IS THE FIX
  const supabase = await supabaseServer()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .neq("id", product.id)
    .limit(4)

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/categories" className="hover:text-primary">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border relative">
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
            )}
            {product.stock && product.stock < 5 && (
              <Badge variant="destructive" className="absolute top-4 left-4">Only {product.stock} left!</Badge>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col h-full">
            <h1 className="text-4xl font-bold font-serif mb-2">{product.title}</h1>
            <div className="text-3xl font-bold text-primary mb-6">₹{product.price}</div>
            <div className="prose prose-sm text-muted-foreground max-w-none mb-8">
              <p>{product.description || "Premium Ayurvedic formulation."}</p>
            </div>
            
            <div className="mt-auto">
              <AddToCartButton product={product} />
              <p className="text-xs text-center text-muted-foreground mt-4">Secure checkout. 100% Authentic.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}