"use client"

import { useState } from "react"
import { createProduct } from "../actions"
import { createClient } from "@/app/lib/supabase/client" // 👈 Import the new client helper
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([])
  const [currImage, setCurrImage] = useState("")
  const [isUploading, setIsUploading] = useState(false) // Loading state

  const [benefits, setBenefits] = useState<string[]>([])
  const [currBenefit, setCurrBenefit] = useState("")

  const supabase = createClient()

  // 👇 NEW: Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    const files = Array.from(e.target.files)
    const newUrls: string[] = []

    try {
      for (const file of files) {
        // 1. Create a unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        // 2. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('products') // Make sure you created this bucket!
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // 3. Get Public URL
        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        newUrls.push(data.publicUrl)
      }

      // 4. Update State
      setImages((prev) => [...prev, ...newUrls])

    } catch (error) {
      console.error("Upload failed:", error)
      alert("Error uploading image. Make sure your 'products' bucket exists and is public.")
    } finally {
      setIsUploading(false)
      // Reset input value to allow selecting same file again if needed
      e.target.value = "" 
    }
  }

  // Helper to manually add URL (Optional fallback)
  const addImageManual = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currImage) {
      setImages([...images, currImage])
      setCurrImage("")
    }
  }

  const addBenefit = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currBenefit) {
      setBenefits([...benefits, currBenefit])
      setCurrBenefit("")
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form action={createProduct}>
        <input type="hidden" name="imagesJSON" value={JSON.stringify(images)} />
        <input type="hidden" name="benefitsJSON" value={JSON.stringify(benefits)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Product Name</Label><Input name="title" required placeholder="e.g. Zero Ache Oil" /></div>
                <div className="space-y-2"><Label>URL Slug</Label><Input name="slug" required placeholder="e.g. zero-ache-oil" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea name="description" className="min-h-[150px]" placeholder="Product details..." /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                
                {/* 👇 NEW: File Upload Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                       <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                       <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-primary font-semibold hover:underline">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </Label>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max 5MB)</p>
                    
                    <Input 
                      id="image-upload" 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* Manual URL Fallback */}
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 font-medium">OR PASTE URL:</span>
                    <Input value={currImage} onChange={e => setCurrImage(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
                    <Button onClick={addImageManual} type="button" size="sm" variant="secondary">Add</Button>
                </div>

                {/* Image Previews */}
                <div className="grid grid-cols-4 gap-4">
                    {images.map((url, i) => (
                        <div key={i} className="relative aspect-square border rounded-lg overflow-hidden group bg-gray-100">
                            <img src={url} className="w-full h-full object-cover" alt="Product" />
                            <button 
                              type="button" 
                              onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Key Benefits</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input value={currBenefit} onChange={e => setCurrBenefit(e.target.value)} placeholder="e.g. 100% Natural" />
                    <Button onClick={addBenefit} type="button">Add</Button>
                </div>
                <ul className="space-y-2">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                      {b}
                      <button type="button" onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
             <Card>
              <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Sale Price (₹)</Label><Input name="price" type="number" required placeholder="1299" /></div>
                <div className="space-y-2"><Label>Original Price (₹)</Label><Input name="originalPrice" type="number" placeholder="1999" /></div>
                <div className="space-y-2"><Label>Stock Quantity</Label><Input name="stock" type="number" defaultValue={100} /></div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle>Organization & SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Category Slug</Label><Input name="category" placeholder="general-health" /></div>
                <div className="space-y-2"><Label>Meta Title</Label><Input name="seoTitle" placeholder="SEO Title" /></div>
                 <div className="space-y-2"><Label>Meta Description</Label><Textarea name="seoDescription" placeholder="SEO Description" /></div>
              </CardContent>
            </Card>
            <Button type="submit" size="lg" className="w-full bg-green-700 hover:bg-green-800">Publish Product</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
