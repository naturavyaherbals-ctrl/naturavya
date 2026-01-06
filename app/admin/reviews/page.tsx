'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Star, ThumbsUp, CheckCircle, XCircle, Trash2, Plus, MessageSquare, User, X } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    comment: '',
    helpful_count: 0,
    status: 'Approved' 
  })

  // --- 2. FETCH DATA ---
  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error:', error)
    else setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // --- 3. ACTIONS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('reviews').insert([formData]).select()
    
    if (!error && data) {
      setReviews([data[0], ...reviews])
      setIsModalOpen(false)
      setFormData({ customer_name: '', rating: 5, comment: '', helpful_count: 0, status: 'Approved' })
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase.from('reviews').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (!error) setReviews(reviews.filter(r => r.id !== id))
  }

  // Helper to render stars
  const renderStars = (count: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={14} className={`${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  }

  const filteredReviews = reviews.filter(r => activeTab === 'All' ? true : r.status === activeTab)

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      
      {/* HEADER SECTION WITH ADD BUTTON */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
          <p className="text-gray-500 text-sm">Manage customer testimonials</p>
        </div>
        
        {/* --- THIS IS THE ADD BUTTON --- */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all"
        >
          <Plus size={18} /> Add Manual Review
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><MessageSquare size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Star size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600"><User size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Pending Approval</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeTab === tab 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500">No reviews found in "{activeTab}"</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-200">
                  {review.customer_name.charAt(0)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow w-full">
                <div className="flex flex-wrap justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{review.customer_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                    review.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    review.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {review.status}
                  </span>
                </div>

                <p className="text-gray-600 leading-relaxed mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                  "{review.comment}"
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} /> {review.helpful_count} people found this helpful
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-2 min-w-[120px] justify-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
                {review.status === 'Pending' && (
                  <>
                    <button onClick={() => updateStatus(review.id, 'Approved')} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs font-bold uppercase transition">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => updateStatus(review.id, 'Rejected')} className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg text-xs font-bold uppercase transition">
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                
                {review.status === 'Approved' && (
                  <button onClick={() => updateStatus(review.id, 'Rejected')} className="text-gray-400 hover:text-red-600 py-1 text-sm flex items-center justify-end gap-1">
                    <XCircle size={14} /> Unpublish
                  </button>
                )}

                <button onClick={() => handleDelete(review.id)} className="text-gray-300 hover:text-red-600 py-1 text-sm flex items-center justify-end gap-1 mt-auto">
                  <Trash2 size={14} /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* --- ADD REVIEW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Add Manual Review</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client Name</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} placeholder="e.g. Disha Ji" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Review / Feedback</label>
                <textarea required rows={4} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="Paste the client's message here..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">"Helpful" Count</label>
                <p className="text-xs text-gray-500 mb-2">Show this number on the website for social proof.</p>
                <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none" value={formData.helpful_count} onChange={e => setFormData({...formData, helpful_count: parseInt(e.target.value)})} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium shadow-md transition transform active:scale-95">Publish Review</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}