"use client"

import { useState } from "react"
import { updateCategory } from "../actions" // Your existing server action
import { createClient } from "@/app/lib/supabase/client" // Client-side helper
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Upload, Loader2, X } from "lucide-react"

export default function EditCategoryForm({ category }: { category: any }) {
  const [imageUrl, setImageUrl] = useState(category.image || "")
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  // 👇 HANDLE FILE UPLOAD
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUploading(true)
    const file = e.target.files[0]
    
    try {
      // 1. Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `category-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 2. Upload to 'products' bucket (using the one you already made)
      const { error: uploadError } = await supabase.storage
        .from('products') 
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      // 4. Update State (this updates the preview and the hidden input)
      setImageUrl(data.publicUrl)

    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Ensure your 'products' bucket is public.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form action={updateCategory}>
      <input type="hidden" name="id" value={category.id} />
      
      {/* 👇 IMPORTANT: This hidden input sends the new URL to your Server Action */}
      <input type="hidden" name="image" value={imageUrl} />

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Category Name</Label>
            <Input name="title" defaultValue={category.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input name="slug" defaultValue={category.slug} required />
          </div>

          {/* 👇 REPLACED URL INPUT WITH UPLOAD BUTTON */}
          <div className="space-y-3">
            <Label>Category Image</Label>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              {/* Preview Area */}
              {imageUrl ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border shadow-sm">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isUploading} 
                  className="cursor-pointer relative overflow-hidden"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Choose Image
                    </>
                  )}
                  
                  {/* Invisible File Input overlay */}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    accept="image/*"
                    disabled={isUploading}
                  />
                </Button>
              </div>
              <p className="text-xs text-gray-400">Supported: JPG, PNG, WEBP</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" defaultValue={category.description} />
          </div>

          <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}