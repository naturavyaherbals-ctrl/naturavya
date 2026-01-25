import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch inventory with proper product data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const lowStockOnly = searchParams.get('lowStock') === 'true';
    const outOfStockOnly = searchParams.get('outOfStock') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 1. Fetch Products first (without deep joins to avoid relationship errors)
    let productQuery = adminClient
      .from('products')
      .select('id, sku, name, price, is_active', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      productQuery = productQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    productQuery = productQuery
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: products, error: productError, count } = await productQuery;

    if (productError) throw productError;

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        inventory: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        stats: { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalValue: 0 }
      });
    }

    const productIds = products.map(p => p.id);

    // 2. Fetch Images separately
    const { data: images } = await adminClient
      .from('product_images')
      .select('product_id, url, is_primary')
      .in('product_id', productIds)
      .eq('is_primary', true);

    // 3. Fetch Inventory separately
    const { data: inventoryData } = await adminClient
      .from('inventory')
      .select('*')
      .in('product_id', productIds);

    // 4. Merge Data manually (Safest way)
    let combinedData = products.map(product => {
      const inv = inventoryData?.find(i => i.product_id === product.id) || {
        quantity: 0,
        reserved_quantity: 0,
        low_stock_threshold: 10,
        track_inventory: true,
      };

      const img = images?.find(i => i.product_id === product.id);

      return {
        id: inv.id || product.id, // Fallback ID if inventory record doesn't exist
        product_id: product.id,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image_url: img?.url || null,
        },
        quantity: inv.quantity || 0,
        reserved_quantity: inv.reserved_quantity || 0,
        available_quantity: (inv.quantity || 0) - (inv.reserved_quantity || 0),
        low_stock_threshold: inv.low_stock_threshold || 10,
        track_inventory: inv.track_inventory !== false,
        is_low_stock: (inv.quantity || 0) <= (inv.low_stock_threshold || 10),
        is_out_of_stock: (inv.quantity || 0) === 0,
      };
    });

    // Apply filters in memory (since we paginated products, not inventory state)
    // Note: Ideally filters should be DB level, but this is a quick fix for the error
    if (lowStockOnly) {
      combinedData = combinedData.filter(item => item.is_low_stock && !item.is_out_of_stock);
    }

    if (outOfStockOnly) {
      combinedData = combinedData.filter(item => item.is_out_of_stock);
    }

    // Recalculate stats based on full inventory (simplified for now to just show current page stats to avoid huge queries)
    const totalProducts = combinedData.length;
    const lowStockCount = combinedData.filter(item => item.is_low_stock).length;
    const outOfStockCount = combinedData.filter(item => item.is_out_of_stock).length;
    const totalValue = combinedData.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

    return NextResponse.json({
      success: true,
      inventory: combinedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      stats: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalValue,
      },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// PUT - Update inventory
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, movementType, notes, lowStockThreshold } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get or create inventory record
    let { data: inventory } = await adminClient
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .is('variant_id', null)
      .single();

    if (!inventory) {
      // Create inventory record
      const { data: newInventory, error: createError } = await adminClient
        .from('inventory')
        .insert({
          product_id: productId,
          quantity: 0,
          reserved_quantity: 0,
          low_stock_threshold: lowStockThreshold || 10,
          track_inventory: true,
        })
        .select('*')
        .single();

      if (createError) throw createError;
      inventory = newInventory;
    }

    // Calculate new quantity based on movement type
    let newQuantity: number;
    let quantityChange: number;

    if (movementType === 'add') {
      newQuantity = (inventory.quantity || 0) + quantity;
      quantityChange = quantity;
    } else if (movementType === 'remove') {
      newQuantity = Math.max(0, (inventory.quantity || 0) - quantity);
      quantityChange = -quantity;
    } else if (movementType === 'set') {
      newQuantity = quantity;
      quantityChange = quantity - (inventory.quantity || 0);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid movement type' }, { status: 400 });
    }

    // Update inventory
    const updateData: Record<string, any> = { quantity: newQuantity };
    if (lowStockThreshold !== undefined) {
      updateData.low_stock_threshold = lowStockThreshold;
    }

    const { data: updatedInventory, error: updateError } = await adminClient
      .from('inventory')
      .update(updateData)
      .eq('id', inventory.id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Log movement
    await adminClient.from('inventory_movements').insert({
      product_id: productId,
      quantity_change: quantityChange,
      previous_quantity: inventory.quantity,
      new_quantity: newQuantity,
      movement_type: movementType,
      notes: notes || null,
      created_by: user.id,
    });

    return NextResponse.json({ success: true, inventory: updatedInventory });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update inventory' }, { status: 500 });
  }
}