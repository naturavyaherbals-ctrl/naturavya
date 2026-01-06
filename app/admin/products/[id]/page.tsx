'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Trash2, Upload, ImageIcon } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id // Get Product ID from URL

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // New state to track image uploading status
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    image_url: ''
  })

  // --- 2. FETCH PRODUCT DETAILS ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        alert('Product not found or database error.')
        router.push('/admin/products')
      } else if (data) {
        setFormData({
          name: data.name || '',
          // Ensure numeric values are strings for inputs
          price: data.price ? String(data.price) : '',
          category: data.category || '',
          description: data.description || '',
          stock: data.stock ? String(data.stock) : '',
          image_url: data.image_url || ''
        })
      }
      setLoading(false)
    }

    fetchProduct()
  }, [id, router])

  // --- 3. NEW: HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = fileName

    // A. Upload file to Supabase Storage bucket named 'products'
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message)
      setUploading(false)
      return
    }

    // B. Get the public URL of the uploaded file
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    // C. Update form data with the new URL automatically
    setFormData({ ...formData, image_url: data.publicUrl })
    setUploading(false)
  }

  // --- 4. HANDLE UPDATE (With Safety Checks) ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Convert strings to numbers safely. If empty, send 0.
    const updates = {
      name: formData.name,
      price: formData.price ? parseFloat(formData.price) : 0,
      category: formData.category,
      description: formData.description,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      image_url: formData.image_url
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)

    if (error) {
      alert('Error updating product: ' + error.message)
      console.error(error)
    } else {
      alert('Product updated successfully!')
      router.push('/admin/products')
    }
    setSaving(false)
  }

  // --- 5. HANDLE DELETE ---
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return
    
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting product')
      console.error(error)
    } else {
      router.push('/admin/products')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading product details...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} className="mr-1" /> Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- NEW IMAGE UPLOAD SECTION --- */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              
              <div className="flex items-start gap-6">
                {/* Image Preview Box */}
                <div className="relative w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uploading ? (
                    <Loader2 className="animate-spin text-green-600" size={24} />
                  ) : formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={32} />
                  )}
                </div>

                {/* Upload Button Area */}
                <div className="flex-1">
                  <label className={`cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={18} />
                    <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image (JPG, PNG). Max 2MB.
                  </p>
                  {/* Fallback URL Input (Hidden by default, useful for debugging if needed) */}
                  {/* <input type="text" className="mt-2 w-full text-xs border rounded p-1 text-gray-400" value={formData.image_url} readOnly /> */}
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input 
                required
                type="text" 
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input 
                required
                type="number" 
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input 
                required
                type="number" 
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full border rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Wellness">Wellness</option>
                <option value="Skincare">Skincare</option>
                <option value="Haircare">Haircare</option>
                <option value="Supplements">Supplements</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                rows={4}
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t flex items-center justify-between">
            <button 
              type="button" 
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition"
            >
              <Trash2 size={18} /> Delete Product
            </button>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving || uploading}
                className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}