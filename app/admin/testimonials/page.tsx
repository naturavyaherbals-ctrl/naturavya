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
  X
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

interface Testimonial {
  id: string;
  customer_name: string;
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
  show_on_homepage: boolean;
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
    customerName: '',
    customerTitle: '',
    customerCompany: '',
    customerLocation: '',
    customerAvatarUrl: '',
    content: '',
    shortQuote: '',
    rating: 5,
    imageUrl: '',
    videoUrl: '',
    status: 'published' as 'draft' | 'published' | 'archived',
    isFeatured: false,
    showOnHomepage: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/testimonials');
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
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials';

      const response = await fetch(url, {
        method: editingTestimonial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      customerName: testimonial.customer_name || '',
      customerTitle: testimonial.customer_title || '',
      customerCompany: testimonial.customer_company || '',
      customerLocation: testimonial.customer_location || '',
      customerAvatarUrl: testimonial.customer_avatar_url || '',
      content: testimonial.content || '',
      shortQuote: testimonial.short_quote || '',
      rating: testimonial.rating || 5,
      imageUrl: testimonial.image_url || '',
      videoUrl: testimonial.video_url || '',
      status: testimonial.status || 'published',
      isFeatured: testimonial.is_featured || false,
      showOnHomepage: testimonial.show_on_homepage || false,
      displayOrder: testimonial.display_order || 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleStatus = async (testimonial: Testimonial) => {
    const newStatus = testimonial.status === 'published' ? 'draft' : 'published';
    
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerTitle: '',
      customerCompany: '',
      customerLocation: '',
      customerAvatarUrl: '',
      content: '',
      shortQuote: '',
      rating: 5,
      imageUrl: '',
      videoUrl: '',
      status: 'published',
      isFeatured: false,
      showOnHomepage: true,
      displayOrder: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials for your website</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTestimonial(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Total Testimonials</p>
          <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {testimonials.filter(t => t.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-purple-600">
            {testimonials.filter(t => t.is_featured).length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No testimonials yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            Create your first testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col ${
                testimonial.status !== 'published' ? 'opacity-60' : ''
              }`}
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.customer_avatar_url ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={testimonial.customer_avatar_url}
                          alt={testimonial.customer_name || 'Customer'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-gray-600">
                          {/* SAFE ACCESS: Optional chaining and fallback for charAt */}
                          {testimonial.customer_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {testimonial.customer_name || 'Anonymous Customer'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {testimonial.customer_title || ''}
                        {testimonial.customer_title && testimonial.customer_company ? ' at ' : ''}
                        {testimonial.customer_company || ''}
                      </p>
                    </div>
                  </div>
                  
                  {testimonial.is_featured && (
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  )}
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (testimonial.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 line-clamp-4 mb-4 italic text-sm">
                  {testimonial.content ? `"${testimonial.content}"` : 'No content provided.'}
                </p>

                {testimonial.customer_location && (
                  <p className="text-xs text-gray-400 mb-4">{testimonial.customer_location}</p>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    testimonial.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : testimonial.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {testimonial.status || 'draft'}
                  </span>
                  {testimonial.show_on_homepage && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                      Home
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(testimonial)}
                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                    title={testimonial.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {testimonial.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title/Position
                  </label>
                  <input
                    type="text"
                    value={formData.customerTitle}
                    onChange={(e) => setFormData({ ...formData, customerTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., CEO, Entrepreneur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.customerCompany}
                    onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.customerLocation}
                    onChange={(e) => setFormData({ ...formData, customerLocation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.customerAvatarUrl}
                    onChange={(e) => setFormData({ ...formData, customerAvatarUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonial Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Write the testimonial content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    min={0}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.showOnHomepage}
                      onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">Show on Home</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTestimonial(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingTestimonial ? 'Update Changes' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}