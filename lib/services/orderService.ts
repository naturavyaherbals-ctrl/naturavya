import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClient } from '@/lib/supabase/client';
import { Order, OrderStatus, PaymentMethod } from '@/types/database';

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
  userId?: string;
  leadId?: string;
  source?: string;
}

export interface CartItemForOrder {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxAmount?: number;
}

export class OrderService {
  // Helper to get the correct client based on environment
  private async getSupabase() {
    if (typeof window === 'undefined') {
      return await createServerSupabaseClient();
    }
    return getClient();
  }

  async createOrder(
    checkoutData: CheckoutData,
    cartItems: CartItemForOrder[],
    totals: {
      subtotal: number;
      discount: number;
      shipping: number;
      tax: number;
      total: number;
    }
  ): Promise<Order> {
    // Use admin client for creation to ensure business logic bypasses RLS
    const adminClient = createAdminClient();

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        user_id: checkoutData.userId || null,
        lead_id: checkoutData.leadId || null,
        subtotal: totals.subtotal,
        discount_amount: totals.discount,
        shipping_amount: totals.shipping,
        tax_amount: totals.tax,
        total_amount: totals.total,
        payment_method: checkoutData.paymentMethod,
        payment_status: checkoutData.paymentMethod === 'cod' ? 'cod_pending' : 'pending',
        status: 'pending',
        shipping_name: checkoutData.customerName,
        shipping_phone: checkoutData.customerPhone,
        shipping_email: checkoutData.customerEmail || null,
        shipping_address_line1: checkoutData.shippingAddress.addressLine1,
        shipping_address_line2: checkoutData.shippingAddress.addressLine2 || null,
        shipping_city: checkoutData.shippingAddress.city,
        shipping_state: checkoutData.shippingAddress.state,
        shipping_pincode: checkoutData.shippingAddress.pincode,
        shipping_country: checkoutData.shippingAddress.country || 'India',
        source: checkoutData.source || 'website',
        notes: checkoutData.notes || null,
      })
      .select('*')
      .single();

    if (orderError) throw new Error('Failed to create order');

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      product_name: item.productName,
      variant_name: item.variantName || null,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount_amount: 0,
      tax_amount: item.taxAmount || 0,
      total_price: item.unitPrice * item.quantity,
    }));

    await adminClient.from('order_items').insert(orderItems);

    return order as Order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const supabase = await this.getSupabase();
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();
    return data as Order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const supabase = await this.getSupabase();
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data as Order[] || [];
  }

  async getOrdersForAdmin(filters?: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const adminClient = createAdminClient();
    
    let query = adminClient
      .from('orders')
      .select('*, items:order_items(*)', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,shipping_name.ilike.%${filters.search}%`
      );
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch error:', error);
      return { orders: [], total: 0 };
    }
    
    return { orders: data as Order[], total: count || 0 };
  }
}

export const orderService = new OrderService();