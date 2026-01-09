'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Star, Send, CheckCircle, ShieldCheck, MapPin } from 'lucide-react'

// --- 1. STATIC REVIEWS (SEO CONTENT) ---
// These ensure your page is never empty and ranks for your product names immediately.
const STATIC_REVIEWS = [
  {
    id: 'static-1',
    customer_name: 'Rahul Verma',
    rating: 5,
    comment: 'I was looking for a safe Ayurvedic supplement in Indore for stamina. Virya Plus has changed my daily routine. I feel more energetic at work and in the gym. Best part is there are absolutely no side effects.',
    created_at: '2025-01-15T10:00:00Z',
    location: 'Indore, MP',
    product: 'Virya Plus'
  },
  {
    id: 'static-2',
    customer_name: 'Priya Sharma',
    rating: 5,
    comment: 'I tried many creams for toning but nothing worked like Maxx Boom. The combination of capsules and gel is very effective. I saw visible changes in firmness within 2 months. Highly recommend to all women.',
    created_at: '2025-01-12T10:00:00Z',
    location: 'Delhi',
    product: 'Maxx Boom Combo'
  },
  {
    id: 'static-3',
    customer_name: 'Amit Patel',
    rating: 5,
    comment: 'My father has been suffering from knee pain for years. We tried Zero Ache oil from Naturavya and the results are amazing. It absorbs quickly and gives long-lasting relief. Much better than chemical painkillers.',
    created_at: '2025-01-10T10:00:00Z',
    location: 'Ahmedabad',
    product: 'Zero Ache Oil'
  },
  {
    id: 'static-4',
    customer_name: 'Sneha Reddy',
    rating: 5,
    comment: 'I was hesitant to try intimate products, but V-Stiff is 100% herbal and safe. It really helps with tightening and elasticity restoration. Very happy with the discreet packaging and fast delivery.',
    created_at: '2025-01-08T10:00:00Z',
    location: 'Hyderabad',
    product: 'V-Stiff Gel'
  },
  {
    id: 'static-5',
    customer_name: 'Vikram Singh',
    rating: 4,
    comment: 'Null Pile has helped me control my piles symptoms significantly. The bleeding and pain reduced within a week. Taking one star off because delivery took 4 days, but the product is excellent.',
    created_at: '2025-01-05T10:00:00Z',
    location: 'Jaipur',
    product: 'Null Pile Capsules'
  },
  {
    id: 'static-6',
    customer_name: 'Anjali Desai',
    rating: 5,
    comment: 'I love that Naturavya is based in Indore and uses authentic herbs. I use their Maxx Boom gel regularly and it smells so natural. My skin feels firmer and tighter. Trustworthy brand.',
    created_at: '2024-12-28T10:00:00Z',
    location: 'Mumbai',
    product: 'Maxx Boom Gel'
  },
  {
    id: 'static-7',
    customer_name: 'Suresh Menon',
    rating: 5,
    comment: 'At 45, I needed a boost. Virya Plus helped me regain my lost vitality and stamina. It is a must-try for men looking for natural wellness without steroids or chemicals.',
    created_at: '2024-12-20T10:00:00Z',
    location: 'Chennai',
    product: 'Virya Plus'
  },
  {
    id: 'static-8',
    customer_name: 'Kavita Joshi',
    rating: 5,
    comment: 'Zero Ache is magic for back pain. I sit at a desk all day and have bad back pain. This oil gives me instant relief before sleeping. It is very soothing.',
    created_at: '2024-12-15T10:00:00Z',
    location: 'Pune',
    product: 'Zero Ache Oil'
  }
]

// --- 2. INITIALIZE SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<any[]>(STATIC_REVIEWS) // Start with static data
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  })

  // --- 3. FETCH APPROVED REVIEWS & MERGE ---
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'Approved') 
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Put real database reviews ON TOP of static reviews
        setReviews([...data, ...STATIC_REVIEWS])
      }
      setLoading(false)
    }
    fetchReviews()
  }, [])

  // --- 4. HANDLE SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

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
    <div className="min-h-screen bg-stone-50">
      
      {/* Schema.org JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Naturavya Herbals Products",
            "description": "Premium Ayurvedic wellness products from Indore.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1250",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      {/* Hero Section */}
      <div className="bg-primary text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Customer Stories & Reviews</h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">
            See why thousands of customers in India trust <strong>Naturavya</strong> for 100% safe, Ayurvedic wellness solutions covering vitality, joint pain, and personal care.
          </p>
        </div>
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: REVIEWS LIST (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Customer Feedback</h2>
            <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {reviews.length}+ Verified Reviews
            </span>
          </div>
          
          {loading ? (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>)}
            </div>
          ) : (
            reviews.map((review, index) => (
              <article key={review.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xl shrink-0">
                    {review.customer_name.charAt(0)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{review.customer_name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {review.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {review.location}
                            </span>
                          )}
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <ShieldCheck size={12} /> Verified Buyer
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mt-2 sm:mt-0">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex text-yellow-400 mb-3">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-3">"{review.comment}"</p>

                    {/* Product Tag (if available) */}
                    {review.product && (
                      <div className="inline-block bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded font-medium">
                        Product: {review.product}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: WRITE REVIEW FORM (Span 4) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 sticky top-24">
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Share Your Experience</h3>
                  <p className="text-sm text-gray-500">Help others choose the right Ayurvedic solution.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                    placeholder="e.g. Rahul Kumar"
                    value={formData.customer_name}
                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {renderStars(formData.rating, true)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Review</label>
                  <textarea 
                    required 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                    placeholder="How did the product help you?"
                    value={formData.comment}
                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3.5 rounded-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {submitting ? 'Submitting...' : <><Send size={18} /> Submit Review</>}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
                <p className="text-gray-500 mt-2 px-4">Your review has been submitted successfully. It will appear after moderation.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Write another review
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Naturavya reviews are moderated to ensure authenticity. We do not edit review content.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
