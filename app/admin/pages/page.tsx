'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FileText,
  Image as ImageIcon,
  Edit,
  Eye,
  Plus,
  Trash2,
  Upload,
  X,
  GripVertical,
} from 'lucide-react';

interface PageImage {
  id: string;
  name: string;
  image_url: string;
  section: string | null;
  position: string | null;
  alt_text: string | null;
  is_active: boolean;
  display_order: number;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  images: PageImage[];
}

export default function PageManagementPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFormData, setImageFormData] = useState({
    name: '',
    imageUrl: '',
    section: 'hero',
    position: 'center',
    altText: '',
    linkUrl: '',
    mobileImageUrl: '',
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/pages');
      const data = await response.json();

      if (data.success) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
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
          id: selectedPage.id,
          images: [
            ...selectedPage.images,
            {
              name: imageFormData.name,
              imageUrl: imageFormData.imageUrl,
              section: imageFormData.section,
              position: imageFormData.position,
              altText: imageFormData.altText,
              linkUrl: imageFormData.linkUrl,
              mobileImageUrl: imageFormData.mobileImageUrl,
              displayOrder: selectedPage.images.length,
              isActive: true,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPage(data.page);
        setShowImageModal(false);
        resetImageForm();
        fetchPages();
      }
    } catch (err) {
      console.error('Add image error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedPage || !confirm('Delete this image?')) return;

    try {
      const updatedImages = selectedPage.images.filter(img => img.id !== imageId);
      
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPage.id,
          images: updatedImages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPage(data.page);
        fetchPages();
      }
    } catch (err) {
      console.error('Delete image error:', err);
    }
  };

  const resetImageForm = () => {
    setImageFormData({
      name: '',
      imageUrl: '',
      section: 'hero',
      position: 'center',
      altText: '',
      linkUrl: '',
      mobileImageUrl: '',
    });
  };

  const SECTIONS = [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'banner', label: 'Banner' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'feature', label: 'Feature' },
    { value: 'testimonial', label: 'Testimonial Background' },
    { value: 'cta', label: 'Call to Action' },
    { value: 'background', label: 'Background' },
    { value: 'other', label: 'Other' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Page & Image Management</h1>
        <p className="text-gray-600 mt-1">Manage images for each page of your website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Pages</h2>
          </div>
          <div className="divide-y">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handleSelectPage(page)}
                className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPage?.id === page.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{page.title}</p>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {page.images?.length || 0} images
                    </span>
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Page Images */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedPage.title} Images</h2>
                  <p className="text-sm text-gray-500">Manage images for this page</p>
                </div>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              {selectedPage.images?.length > 0 ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPage.images.map((image) => (
                    <div
                      key={image.id}
                      className="border rounded-lg overflow-hidden group"
                    >
                      <div className="relative aspect-video bg-gray-100">
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || image.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(image.image_url, '_blank')}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-900 truncate">{image.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {image.section || 'No section'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            image.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {image.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No images for this page</p>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium"
                  >
                    Add first image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a page to manage its images</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Image Modal */}
      {showImageModal && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowImageModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Image to {selectedPage.title}</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Name *
                </label>
                <input
                  type="text"
                  value={imageFormData.name}
                  onChange={(e) => setImageFormData({ ...imageFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Hero Banner Main"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={imageFormData.imageUrl}
                  onChange={(e) => setImageFormData({ ...imageFormData, imageUrl: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload to media library first, then paste URL here
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    value={imageFormData.section}
                    onChange={(e) => setImageFormData({ ...imageFormData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {SECTIONS.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    value={imageFormData.position}
                    onChange={(e) => setImageFormData({ ...imageFormData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="background">Background</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={imageFormData.altText}
                  onChange={(e) => setImageFormData({ ...imageFormData, altText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageFormData.linkUrl}
                  onChange={(e) => setImageFormData({ ...imageFormData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageFormData.mobileImageUrl}
                  onChange={(e) => setImageFormData({ ...imageFormData, mobileImageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Different image for mobile devices
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageModal(false);
                    resetImageForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}