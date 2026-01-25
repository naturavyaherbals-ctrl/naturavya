import { createAdminClient } from '@/lib/supabase/admin';
import { getClient } from '@/lib/supabase/client';
import { Product, Category, Inventory } from '@/types/database';
import { slugify, generateSKU } from '@/lib/utils/helpers';

export class ProductService {
  private supabase = getClient();

  async getProducts(filters?: {
    categoryId?: string;
    categorySlug?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name';
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        inventory(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    } else {
      query = query.eq('is_active', true);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.categorySlug) {
      const { data: category } = await this.supabase
        .from('categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single();
      
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.isBestseller) {
      query = query.eq('is_bestseller', true);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
      );
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return { products: [], total: 0 };
    }

    return { products: data as Product[], total: count || 0 };
  }

  async getProduct(slugOrId: string): Promise<Product | null> {
    // Try by slug first
    let { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*),
        inventory(*)
      `)
      .eq('slug', slugOrId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Try by ID
      const result = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          inventory(*)
        `)
        .eq('id', slugOrId)
        .eq('is_active', true)
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) return null;
    return data as Product;
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { products } = await this.getProducts({
      isFeatured: true,
      limit,
    });
    return products;
  }

  async getBestsellers(limit = 8): Promise<Product[]> {
    const { products } = await this.getProducts({
      isBestseller: true,
      limit,
    });
    return products;
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    const product = await this.getProduct(productId);
    if (!product || !product.category_id) return [];

    const { products } = await this.getProducts({
      categoryId: product.category_id,
      limit: limit + 1, // Get extra in case current product is included
    });

    return products.filter((p) => p.id !== productId).slice(0, limit);
  }

  async createProduct(
    productData: {
      name: string;
      description?: string;
      shortDescription?: string;
      price: number;
      compareAtPrice?: number;
      costPrice?: number;
      categoryId?: string;
      brand?: string;
      weight?: number;
      weightUnit?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      isBestseller?: boolean;
      taxRate?: number;
      hsnCode?: string;
      tags?: string[];
      images?: { url: string; altText?: string; isPrimary?: boolean }[];
      initialStock?: number;
    }
  ): Promise<Product> {
    const adminClient = createAdminClient();

    const slug = slugify(productData.name);
    const sku = generateSKU(productData.name);

    // Check for duplicate slug
    const { data: existing } = await adminClient
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Create product
    const { data: product, error } = await adminClient
      .from('products')
      .insert({
        name: productData.name,
        slug: finalSlug,
        sku,
        description: productData.description || null,
        short_description: productData.shortDescription || null,
        price: productData.price,
        compare_at_price: productData.compareAtPrice || null,
        cost_price: productData.costPrice || null,
        category_id: productData.categoryId || null,
        brand: productData.brand || null,
        weight: productData.weight || null,
        weight_unit: productData.weightUnit || 'g',
        is_active: productData.isActive ?? true,
        is_featured: productData.isFeatured ?? false,
        is_bestseller: productData.isBestseller ?? false,
        tax_rate: productData.taxRate ?? 18,
        hsn_code: productData.hsnCode || null,
        tags: productData.tags || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    // Add images
    if (productData.images?.length) {
      const imageInserts = productData.images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.altText || productData.name,
        display_order: index,
        is_primary: img.isPrimary || index === 0,
      }));

      await adminClient.from('product_images').insert(imageInserts);
    }

    // Create inventory record
    await adminClient.from('inventory').insert({
      product_id: product.id,
      quantity: productData.initialStock || 0,
      reserved_quantity: 0,
      low_stock_threshold: 10,
      track_inventory: true,
    });

    return product as Product;
  }

  async updateProduct(
    productId: string,
    updates: Partial<{
      name: string;
      description: string;
      shortDescription: string;
      price: number;
      compareAtPrice: number;
      costPrice: number;
      categoryId: string;
      brand: string;
      weight: number;
      weightUnit: string;
      isActive: boolean;
      isFeatured: boolean;
      isBestseller: boolean;
      taxRate: number;
      hsnCode: string;
      tags: string[];
    }>
  ): Promise<Product | null> {
    const adminClient = createAdminClient();

    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
      updateData.slug = slugify(updates.name);
    }
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.shortDescription !== undefined) updateData.short_description = updates.shortDescription;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.compareAtPrice !== undefined) updateData.compare_at_price = updates.compareAtPrice;
    if (updates.costPrice !== undefined) updateData.cost_price = updates.costPrice;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.weightUnit !== undefined) updateData.weight_unit = updates.weightUnit;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.isBestseller !== undefined) updateData.is_bestseller = updates.isBestseller;
    if (updates.taxRate !== undefined) updateData.tax_rate = updates.taxRate;
    if (updates.hsnCode !== undefined) updateData.hsn_code = updates.hsnCode;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    const { data, error } = await adminClient
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select('*')
      .single();

    if (error) return null;
    return data as Product;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    const adminClient = createAdminClient();

    // Soft delete by setting is_active to false
    const { error } = await adminClient
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    return !error;
  }

  async updateInventory(
    productId: string,
    quantity: number,
    movementType: 'add' | 'remove' | 'set',
    notes?: string,
    userId?: string
  ): Promise<Inventory | null> {
    const adminClient = createAdminClient();

    // Get current inventory
    const { data: currentInventory } = await adminClient
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .is('variant_id', null)
      .single();

    if (!currentInventory) return null;

    let newQuantity: number;
    let quantityChange: number;

    switch (movementType) {
      case 'add':
        newQuantity = currentInventory.quantity + quantity;
        quantityChange = quantity;
        break;
      case 'remove':
        newQuantity = Math.max(0, currentInventory.quantity - quantity);
        quantityChange = -quantity;
        break;
      case 'set':
        newQuantity = quantity;
        quantityChange = quantity - currentInventory.quantity;
        break;
    }

    // Update inventory
    const { data: updatedInventory, error } = await adminClient
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', currentInventory.id)
      .select('*')
      .single();

    if (error) return null;

    // Log movement
    await adminClient.from('inventory_movements').insert({
      product_id: productId,
      quantity_change: quantityChange,
      previous_quantity: currentInventory.quantity,
      new_quantity: newQuantity,
      movement_type: movementType,
      notes,
      created_by: userId,
    });

    return updatedInventory as Inventory;
  }

  // Category methods
  async getCategories(activeOnly = true): Promise<Category[]> {
    let query = this.supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) return [];
    return data as Category[];
  }

  async getCategory(slugOrId: string): Promise<Category | null> {
    let { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slugOrId)
      .single();

    if (error || !data) {
      const result = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', slugOrId)
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) return null;
    return data as Category;
  }

  async createCategory(categoryData: {
    name: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<Category> {
    const adminClient = createAdminClient();

    const slug = slugify(categoryData.name);

    const { data, error } = await adminClient
      .from('categories')
      .insert({
        name: categoryData.name,
        slug,
        description: categoryData.description || null,
        image_url: categoryData.imageUrl || null,
        parent_id: categoryData.parentId || null,
        is_active: categoryData.isActive ?? true,
        display_order: categoryData.displayOrder ?? 0,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Category;
  }

  async updateCategory(
    categoryId: string,
    updates: Partial<{
      name: string;
      description: string;
      imageUrl: string;
      parentId: string;
      isActive: boolean;
      displayOrder: number;
    }>
  ): Promise<Category | null> {
    const adminClient = createAdminClient();

    const updateData: Record<string, any> = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
      updateData.slug = slugify(updates.name);
    }
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await adminClient
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error) return null;
    return data as Category;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('categories')
      .update({ is_active: false })
      .eq('id', categoryId);

    return !error;
  }
}

export const productService = new ProductService();