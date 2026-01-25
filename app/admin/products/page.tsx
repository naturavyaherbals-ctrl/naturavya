'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, Package, Search, ImageIcon } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { formatCurrency } from '@/lib/utils/formatters';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // NOTE THE admin=true PARAMETER
      const response = await fetch(`/api/products?admin=true&page=${page}&limit=10&search=${search}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Product',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            {row.images?.[0] ? (
              <Image src={row.images[0].url} alt={row.name} width={40} height={40} className="object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: any) => <span>{formatCurrency(row.price)}</span>
    },
    {
      key: 'inventory',
      header: 'Stock',
      render: (row: any) => (
        <span className={row.inventory?.quantity <= 5 ? 'text-red-600 font-bold' : ''}>
          {row.inventory?.quantity || 0}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.is_active ? 'Active' : 'Draft'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${row.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}