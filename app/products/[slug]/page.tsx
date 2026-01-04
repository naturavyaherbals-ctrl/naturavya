import { supabaseServer } from "@/app/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Star, ShieldCheck, Truck, Clock } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// This function generates the metadata for SEO (Title in browser tab)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await supabaseServer()
  const { data: product } = await supabase
    .from("products")
    .select("title")
    .eq("slug", params.slug)
    .single()

  return {
    title: product ? `${product.title} | Naturavya` : "Product Not Found",
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = await supabaseServer()

  // 1. Fetch the product using the slug from the URL
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single()

  // 2. If product doesn't exist, show 404 page
  if (error || !product) {
    notFound()
  }

  // 3. Fetch related products (Optional: fetches 4 other products)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .neq("id", product.id) // Don't show the current product again
    .limit(4)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Navigation */}
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
          
          {/* LEFT: Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden border relative">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-100">
                  No Image Available
                </div>
              )}
              {/* Badge if stock is low */}
              {product.stock && product.stock < 5 && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  Only {product.stock} left!
                </Badge>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
              <div className="p-3 border rounded-lg bg-card">
                <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-primary" />
                <span>100% Authentic</span>
              </div>
              <div className="p-3 border rounded-lg bg-card">
                <Truck className="h-5 w-5 mx-auto mb-2 text-primary" />
                <span>Free Shipping</span>
              </div>
              <div className="p-3 border rounded-lg bg-card">
                <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <h1 className="text-4xl font-bold font-serif mb-2 text-foreground">
                {product.title}
              </h1>
              
              {/* Fake Rating for now */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(12 Reviews)</span>
              </div>

              <div className="text-3xl font-bold text-primary mb-6">
                ₹{product.price}
                <span className="text-lg text-muted-foreground line-through ml-3 font-normal">
                  ₹{Math.round(product.price * 1.2)}
                </span>
              </div>

              <div className="prose prose-sm text-muted-foreground max-w-none mb-8">
                <p>{product.description || "Experience the power of nature with this premium formulation. Crafted for balance and vitality."}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-4">
              {/* THE ADD TO CART BUTTON */}
              <AddToCartButton 
                product={{
                  id: product.id,
                  title: product.title,
                  price: product.price,
                  image: product.image
                }} 
              />
              
              <p className="text-xs text-center text-muted-foreground">
                Secure checkout powered by Razorpay. 100% Money-back guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link 
                  href={`/products/${item.slug}`} 
                  key={item.id} 
                  className="group block border rounded-xl overflow-hidden hover:shadow-lg transition bg-card"
                >
                  <div className="aspect-square bg-muted relative">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate group-hover:text-primary transition">{item.title}</h3>
                    <p className="text-primary font-bold mt-1">₹{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}