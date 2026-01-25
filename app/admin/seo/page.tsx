'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  FileText,
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface SEOSettings {
  id: string;
  page_type: string;
  page_identifier: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string;
}

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
}

const PAGE_TYPES = [
  { value: 'home', label: 'Homepage' },
  { value: 'products', label: 'Products Page' },
  { value: 'product', label: 'Single Product' },
  { value: 'category', label: 'Category Page' },
  { value: 'cart', label: 'Cart Page' },
  { value: 'checkout', label: 'Checkout Page' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'blog', label: 'Blog Page' },
  { value: 'custom', label: 'Custom Page' },
];

export default function SEOManagementPage() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pages' | 'global' | 'redirects'>('pages');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSettings, setEditingSettings] = useState<SEOSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pageType: 'home',
    pageIdentifier: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    canonicalUrl: '',
    robots: 'index, follow',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [seoResponse, pagesResponse] = await Promise.all([
        fetch('/api/admin/seo'),
        fetch('/api/admin/pages'),
      ]);

      const seoData = await seoResponse.json();
      const pagesData = await pagesResponse.json();

      if (seoData.success) {
        setSeoSettings(seoData.seoSettings);
      }
      if (pagesData.success) {
        setPages(pagesData.pages);
      }
    } catch (err) {
      console.error('Failed to fetch SEO data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (settings: SEOSettings) => {
    setEditingSettings(settings);
    setFormData({
      pageType: settings.page_type,
      pageIdentifier: settings.page_identifier || '',
      metaTitle: settings.meta_title || '',
      metaDescription: settings.meta_description || '',
      metaKeywords: settings.meta_keywords?.join(', ') || '',
      ogTitle: settings.og_title || '',
      ogDescription: settings.og_description || '',
      ogImageUrl: settings.og_image_url || '',
      canonicalUrl: settings.canonical_url || '',
      robots: settings.robots || 'index, follow',
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          metaKeywords: formData.metaKeywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingSettings(null);
        resetForm();
        fetchData();
      } else {
        alert(data.error || 'Failed to save SEO settings');
      }
    } catch (err) {
      console.error('SEO save error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pageType: 'home',
      pageIdentifier: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImageUrl: '',
      canonicalUrl: '',
      robots: 'index, follow',
    });
  };

  const getTitleLength = (title: string) => {
    const len = title.length;
    if (len === 0) return { color: 'text-gray-400', text: 'Not set' };
    if (len < 30) return { color: 'text-yellow-600', text: `${len}/60 - Too short` };
    if (len <= 60) return { color: 'text-green-600', text: `${len}/60 - Good` };
    return { color: 'text-red-600', text: `${len}/60 - Too long` };
  };

  const getDescriptionLength = (desc: string) => {
    const len = desc.length;
    if (len === 0) return { color: 'text-gray-400', text: 'Not set' };
    if (len < 120) return { color: 'text-yellow-600', text: `${len}/160 - Too short` };
    if (len <= 160) return { color: 'text-green-600', text: `${len}/160 - Good` };
    return { color: 'text-red-600', text: `${len}/160 - Too long` };
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-600 mt-1">Optimize your website for search engines</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSettings(null);
            setShowEditModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add SEO Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'pages', label: 'Page SEO', icon: FileText },
            { id: 'global', label: 'Global Settings', icon: Globe },
            { id: 'redirects', label: 'Redirects', icon: ExternalLink },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Page SEO Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* SEO Overview for Pages */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Page SEO Settings</h2>
            </div>
            
            {pages.length === 0 && seoSettings.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No SEO settings configured yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {pages.map((page) => {
                  const pageSeo = seoSettings.find(
                    s => s.page_type === page.slug || s.page_identifier === page.slug
                  );
                  
                  return (
                    <div key={page.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{page.title}</h3>
                            <span className="text-sm text-gray-500">/{page.slug}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              page.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {page.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 w-24">Title:</span>
                              <span className="text-gray-900">
                                {page.meta_title || pageSeo?.meta_title || 'Not set'}
                              </span>
                              {(page.meta_title || pageSeo?.meta_title) && (
                                <span className={getTitleLength(page.meta_title || pageSeo?.meta_title || '').color}>
                                  ({getTitleLength(page.meta_title || pageSeo?.meta_title || '').text})
                                </span>
                              )}
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 w-24 flex-shrink-0">Description:</span>
                              <span className="text-gray-900 line-clamp-2">
                                {page.meta_description || pageSeo?.meta_description || 'Not set'}
                              </span>
                            </div>
                          </div>

                          {!page.meta_title && !pageSeo?.meta_title && (
                            <div className="flex items-center gap-2 mt-2 text-yellow-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">SEO optimization needed</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            const settings = pageSeo || {
                              id: '',
                              page_type: page.slug,
                              page_identifier: page.slug,
                              meta_title: page.meta_title,
                              meta_description: page.meta_description,
                              meta_keywords: null,
                              og_title: null,
                              og_description: null,
                              og_image_url: null,
                              canonical_url: null,
                              robots: 'index, follow',
                            };
                            handleEdit(settings);
                          }}
                          className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          Edit SEO
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Additional SEO Settings not linked to pages */}
                {seoSettings
                  .filter(s => !pages.find(p => p.slug === s.page_type || p.slug === s.page_identifier))
                  .map((settings) => (
                    <div key={settings.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900 capitalize">{settings.page_type}</h3>
                            {settings.page_identifier && (
                              <span className="text-sm text-gray-500">{settings.page_identifier}</span>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 w-24">Title:</span>
                              <span className="text-gray-900">{settings.meta_title || 'Not set'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 w-24 flex-shrink-0">Description:</span>
                              <span className="text-gray-900 line-clamp-2">
                                {settings.meta_description || 'Not set'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEdit(settings)}
                          className="px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          Edit SEO
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Global SEO Settings</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Title Suffix
                </label>
                <input
                  type="text"
                  placeholder="| Naturavya Herbals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Appended to all page titles (e.g., "Products | Naturavya Herbals")
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  placeholder="Naturavya Herbals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                placeholder="Shop premium Ayurvedic and herbal products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default OG Image URL
              </label>
              <input
                type="url"
                placeholder="https://naturavya.com/og-image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default image for social sharing (1200x630px recommended)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  placeholder="XXXXXXXXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Robots.txt Content
              </label>
              <textarea
                rows={5}
                placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://naturavya.com/sitemap.xml"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
              />
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Save Global Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirects Tab */}
      {activeTab === 'redirects' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">URL Redirects</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />
              Add Redirect
            </button>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No redirects configured</p>
            <p className="text-sm text-gray-400 mt-1">Add 301/302 redirects for old URLs</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingSettings?.id ? 'Edit SEO Settings' : 'Add SEO Settings'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Type
                  </label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {PAGE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.pageIdentifier}
                    onChange={(e) => setFormData({ ...formData, pageIdentifier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Slug or ID (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Page title for search engines"
                  maxLength={70}
                />
                <p className={`text-xs mt-1 ${getTitleLength(formData.metaTitle).color}`}>
                  {getTitleLength(formData.metaTitle).text}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Brief description for search results"
                  maxLength={170}
                />
                <p className={`text-xs mt-1 ${getDescriptionLength(formData.metaDescription).color}`}>
                  {getDescriptionLength(formData.metaDescription).text}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Open Graph (Social Sharing)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Leave empty to use meta title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OG Description
                    </label>
                    <textarea
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Leave empty to use meta description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.ogImageUrl}
                      onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Advanced</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.canonicalUrl}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Robots
                    </label>
                    <select
                      value={formData.robots}
                      onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">No Index, Follow</option>
                      <option value="index, nofollow">Index, No Follow</option>
                      <option value="noindex, nofollow">No Index, No Follow</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSettings(null);
                    resetForm();
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
                  {isSubmitting ? 'Saving...' : 'Save SEO Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}