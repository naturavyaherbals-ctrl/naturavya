import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: Fetch all products
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { data: products, error } = await adminClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add Product
export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    const { data, error } = await adminClient
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        sale_price: body.salePrice ? parseFloat(body.salePrice) : null,
        sku: body.sku,
        inventory: parseInt(body.inventory || 0),
        category: body.category,
        image_url: body.imageUrl,
        is_active: body.isActive ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update Product
export async function PATCH(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    const { data, error } = await adminClient
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        sale_price: body.salePrice ? parseFloat(body.salePrice) : null,
        sku: body.sku,
        inventory: parseInt(body.inventory),
        category: body.category,
        image_url: body.imageUrl,
        is_active: body.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove Product
export async function DELETE(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await adminClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}