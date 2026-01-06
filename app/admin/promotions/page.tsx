'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Edit2, Trash2, Tag, Upload, X, Power, ImageIcon, Loader2 } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form & Upload State
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    code: '',
    discount: '',
    image_url: '',
    target_link: '',
    is_active: true
  })

  // --- 2. FETCH DATA ---
  const fetchPromotions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error:', error)
    else setPromotions(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  // --- 3. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 1. Upload to Supabase Storage 'promotions' bucket
    const { error: uploadError } = await supabase.storage
      .from('promotions')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading image!')
      console.error(uploadError)
      setUploading(false)
      return
    }

    // 2. Get Public URL
    const { data } = supabase.storage
      .from('promotions')
      .getPublicUrl(filePath)

    // 3. Set the URL in form state
    setFormData({ ...formData, image_url: data.publicUrl })
    setUploading(false)
  }

  // --- 4. SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('promotions')
        .update(formData)
        .eq('id', editingId)
      
      if (!error) {
        setPromotions(promotions.map(p => p.id === editingId ? { ...p, ...formData } : p))
        closeModal()
      }
    } else {
      // Create
      const { data, error } = await supabase
        .from('promotions')
        .insert([formData])
        .select()

      if (!error && data) {
        setPromotions([data[0], ...promotions])
        closeModal()
      }
    }
  }

  // --- 5. ACTIONS ---
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (!error) setPromotions(promotions.filter(p => p.id !== id))
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promotions')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    if (!error) {
      setPromotions(promotions.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
    }
  }

  // --- MODAL HELPERS ---
  const openEdit = (promo: any) => {
    setEditingId(promo.id)
    setFormData({ ...promo })
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: '', subtitle: '', code: '', discount: '', image_url: '', target_link: '', is_active: true })
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Slider</h1>
          <p className="text-gray-500 text-sm">Manage homepage banners and coupon codes</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          <Plus size={18} /> Add Promotion
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className={`bg-white rounded-xl shadow border overflow-hidden flex flex-col ${!promo.is_active ? 'opacity-75 grayscale' : ''}`}>
              <div className="h-40 w-full bg-gray-100 relative">
                {promo.image_url ? (
                  <img src={promo.image_url} alt={promo.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold uppercase ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {promo.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="p-5 flex-1">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">{promo.title}</h3>
                {promo.subtitle && <p className="text-gray-500 text-sm mb-4">{promo.subtitle}</p>}
                <div className="flex flex-wrap gap-2 mb-4">
                  {promo.code && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100"><Tag size={12} className="inline mr-1"/> {promo.code}</span>}
                  {promo.discount && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">{promo.discount}</span>}
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                <button onClick={() => toggleStatus(promo.id, promo.is_active)} className={`text-sm font-medium flex items-center gap-1 ${promo.is_active ? 'text-orange-600' : 'text-green-600'}`}>
                  <Power size={14} /> {promo.is_active ? 'Disable' : 'Enable'}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => openEdit(promo)} className="text-gray-500 hover:text-blue-600"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(promo.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Promotion' : 'New Promotion'}</h2>
              <button onClick={closeModal}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* IMAGE UPLOAD SECTION */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden">
                    {uploading ? (
                      <Loader2 className="animate-spin text-green-600" />
                    ) : formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended: 1200x400px (JPG/PNG)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Sale" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="e.g. Up to 50% Off" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input type="text" className="w-full border rounded-lg p-2 uppercase" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="SUMMER20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <input type="text" className="w-full border rounded-lg p-2" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} placeholder="20% Off" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Link</label>
                <input type="text" className="w-full border rounded-lg p-2" value={formData.target_link} onChange={e => setFormData({...formData, target_link: e.target.value})} placeholder="/products/all" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className={`px-6 py-2 bg-green-700 text-white rounded-lg font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'}`}
                >
                  {editingId ? 'Save Changes' : 'Create Promotion'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}