'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileText, Image as ImageIcon, Eye, Plus, Trash2, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function PageManagementPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Matches DB snake_case)
  const [imageFormData, setImageFormData] = useState({
    name: '',
    image_url: '',
    section: 'hero',
    position: 'center',
    alt_text: '',
    link_url: '',
    mobile_image_url: '',
    is_active: true
  });

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      if (data.success) {
        setPages(data.pages);
        // Update selected page reference if it exists
        if (selectedPage) {
          const updated = data.pages.find((p: any) => p.id === selectedPage.id);
          setSelectedPage(updated);
        }
      }
    } catch (err) {
      toast.error('Failed to fetch pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: selectedPage.id,
          image_data: {
            ...imageFormData,
            display_order: selectedPage.images?.length || 0
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Image added successfully');
        setShowImageModal(false);
        setImageFormData({ name: '', image_url: '', section: 'hero', position: 'center', alt_text: '', link_url: '', mobile_image_url: '', is_active: true });
        fetchPages();
      }
    } catch (err) {
      toast.error('Failed to add image');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: selectedPage.id,
          image_id: imageId,
          action: 'delete'
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Image deleted');
        fetchPages();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500">Manage assets and images for public pages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Pages */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex items-center gap-2">
            <FileText size={18} /> Pages
          </div>
          <div className="divide-y">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full p-4 text-left hover:bg-green-50 transition-all ${
                  selectedPage?.id === page.id ? 'bg-green-50 border-r-4 border-green-600' : ''
                }`}
              >
                <p className="font-bold text-gray-900">{page.title}</p>
                <p className="text-xs text-gray-400">/{page.slug}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                   <ImageIcon size={12} /> {page.images?.length || 0} Assets
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main: Image Grid */}
        <div className="lg:col-span-3">
          {selectedPage ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800">{selectedPage.title} Assets</h2>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                >
                  <Plus size={18} /> Add New Asset
                </button>
              </div>

              {selectedPage.images?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPage.images.sort((a:any, b:any) => a.display_order - b.display_order).map((image: any) => (
                    <div key={image.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm group">
                      <div className="relative aspect-video bg-gray-100">
                        <Image src={image.image_url} alt={image.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                           <a href={image.image_url} target="_blank" className="p-2 bg-white rounded-full hover:scale-110 transition-transform"><ExternalLink size={18} /></a>
                           <button onClick={() => handleDeleteImage(image.id)} className="p-2 bg-white text-red-600 rounded-full hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-900">{image.name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {image.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">{image.section}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed rounded-3xl p-20 text-center text-gray-400">
                   <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                   <p>No assets found for this page.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-3xl p-20 text-gray-400">
               Select a page from the sidebar to manage images.
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Add Asset to {selectedPage.title}</h2>
              <button onClick={() => setShowImageModal(false)} className="p-2 hover:bg-gray-200 rounded-full"><X /></button>
            </div>

            <form onSubmit={handleAddImage} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <input 
                placeholder="Asset Name (e.g. Summer Sale Banner)" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={imageFormData.name}
                onChange={e => setImageFormData({...imageFormData, name: e.target.value})}
                required
              />
              <input 
                placeholder="Image URL (HTTPS)" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                value={imageFormData.image_url}
                onChange={e => setImageFormData({...imageFormData, image_url: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="p-3 border rounded-xl bg-white"
                  value={imageFormData.section}
                  onChange={e => setImageFormData({...imageFormData, section: e.target.value})}
                >
                  <option value="hero">Hero Section</option>
                  <option value="gallery">Gallery</option>
                  <option value="banner">Banner</option>
                </select>
                <select 
                  className="p-3 border rounded-xl bg-white"
                  value={imageFormData.position}
                  onChange={e => setImageFormData({...imageFormData, position: e.target.value})}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <textarea 
                placeholder="Alt Text (SEO)" 
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 h-24"
                value={imageFormData.alt_text}
                onChange={e => setImageFormData({...imageFormData, alt_text: e.target.value})}
              />

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowImageModal(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}