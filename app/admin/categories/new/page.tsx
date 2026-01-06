'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Upload, ImageIcon, Layers } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function NewCategoryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    image_url: ''
  })

  // --- 2. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = fileName

    // Upload to 'categories' bucket
    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message)
      setUploading(false)
      return
    }

    // Get Public URL
    const { data } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath)

    setFormData({ ...formData, image_url: data.publicUrl })
    setUploading(false)
  }

  // --- 3. HANDLE SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('categories')
      .insert([{
        name: formData.name,
        image_url: formData.image_url,
        product_count: 0 // Default to 0
      }])

    if (error) {
      alert('Error creating category: ' + error.message)
      console.error(error)
    } else {
      router.push('/admin/categories') // Redirect back to list
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} className="mr-1" /> Back to Categories
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-gray-100 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0">
                {uploading ? (
                  <Loader2 className="animate-spin text-green-600" size={24} />
                ) : formData.image_url ? (
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Layers className="text-gray-400" size={32} />
                )}
              </div>

              <div className="flex-1">
                <label className={`cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload size={18} />
                  <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: Square image (JPG/PNG)</p>
              </div>
            </div>
          </div>

          {/* NAME INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input 
              required
              type="text" 
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="e.g. Wellness"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* ACTIONS */}
          <div className="pt-6 border-t flex justify-end gap-3">
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
              Create Category
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}