import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if called from Admin (usually by a header or param)
    const isAdmin = searchParams.get('admin') === 'true';

    const filters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      // If admin, don't filter by active. If shop, only show active.
      isActive: isAdmin ? undefined : true 
    };

    const { products, total } = await productService.getProducts(filters);

    return NextResponse.json({
      success: true,
      products,
      total,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}