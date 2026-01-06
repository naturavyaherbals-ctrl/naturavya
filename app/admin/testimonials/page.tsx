'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Edit2, Trash2, Power, Upload, X, Loader2, Quote, User } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form & Upload State
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    client_name: '',
    role: '',
    quote: '',
    image_url: '',
    is_active: true
  })

  // --- 2. FETCH DATA ---
  const fetchTestimonials = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error:', error)
    else setTestimonials(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  // --- 3. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to 'testimonials' bucket
    const { error: uploadError } = await supabase.storage
      .from('testimonials')
      .upload(filePath, file)

    if (uploadError) {
      alert('Error uploading image!')
      setUploading(false)
      return
    }

    // Get Public URL
    const { data } = supabase.storage
      .from('testimonials')
      .getPublicUrl(filePath)

    setFormData({ ...formData, image_url: data.publicUrl })
    setUploading(false)
  }

  // --- 4. SUBMIT FORM (Create or Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from('testimonials')
        .update(formData)
        .eq('id', editingId)
      
      if (!error) {
        setTestimonials(testimonials.map(t => t.id === editingId ? { ...t, ...formData } : t))
        closeModal()
      }
    } else {
      // CREATE
      const { data, error } = await supabase
        .from('testimonials')
        .insert([formData])
        .select()

      if (!error && data) {
        setTestimonials([data[0], ...testimonials])
        closeModal()
      }
    }
  }

  // --- 5. ACTIONS ---
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (!error) setTestimonials(testimonials.filter(t => t.id !== id))
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) {
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t))
    }
  }

  // --- MODAL HELPERS ---
  const openEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({ 
      client_name: item.client_name, 
      role: item.role || '', 
      quote: item.quote, 
      image_url: item.image_url || '', 
      is_active: item.is_active 
    })
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ client_name: '', role: '', quote: '', image_url: '', is_active: true })
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 text-sm">Curate success stories for your homepage</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {/* GRID VIEW */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
          <p className="text-gray-500">No testimonials found.</p>
          <button onClick={openCreate} className="text-green-700 font-medium mt-2 hover:underline">Create your first one</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden transition-all hover:shadow-md ${!item.is_active ? 'opacity-60 grayscale' : ''}`}>
              
              {/* Card Body */}
              <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.client_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                    )}
                  </div>
                  {/* Name & Role */}
                  <div>
                    <h3 className="font-bold text-gray-900">{item.client_name}</h3>
                    <p className="text-xs text-gray-500">{item.role || 'Client'}</p>
                  </div>
                  {/* Status Badge */}
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="relative">
                  <Quote size={24} className="text-gray-200 absolute -top-2 -left-2 transform -scale-x-100" />
                  <p className="text-gray-600 text-sm leading-relaxed relative z-10 pl-4 italic">
                    "{item.quote}"
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <button 
                  onClick={() => toggleStatus(item.id, item.is_active)}
                  className={`text-xs font-bold uppercase flex items-center gap-1 ${item.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                >
                  <Power size={14} /> {item.is_active ? 'Disable' : 'Enable'}
                </button>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* IMAGE UPLOAD */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uploading ? <Loader2 className="animate-spin text-green-600" /> : 
                   formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : 
                   <User className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Photo</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input required type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} placeholder="e.g. Anjali Desai" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Designation (Optional)</label>
                  <input type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Yoga Teacher" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote / Testimonial</label>
                <textarea required rows={4} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} placeholder="What did they say?" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={uploading} className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium transition">
                  {editingId ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}