import { getClient } from '@/lib/supabase/client';
import { Cart, CartItem, Product } from '@/types/database';
import { getSessionId } from '@/lib/utils/helpers';

export class CartService {
  private supabase = getClient();

  async getOrCreateCart(userId?: string): Promise<Cart> {
    const sessionId = getSessionId();
    
    // Try to find existing cart
    let query = this.supabase
      .from('carts')
      .select('*, items:cart_items(*, product:products(*, images:product_images(*)))')
      .single();

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart } = await query;
    
    if (existingCart) {
      return existingCart as Cart;
    }

    // Create new cart
    const { data: newCart, error } = await this.supabase
      .from('carts')
      .insert({
        user_id: userId || null,
        session_id: userId ? null : sessionId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return { ...newCart, items: [] } as Cart;
  }

  async addToCart(
    productId: string,
    quantity: number,
    variantId?: string,
    userId?: string
  ): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);

    // Get product price
    const { data: product } = await this.supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Product not found');

    let price = product.price;

    // Get variant price if applicable
    if (variantId) {
      const { data: variant } = await this.supabase
        .from('product_variants')
        .select('price')
        .eq('id', variantId)
        .single();
      if (variant) price = variant.price;
    }

    // Check if item already exists
    const { data: existingItem } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select('*, product:products(*, images:product_images(*))')
        .single();

      if (error) throw error;
      return data as CartItem;
    }

    // Insert new item
    const { data, error } = await this.supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
        price_at_add: price,
      })
      .select('*, product:products(*, images:product_images(*))')
      .single();

    if (error) throw error;
    return data as CartItem;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem | null> {
    if (quantity < 1) {
      await this.removeCartItem(itemId);
      return null;
    }

    const { data, error } = await this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select('*, product:products(*, images:product_images(*))')
      .single();

    if (error) throw error;
    return data as CartItem;
  }

  async removeCartItem(itemId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  async clearCart(cartId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw error;
  }

  async applyCoupon(cartId: string, couponCode: string): Promise<{ 
    success: boolean; 
    discount: number; 
    message: string 
  }> {
    // Validate coupon
    const { data: coupon } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (!coupon) {
      return { success: false, discount: 0, message: 'Invalid coupon code' };
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { success: false, discount: 0, message: 'Coupon is not yet active' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { success: false, discount: 0, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { success: false, discount: 0, message: 'Coupon usage limit reached' };
    }

    // Get cart total
    const { data: cartItems } = await this.supabase
      .from('cart_items')
      .select('quantity, price_at_add')
      .eq('cart_id', cartId);

    const subtotal = cartItems?.reduce(
      (sum, item) => sum + item.price_at_add * item.quantity,
      0
    ) || 0;

    // Check minimum order amount
    if (subtotal < coupon.minimum_order_amount) {
      return {
        success: false,
        discount: 0,
        message: `Minimum order amount is ₹${coupon.minimum_order_amount}`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.maximum_discount_amount) {
        discount = Math.min(discount, coupon.maximum_discount_amount);
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }

    // Apply coupon to cart
    await this.supabase
      .from('carts')
      .update({
        coupon_code: couponCode.toUpperCase(),
        discount_amount: discount,
      })
      .eq('id', cartId);

    return {
      success: true,
      discount,
      message: `Coupon applied! You save ₹${discount}`,
    };
  }

  async removeCoupon(cartId: string): Promise<void> {
    await this.supabase
      .from('carts')
      .update({
        coupon_code: null,
        discount_amount: 0,
      })
      .eq('id', cartId);
  }

  async mergeGuestCart(sessionId: string, userId: string): Promise<void> {
    // Get guest cart
    const { data: guestCart } = await this.supabase
      .from('carts')
      .select('*, items:cart_items(*)')
      .eq('session_id', sessionId)
      .single();

    if (!guestCart || !guestCart.items?.length) return;

    // Get or create user cart
    const userCart = await this.getOrCreateCart(userId);

    // Merge items
    for (const item of guestCart.items) {
      await this.addToCart(
        item.product_id,
        item.quantity,
        item.variant_id || undefined,
        userId
      );
    }

    // Delete guest cart
    await this.supabase.from('carts').delete().eq('id', guestCart.id);
  }
}

export const cartService = new CartService();