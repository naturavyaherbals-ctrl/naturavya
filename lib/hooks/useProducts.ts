'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '@/types/database';

interface UseProductsOptions {
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
  limit?: number;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true, limit = 12, ...filters } = options;

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
      if (filters.featured) params.set('featured', 'true');
      if (filters.bestseller) params.set('bestseller', 'true');
      if (filters.search) params.set('search', filters.search);
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', pageNum.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(append ? [...products, ...data.products] : data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(pageNum);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Products fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit, products]);

  const loadMore = useCallback(async () => {
    if (page < totalPages && !isLoading) {
      await fetchProducts(page + 1, true);
    }
  }, [page, totalPages, isLoading, fetchProducts]);

  const refresh = useCallback(async () => {
    await fetchProducts(1, false);
  }, [fetchProducts]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1, false);
    }
  }, [
    filters.categoryId,
    filters.categorySlug,
    filters.featured,
    filters.bestseller,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
  ]);

  return {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchProducts: () => fetchProducts(1, false),
    loadMore,
    hasMore: page < totalPages,
    setPage: (p: number) => fetchProducts(p, false),
    refresh,
  };
}

export function useProduct(slugOrId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${slugOrId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product');
        console.error('Product fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (slugOrId) {
      fetchProduct();
    }
  }, [slugOrId]);

  return { product, isLoading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          setError(data.error || 'Failed to fetch categories');
        }
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Categories fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}