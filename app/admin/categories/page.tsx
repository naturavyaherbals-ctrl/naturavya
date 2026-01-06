'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Edit2, Trash2, Upload, X, Loader2, ImageIcon, Layers } from 'lucide-react'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    product_count: 0
  })

  // Fetch Data
  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error:', error)
    else setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('categories').getPublicUrl(filePath)
    setFormData({ ...formData, image_url: data.publicUrl })
    setUploading(false)
  }

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', editingId)
      
      if (!error) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData } : c))
        closeModal()
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from('categories')
        .insert([formData])
        .select()

      if (!error && data) {
        setCategories([data[0], ...categories])
        closeModal()
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) setCategories(categories.filter(c => c.id !== id))
  }

  // Modal Controls
  const openEdit = (cat: any) => {
    setEditingId(cat.id)
    setFormData({ name: cat.name, image_url: cat.image_url || '', product_count: cat.product_count || 0 })
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ name: '', image_url: '', product_count: 0 })
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? <div className="text-center py-10">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                {cat.image_url ? (
                  <img src={cat.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{cat.name}</h3>
              <div className="flex justify-between mt-4 pt-3 border-t">
                <button onClick={() => openEdit(cat)} className="text-xs font-medium text-blue-600 flex gap-1"><Edit2 size={14}/> Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="text-xs font-medium text-red-600 flex gap-1"><Trash2 size={14}/> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={closeModal}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
                    {uploading ? <Loader2 className="animate-spin m-auto mt-5 text-green-600"/> : 
                     formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover"/> : null}
                  </div>
                  <label className="cursor-pointer bg-gray-50 border px-3 py-2 rounded text-sm hover:bg-gray-100">
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full border rounded-lg p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-green-700 text-white py-2 rounded-lg font-medium hover:bg-green-800">
                {editingId ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}