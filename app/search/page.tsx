"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js" // Using direct client for live search
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Initialize client directly for client-side live search
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Search whenever 'query' changes
  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("title", `%${query}%`) // Partial match search
        .limit(10)

      if (!error && data) {
        setResults(data)
      }
      setLoading(false)
    }

    // Debounce: Wait 500ms after typing stops before searching
    const timer = setTimeout(searchProducts, 500)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Search Products</h1>

      {/* Search Bar */}
      <div className="relative mb-12">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for wellness products..."
          className="pl-12 h-12 text-lg rounded-full shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{product.title}</h3>
              <p className="text-primary font-bold">₹{product.price}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results State */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No products found matching "{query}"
        </div>
      )}
    </div>
  )
}