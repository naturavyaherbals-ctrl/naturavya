'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Quote,
  Loader2,
  X,
  MapPin,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

// 1. Updated Interface to match the Database exactly
interface Testimonial {
  id: string;
  name: string;
  client_name?: string;
  customer_title: string | null;
  customer_company: string | null;
  customer_location: string | null;
  customer_avatar_url: string | null;
  content: string;
  short_quote: string | null;
  rating: number | null;
  image_url: string | null;
  video_url: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    customer_title: '',
    customer_company: '',
    customer_location: '',
    customer_avatar_url: '',
    content: '',
    short_quote: '',
    rating: 5,
    status: 'published' as any,
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/testimonials');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/admin/testimonials';
      // If editing, you'd usually use a PUT to [id], but we can handle it via payload or separate route
      const method = editingTestimonial ? 'PATCH' : 'POST'; 
      
      const payload = editingTestimonial 
        ? { ...formData, id: editingTestimonial.id } 
        : formData;

      const response = await fetch(url, {
        method: 'POST', // Keeping POST for simplicity as your route handles inserts
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setEditingTestimonial(null);
        resetForm();
        fetchTestimonials();
      } else {
        alert(data.error || 'Failed to save testimonial');
      }
    } catch (err) {
      console.error('Testimonial save error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const response = await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
      if (response.ok) fetchTestimonials();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      customer_title: '',
      customer_company: '',
      customer_location: '',
      customer_avatar_url: '',
      content: '',
      short_quote: '',
      rating: 5,
      status: 'published',
      is_featured: false,
      display_order: 0,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500">Manage customer reviews and social proof</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingTestimonial(null); setShowModal(true); }}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"
        >
          <Plus size={20} /> Add Testimonial
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border">
                      {t.customer_avatar_url ? (
                        <Image src={t.customer_avatar_url} alt={t.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full font-bold text-gray-400 uppercase">
                          {t.name?.charAt(0) || t.client_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-none mb-1">
                        {t.name || t.client_name || 'Anonymous'}
                      </h3>
                      <p className="text-xs text-gray-500">{t.customer_title || 'Customer'}</p>
                    </div>
                  </div>
                  {t.is_featured && <Star size={16} className="text-amber-400 fill-amber-400" />}
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < (t.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                  ))}
                </div>

                <p className="text-gray-600 text-sm italic line-clamp-4 mb-4">"{t.content}"</p>
                
                <div className="space-y-1">
                  {t.customer_company && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Building size={12} /> {t.customer_company}
                    </div>
                  )}
                  {t.customer_location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={12} /> {t.customer_location}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {t.status}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">Add Testimonial</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Customer Name *</label>
                  <input required className="w-full p-3 border rounded-xl bg-gray-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Designation</label>
                  <input className="w-full p-3 border rounded-xl bg-gray-50" placeholder="CEO, User, etc." value={formData.customer_title} onChange={e => setFormData({...formData, customer_title: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Company</label>
                  <input className="w-full p-3 border rounded-xl bg-gray-50" value={formData.customer_company} onChange={e => setFormData({...formData, customer_company: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location</label>
                  <input className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Indore, India" value={formData.customer_location} onChange={e => setFormData({...formData, customer_location: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Avatar URL</label>
                  <input className="w-full p-3 border rounded-xl bg-gray-50" placeholder="https://..." value={formData.customer_avatar_url} onChange={e => setFormData({...formData, customer_avatar_url: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Review Content *</label>
                  <textarea required rows={4} className="w-full p-3 border rounded-xl bg-gray-50" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Rating (1-5)</label>
                  <input type="number" min="1" max="5" className="w-full p-3 border rounded-xl bg-gray-50" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="feat" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                  <label htmlFor="feat" className="text-sm font-bold text-gray-700">Featured</label>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}