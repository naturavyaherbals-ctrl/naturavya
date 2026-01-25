import { createAdminClient } from '@/lib/supabase/admin';
import { getClient } from '@/lib/supabase/client';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '@/types/database';
import { cartService } from './cartService';

export interface CheckoutData {
  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Shipping Address
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  
  // Payment
  paymentMethod: PaymentMethod;
  
  // Optional
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
  private supabase = getClient();

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
    // Use admin client for order creation to bypass RLS
    const adminClient = createAdminClient();

    // Create order
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

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items
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

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Rollback order
      await adminClient.from('orders').delete().eq('id', order.id);
      throw new Error('Failed to create order items');
    }

    // Log initial status
    await adminClient.from('order_status_history').insert({
      order_id: order.id,
      status: 'pending',
      notes: 'Order placed',
    });

    return order as Order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) return null;
    return data as Order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        status_history:order_status_history(*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) return null;
    return data as Order;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data as Order[];
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string,
    updatedBy?: string
  ): Promise<Order | null> {
    const adminClient = createAdminClient();

    const updateData: Record<string, any> = { status };

    // Set timestamps based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmed_at = new Date().toISOString();
        break;
      case 'shipped':
        updateData.shipped_at = new Date().toISOString();
        break;
      case 'delivered':
        updateData.delivered_at = new Date().toISOString();
        if (updateData.payment_method === 'cod') {
          updateData.payment_status = 'cod_collected';
        }
        break;
      case 'cancelled':
        updateData.cancelled_at = new Date().toISOString();
        break;
    }

    const { data, error } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) return null;

    // Log status change
    await adminClient.from('order_status_history').insert({
      order_id: orderId,
      status,
      notes,
      created_by: updatedBy,
    });

    return data as Order;
  }

  async updateTracking(
    orderId: string,
    trackingNumber: string,
    courierName: string,
    trackingUrl?: string,
    estimatedDelivery?: string
  ): Promise<Order | null> {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        courier_name: courierName,
        tracking_url: trackingUrl || null,
        estimated_delivery: estimatedDelivery || null,
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) return null;
    return data as Order;
  }

  async getOrdersForAdmin(filters?: {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
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

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,shipping_name.ilike.%${filters.search}%,shipping_phone.ilike.%${filters.search}%`
      );
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return { orders: [], total: 0 };
    return { orders: data as Order[], total: count || 0 };
  }

  async getDashboardStats(): Promise<{
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const adminClient = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Today's orders
    const { count: todayOrders } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    // Today's revenue
    const { data: todayRevenueData } = await adminClient
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const todayRevenue = todayRevenueData?.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    ) || 0;

    // Pending orders
    const { count: pendingOrders } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total orders
    const { count: totalOrders } = await adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total revenue
    const { data: totalRevenueData } = await adminClient
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const totalRevenue = totalRevenueData?.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    ) || 0;

    const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return {
      todayOrders: todayOrders || 0,
      todayRevenue,
      pendingOrders: pendingOrders || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      averageOrderValue,
    };
  }
}

export const orderService = new OrderService();