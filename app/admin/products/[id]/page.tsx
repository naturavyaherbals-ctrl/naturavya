'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2, 
  Plus, 
  X, 
  Upload,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    description: '',
    sku: '',
    compareAtPrice: '',
    isActive: true
  });

  useEffect(() => {
    fetchInitialData();
  }, [productId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Categories first
      const catRes = await fetch('/api/categories?activeOnly=false');
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.categories);
      }

      // 2. Fetch Product Details
      const prodRes = await fetch(`/api/products/${productId}`);
      const prodData = await prodRes.json();
      
      if (prodData.success) {
        const p = prodData.product;
        setFormData({
          name: p.name || '',
          price: p.price?.toString() || '',
          stockQuantity: p.inventory?.[0]?.quantity?.toString() || '0',
          categoryId: p.category_id || '',
          description: p.description || '',
          sku: p.sku || '',
          compareAtPrice: p.compare_at_price?.toString() || '',
          isActive: p.is_active
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId,
          description: formData.description,
          sku: formData.sku,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          isActive: formData.isActive
          // Note: Inventory update usually happens via a separate inventory API call 
          // or is handled by the server in this PUT request.
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                title="Use Inventory page to update stock"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button type="button" className="text-red-600 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg">
            <Trash2 className="w-4 h-4" />
            Delete Product
          </button>
          
          <div className="flex gap-3">
            <Link href="/admin/products" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}