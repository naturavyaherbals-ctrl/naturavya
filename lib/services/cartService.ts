import { getClient } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionId } from '@/lib/utils/helpers';

export class CartService {
  // Helper to get the correct client based on environment
  private async getSupabase() {
    if (typeof window === 'undefined') {
      return await createServerSupabaseClient();
    }
    return getClient();
  }

  async getOrCreateCart(userId?: string) {
    const supabase = await this.getSupabase();
    const sessionId = getSessionId();
    
    let query = supabase
      .from('carts')
      .select('*, items:cart_items(*, product:products(*, images:product_images(*)))')
      .single();

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart } = await query;
    if (existingCart) return existingCart;

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({
        user_id: userId || null,
        session_id: userId ? null : sessionId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return { ...newCart, items: [] };
  }

  async clearCart(cartId: string) {
    const supabase = await this.getSupabase();
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
  }
  
  // Apply the same 'const supabase = await this.getSupabase()' pattern 
  // to any other methods in this file (addToCart, updateCartItem, etc.)
}

export const cartService = new CartService();