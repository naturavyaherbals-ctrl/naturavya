'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Package, Loader2, RefreshCw, MoreVertical, Image as ImageIcon 
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  inventory: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert('Failed to delete');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-500">Manage your inventory catalog</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No products found.</div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'} • Stock: {product.inventory}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right mr-4">
                      <p className="font-bold text-gray-900">₹{product.sale_price || product.price}</p>
                      {product.sale_price && <p className="text-xs text-gray-400 line-through">₹{product.price}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => { setShowModal(false); setEditingProduct(null); }} 
          onSuccess={() => { setShowModal(false); setEditingProduct(null); fetchProducts(); }} 
        />
      )}
    </div>
  );
}

// Modal Component
function ProductModal({ product, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || 0,
    salePrice: product?.sale_price || 0,
    inventory: product?.inventory || 0,
    category: product?.category || '',
    imageUrl: product?.image_url || '',
    description: product?.description || '',
    isActive: product?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = '/api/admin/products';
      const method = product ? 'PATCH' : 'POST';
      const body = product ? { ...formData, id: product.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed');
      onSuccess();
    } catch (err) {
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose}><Loader2 className="w-5 h-5 opacity-0" /></button> {/* spacer */}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input required className="w-full p-2 border rounded" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" required className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
              <input type="number" className="w-full p-2 border rounded" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Inventory</label>
              <input type="number" className="w-full p-2 border rounded" value={formData.inventory} onChange={e => setFormData({...formData, inventory: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input className="w-full p-2 border rounded" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea rows={3} className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}