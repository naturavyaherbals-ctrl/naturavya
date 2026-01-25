// ... existing imports ...
import { createAdminClient } from '@/lib/supabase/admin';

export class ProductService {
  // ... (keep other methods)

  async getProducts(filters?: {
    categoryId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: any[]; total: number }> {
    const adminClient = createAdminClient();
    
    // 1. Base Query - Fetch main product data first
    let query = adminClient
      .from('products')
      .select('id, name, slug, sku, price, compare_at_price, is_active, category_id, created_at', { count: 'exact' });

    // Handle is_active filter (Admin usually wants to see ALL, shop wants only TRUE)
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch products error:', error);
      return { products: [], total: 0 };
    }

    if (!products || products.length === 0) return { products: [], total: 0 };

    const ids = products.map(p => p.id);

    // 2. Fetch Images separately (Defensive)
    const { data: images } = await adminClient
      .from('product_images')
      .select('product_id, url, is_primary')
      .in('product_id', ids);

    // 3. Fetch Inventory separately
    const { data: inventory } = await adminClient
      .from('inventory')
      .select('product_id, quantity')
      .in('product_id', ids);

    // 4. Merge data
    const combined = products.map(product => ({
      ...product,
      images: images?.filter(img => img.product_id === product.id) || [],
      inventory: inventory?.find(inv => inv.product_id === product.id) || { quantity: 0 }
    }));

    return { products: combined, total: count || 0 };
  }
}

export const productService = new ProductService();