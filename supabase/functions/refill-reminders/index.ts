import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'delivered')
      .eq('refill_reminder_sent', false)
      .lte('refill_due_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('refill_due_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    const results = [];

    for (const order of orders || []) {
      await supabase
        .from('orders')
        .update({
          refill_reminder_sent: true,
          refill_reminder_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);

      results.push({ order_id: order.id, phone: order.shipping_phone });
    }

    return new Response(JSON.stringify({ success: true, reminders_sent: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
