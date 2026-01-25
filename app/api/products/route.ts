import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if called from Admin (passed as a query param)
    const isAdmin = searchParams.get('admin') === 'true';

    const filters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      // IMPORTANT: If admin, show ALL. If shop, show only ACTIVE.
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