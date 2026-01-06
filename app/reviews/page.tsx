'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Star, User, Send, CheckCircle } from 'lucide-react'

// --- 1. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  })

  // --- 2. FETCH APPROVED REVIEWS ONLY ---
  useEffect(() => {
    const fetchReviews = async () => {
      // Only show reviews that you have Approved in the Admin panel
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'Approved') 
        .order('created_at', { ascending: false })

      if (!error) setReviews(data || [])
      setLoading(false)
    }
    fetchReviews()
  }, [])

  // --- 3. HANDLE SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Insert new review with 'Pending' status
    const { error } = await supabase.from('reviews').insert([
      { ...formData, status: 'Pending', helpful_count: 0 }
    ])

    if (!error) {
      setSubmitted(true)
      setFormData({ customer_name: '', rating: 5, comment: '' })
    } else {
      alert('Failed to submit review. Please try again.')
    }
    setSubmitting(false)
  }

  // Helper for stars
  const renderStars = (count: number, interactable = false) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        disabled={!interactable}
        onClick={() => interactable && setFormData({ ...formData, rating: i + 1 })}
        className={`${interactable ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}`}
      >
        <Star 
          size={interactable ? 28 : 16} 
          className={`${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      </button>
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-green-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Customer Stories</h1>
        <p className="text-green-100 max-w-2xl mx-auto">
          See what our community has to say about their journey with Naturavya.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: REVIEWS LIST */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-xl text-center border border-dashed">
              <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-bold">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.customer_name}</h3>
                    <div className="flex text-sm">{renderStars(review.rating)}</div>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">"{review.comment}"</p>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: WRITE REVIEW FORM */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-6">
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
                <p className="text-sm text-gray-500 mb-4">Share your experience with us. Your review will be posted after moderation.</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="John Doe"
                    value={formData.customer_name}
                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-2 mb-2">
                    {renderStars(formData.rating, true)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Review</label>
                  <textarea 
                    required 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Tell us what you liked..."
                    value={formData.comment}
                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : <><Send size={18} /> Submit Review</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
                <p className="text-gray-500 mt-2">Your review has been submitted successfully and is pending approval.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-green-700 font-medium hover:underline"
                >
                  Write another review
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}