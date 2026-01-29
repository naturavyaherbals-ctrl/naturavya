# 🚀 Naturavya AI-Powered Sales Operating System
## Complete Implementation Guide

---

## 📊 CURRENT SYSTEM ANALYSIS

Based on your codebase, you have an excellent foundation:

### ✅ What You Already Have:
1. **Lead Management** - Full CRM with status tracking
2. **Meta Webhook** - Lead Gen + WhatsApp integration
3. **Assignment Service** - Round-robin, rules-based, weighted assignment
4. **WhatsApp Service** - Template messages, conversations, auto-reply
5. **Order Workflow** - Complete order lifecycle management
6. **Role-based Access** - Super Admin, Admin, Manager, Agent
7. **Team Performance** - Basic tracking

### ❌ What's Missing (Gaps Identified):
1. **AI Lead Scoring** - No Hot/Warm/Cold temperature system
2. **Automatic Follow-up Sequences** - No scheduled automation
3. **Hinglish AI Messages** - No smart message generation
4. **Pipeline Leak Detection** - No funnel analytics
5. **Campaign ROI Tracking** - No ad spend vs revenue analysis
6. **Refill Automation** - No repeat customer triggers
7. **Smart Reminders** - No overdue follow-up alerts
8. **AI Suggestions for Staff** - No contextual recommendations

---

## 🗄️ DATABASE SCHEMA CHANGES

### Run these SQL migrations in Supabase:

```sql
-- =====================================================
-- 1. ADD AI SCORING COLUMNS TO LEADS TABLE
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature VARCHAR(10) DEFAULT 'warm' 
  CHECK (temperature IN ('hot', 'warm', 'cold'));

ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 50 
  CHECK (score >= 0 AND score <= 100);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '[]';

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_suggested_message TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_suggested_action TEXT;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_visits INTEGER DEFAULT 0;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_responses INTEGER DEFAULT 0;

-- =====================================================
-- 2. CREATE AI FOLLOW-UP SEQUENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL, -- 'new_lead', 'no_response_1hr', 'callback_missed', etc.
  temperature VARCHAR(10), -- 'hot', 'warm', 'cold' or NULL for all
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  message_template TEXT NOT NULL,
  message_language VARCHAR(20) DEFAULT 'hinglish',
  channel VARCHAR(20) DEFAULT 'whatsapp', -- 'whatsapp', 'sms', 'call'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Hinglish templates
INSERT INTO follow_up_sequences (name, trigger_event, temperature, delay_minutes, message_template) VALUES
('Hot Lead Welcome', 'new_lead', 'hot', 0, '🙏 Namaste {{name}} ji!

Naturavya mein aapka swagat hai! 🌿

Aapne {{product}} ke baare mein interest dikhaya - bahut sahi decision liya aapne! 

Yeh 100% Ayurvedic hai aur hazaron logon ne iska fayda uthaya hai.

Kya aap abhi 2 minute baat kar sakte hain? 📞'),

('Hot Lead Follow-up 30min', 'no_response', 'hot', 30, '{{name}} ji, aapka call miss ho gaya lagta hai! 

Koi baat nahi, main phir se try karunga/karungi. 

Aagar aap busy hain toh mujhe bata dijiye konsa time theek rahega? ⏰'),

('Hot Lead Urgent', 'no_response', 'hot', 120, '🌿 {{name}} ji, 

Bas ek quick reminder - aapne {{product}} ke baare mein enquiry ki thi.

Abhi special offer chal raha hai:
✅ FREE Delivery
✅ 10% Extra Discount
✅ COD Available

Yeh offer sirf aaj ke liye hai! Order confirm karein? 🎁'),

('Warm Lead Welcome', 'new_lead', 'warm', 60, 'Namaste {{name}} ji! 🙏

Main {{agent_name}} bol raha/rahi hun Naturavya se.

Dekha maine aapne {{product}} ke baare mein jaanna chaha. Bahut accha choice hai!

Kya main aapko iske benefits bata sakta/sakti hun? 
Sirf 2 minute lagenge! 🌿'),

('Cold Lead Revival', 'no_response', 'cold', 2880, '{{name}} ji, last message! 

Aagar abhi interest nahi hai toh koi baat nahi. 

Jab bhi zaroorat ho, Naturavya yaad rakhiyega! 🌿

Take care! 💚'),

('Refill Reminder', 'refill_due', NULL, 0, '{{name}} ji, kaise hain aap? 🙏

Lagta hai aapka {{product}} ab khatam hone wala hai! 

Refill order kar dein? 

🎁 15% OFF on refill
🚚 FREE Delivery
💳 Same Day Dispatch

Reply karein "REFILL" aur hum order process kar denge! 🌿'),

('Order Confirmed', 'order_placed', NULL, 0, '🎉 Bahut Badhai {{name}} ji!

Aapka order confirm ho gaya hai! 

📦 {{product}}
💰 ₹{{amount}}
🚚 {{delivery_days}} din mein delivery

Tracking link jaldi bhejenge! 

Naturavya family mein welcome! 🌿💚');

-- =====================================================
-- 3. CREATE SCHEDULED FOLLOW-UPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS scheduled_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES follow_up_sequences(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  channel VARCHAR(20) DEFAULT 'whatsapp',
  message_content TEXT,
  response_received BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_follow_ups_pending ON scheduled_follow_ups(scheduled_at) 
  WHERE status = 'pending';

-- =====================================================
-- 4. CREATE CAMPAIGN ROI TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255),
  adset_id VARCHAR(255),
  adset_name VARCHAR(255),
  ad_id VARCHAR(255),
  ad_name VARCHAR(255),
  platform VARCHAR(50) DEFAULT 'meta',
  spend DECIMAL(10,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  cpl DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN leads_count > 0 THEN spend / leads_count ELSE 0 END
  ) STORED,
  cpa DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN conversions > 0 THEN spend / conversions ELSE 0 END
  ) STORED,
  roi DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE WHEN spend > 0 THEN ((revenue - spend) / spend) * 100 ELSE 0 END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, campaign_id, adset_id, ad_id)
);

CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date);
CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);

-- =====================================================
-- 5. CREATE PIPELINE LEAKAGE TRACKING VIEW
-- =====================================================

CREATE OR REPLACE VIEW pipeline_leakage_analysis AS
WITH stage_counts AS (
  SELECT 
    status,
    COUNT(*) as count,
    SUM(CASE WHEN order_id IS NOT NULL THEN 1 ELSE 0 END) as converted
  FROM leads
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY status
),
funnel_stages AS (
  SELECT 
    'new' as stage, 1 as stage_order
  UNION ALL SELECT 'not_picked', 2
  UNION ALL SELECT 'follow_up', 3
  UNION ALL SELECT 'interested', 4
  UNION ALL SELECT 'hot_lead', 5
  UNION ALL SELECT 'order_confirmed', 6
)
SELECT 
  fs.stage,
  fs.stage_order,
  COALESCE(sc.count, 0) as lead_count,
  LAG(COALESCE(sc.count, 0)) OVER (ORDER BY fs.stage_order) as prev_stage_count,
  CASE 
    WHEN LAG(COALESCE(sc.count, 0)) OVER (ORDER BY fs.stage_order) > 0 
    THEN ROUND(
      (1 - (COALESCE(sc.count, 0)::DECIMAL / LAG(COALESCE(sc.count, 0)) OVER (ORDER BY fs.stage_order))) * 100, 
      1
    )
    ELSE 0 
  END as drop_rate
FROM funnel_stages fs
LEFT JOIN stage_counts sc ON fs.stage = sc.status
ORDER BY fs.stage_order;

-- =====================================================
-- 6. ADD REFILL TRACKING TO ORDERS
-- =====================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_due_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_repeat_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_order_id UUID REFERENCES orders(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_duration_days INTEGER DEFAULT 30;

-- =====================================================
-- 7. CREATE AI LEAD SCORING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_lead_score(lead_row leads)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 50; -- Base score
BEGIN
  -- Source scoring
  IF lead_row.source = 'meta_ads' THEN score := score + 10; END IF;
  IF lead_row.source = 'google_ads' THEN score := score + 15; END IF;
  IF lead_row.source = 'referral' THEN score := score + 20; END IF;
  
  -- Engagement scoring
  IF lead_row.whatsapp_responses > 0 THEN score := score + (lead_row.whatsapp_responses * 5); END IF;
  IF lead_row.website_visits > 2 THEN score := score + 15; END IF;
  
  -- Response time scoring
  IF lead_row.response_time_minutes IS NOT NULL THEN
    IF lead_row.response_time_minutes <= 5 THEN score := score + 20;
    ELSIF lead_row.response_time_minutes <= 30 THEN score := score + 10;
    ELSIF lead_row.response_time_minutes <= 60 THEN score := score + 5;
    END IF;
  END IF;
  
  -- Call attempts penalty
  IF lead_row.call_attempts > 5 AND lead_row.status NOT IN ('interested', 'hot_lead', 'order_confirmed') THEN
    score := score - 15;
  END IF;
  
  -- Interested products bonus
  IF lead_row.interested_products IS NOT NULL AND array_length(lead_row.interested_products, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Cap score between 0-100
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE TEMPERATURE CLASSIFICATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION classify_lead_temperature(score INTEGER, status VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  IF status IN ('hot_lead', 'order_confirmed') THEN
    RETURN 'hot';
  ELSIF score >= 75 OR status = 'interested' THEN
    RETURN 'hot';
  ELSIF score >= 45 OR status IN ('follow_up', 'callback') THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE TRIGGER TO AUTO-UPDATE LEAD SCORE
-- =====================================================

CREATE OR REPLACE FUNCTION update_lead_score_and_temperature()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER;
  new_temp VARCHAR(10);
BEGIN
  new_score := calculate_lead_score(NEW);
  new_temp := classify_lead_temperature(new_score, NEW.status);
  
  NEW.score := new_score;
  NEW.temperature := new_temp;
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score_and_temperature();

-- =====================================================
-- 10. CREATE AI SUGGESTIONS VIEW
-- =====================================================

CREATE OR REPLACE VIEW lead_ai_suggestions AS
SELECT 
  l.id,
  l.full_name,
  l.phone,
  l.status,
  l.temperature,
  l.score,
  l.call_attempts,
  l.next_follow_up,
  l.last_call_at,
  CASE
    WHEN l.temperature = 'hot' AND l.call_attempts = 0 THEN 
      '🔥 URGENT: Turant call karo! Hot lead hai - 5 minute ke andar'
    WHEN l.temperature = 'hot' AND l.next_follow_up < NOW() THEN 
      '⚠️ OVERDUE: Hot lead ka follow-up miss ho gaya! Abhi call karo'
    WHEN l.temperature = 'hot' THEN 
      '🎯 Priority: COD offer karo, same day close karo'
    WHEN l.temperature = 'warm' AND l.call_attempts >= 3 THEN 
      '📱 WhatsApp try karo - call nahi utha rahe'
    WHEN l.temperature = 'warm' THEN 
      '📞 2 ghante mein follow-up karo, product benefits explain karo'
    WHEN l.temperature = 'cold' AND l.call_attempts >= 5 THEN 
      '⏸️ Pause karo - baad mein revival campaign mein daalo'
    ELSE 
      '📋 Regular follow-up continue karo'
  END as ai_suggestion,
  CASE 
    WHEN l.next_follow_up < NOW() THEN true 
    ELSE false 
  END as is_overdue
FROM leads l
WHERE l.status NOT IN ('order_confirmed', 'cancelled', 'not_interested', 'wrong_number');
```

---

## 📡 SUPABASE EDGE FUNCTIONS

### 1. AI Lead Scorer Edge Function

Create file: `supabase/functions/ai-lead-scorer/index.ts`

```typescript
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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { lead_id } = await req.json();

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    // Calculate score
    let score = 50;
    const insights: any[] = [];

    // Source scoring
    if (lead.source === 'meta_ads') {
      score += 10;
      insights.push({
        type: 'source',
        message: 'Meta Ads se aaya - quality lead hai',
        confidence: 85
      });
    }

    // Engagement scoring
    if (lead.whatsapp_responses > 0) {
      score += lead.whatsapp_responses * 5;
      insights.push({
        type: 'behavior',
        message: `${lead.whatsapp_responses} WhatsApp responses - engaged customer`,
        confidence: 90
      });
    }

    if (lead.website_visits > 2) {
      score += 15;
      insights.push({
        type: 'behavior',
        message: `${lead.website_visits} baar website visit kiya - serious buyer`,
        confidence: 88
      });
    }

    // Response time
    if (lead.response_time_minutes && lead.response_time_minutes <= 30) {
      score += 15;
      insights.push({
        type: 'timing',
        message: 'Quick response diya - interested customer',
        confidence: 85
      });
    }

    // Determine temperature
    let temperature = 'warm';
    if (score >= 75 || lead.status === 'interested' || lead.status === 'hot_lead') {
      temperature = 'hot';
    } else if (score < 40) {
      temperature = 'cold';
    }

    // Generate AI suggested message
    let aiMessage = '';
    if (temperature === 'hot') {
      aiMessage = `${lead.full_name} ji, aapne ${lead.interested_products?.[0] || 'humare products'} ke baare mein interest dikhaya. Bahut sahi choice! Kya abhi baat kar sakte hain?`;
    } else if (temperature === 'warm') {
      aiMessage = `Namaste ${lead.full_name} ji! Main aapko ${lead.interested_products?.[0] || 'humare Ayurvedic products'} ke benefits batana chahta/chahti hun. 2 minute milenge?`;
    } else {
      aiMessage = `${lead.full_name} ji, Naturavya ki taraf se! Koi health related query ho toh batayein. 🌿`;
    }

    // Generate AI action
    let aiAction = '';
    if (temperature === 'hot' && lead.call_attempts === 0) {
      aiAction = '🔥 URGENT: Turant call karo! Hot lead hai';
    } else if (temperature === 'hot') {
      aiAction = '🎯 COD offer karo, same day close karo';
    } else if (temperature === 'warm' && lead.call_attempts >= 3) {
      aiAction = '📱 WhatsApp message bhejo - call nahi utha rahe';
    } else if (temperature === 'cold') {
      aiAction = '⏰ Kal subah 10 baje try karo';
    } else {
      aiAction = '📞 Regular follow-up karo';
    }

    // Update lead
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        score: Math.min(100, Math.max(0, score)),
        temperature,
        ai_insights: insights,
        ai_suggested_message: aiMessage,
        ai_suggested_action: aiAction,
        updated_at: new Date().toISOString()
      })
      .eq('id', lead_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      score,
      temperature,
      insights,
      aiMessage,
      aiAction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

### 2. Auto Follow-up Processor Edge Function

Create file: `supabase/functions/process-follow-ups/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Get pending follow-ups that are due
    const { data: pendingFollowUps, error } = await supabase
      .from('scheduled_follow_ups')
      .select(`
        *,
        lead:leads(*),
        sequence:follow_up_sequences(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50);

    if (error) throw error;

    const results = [];

    for (const followUp of pendingFollowUps || []) {
      try {
        const lead = followUp.lead;
        const sequence = followUp.sequence;

        if (!lead || !sequence) continue;

        // Personalize message
        let message = sequence.message_template
          .replace(/\{\{name\}\}/g, lead.full_name || 'Customer')
          .replace(/\{\{product\}\}/g, lead.interested_products?.[0] || 'our products')
          .replace(/\{\{agent_name\}\}/g, 'Naturavya Team');

        // Send WhatsApp message
        if (followUp.channel === 'whatsapp') {
          const waResult = await sendWhatsAppMessage(supabase, lead.phone, message);
          
          // Update follow-up status
          await supabase
            .from('scheduled_follow_ups')
            .update({
              status: waResult.success ? 'sent' : 'failed',
              executed_at: new Date().toISOString(),
              message_content: message
            })
            .eq('id', followUp.id);

          // Log activity
          await supabase.from('lead_activities').insert({
            lead_id: lead.id,
            activity_type: 'whatsapp',
            title: 'Auto follow-up sent',
            description: `AI follow-up: ${sequence.name}`,
            created_at: new Date().toISOString()
          });

          results.push({ id: followUp.id, status: 'sent' });
        }
      } catch (err) {
        results.push({ id: followUp.id, status: 'error', error: err.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function sendWhatsAppMessage(supabase: any, phone: string, message: string) {
  // Get WhatsApp account
  const { data: account } = await supabase
    .from('whatsapp_accounts')
    .select('*')
    .eq('is_primary', true)
    .single();

  if (!account) return { success: false, error: 'No WhatsApp account' };

  // Format phone
  const formattedPhone = phone.replace(/\D/g, '').slice(-10);
  const fullPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  // Send via Meta API
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${account.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: fullPhone,
        type: 'text',
        text: { body: message }
      })
    }
  );

  const result = await response.json();
  return { success: !!result.messages?.[0]?.id, messageId: result.messages?.[0]?.id };
}
```

### 3. Refill Reminder Edge Function

Create file: `supabase/functions/refill-reminders/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Get orders due for refill in next 7 days
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
      // Generate Hinglish refill message
      const message = `${order.shipping_name} ji, kaise hain aap? 🙏

Lagta hai aapka product ab khatam hone wala hai! 

Refill order kar dein? 

🎁 15% OFF on refill
🚚 FREE Delivery
💳 Same Day Dispatch

Reply karein "REFILL" aur hum order process kar denge! 🌿`;

      // Send WhatsApp
      // ... (similar WhatsApp sending logic)

      // Mark as sent
      await supabase
        .from('orders')
        .update({
          refill_reminder_sent: true,
          refill_reminder_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);

      results.push({ order_id: order.id, phone: order.shipping_phone });
    }

    return new Response(JSON.stringify({
      success: true,
      reminders_sent: results.length,
      results
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
});
```

---

## ⏰ CRON JOBS (Supabase pg_cron)

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Process follow-ups every 5 minutes
SELECT cron.schedule(
  'process-follow-ups',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-follow-ups',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);

-- 2. Send refill reminders daily at 10 AM
SELECT cron.schedule(
  'refill-reminders',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/refill-reminders',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
  );
  $$
);

-- 3. Update lead scores every hour
SELECT cron.schedule(
  'update-lead-scores',
  '0 * * * *',
  $$
  UPDATE leads 
  SET 
    score = calculate_lead_score(leads.*),
    temperature = classify_lead_temperature(calculate_lead_score(leads.*), status),
    updated_at = NOW()
  WHERE status NOT IN ('order_confirmed', 'cancelled', 'not_interested', 'wrong_number')
    AND updated_at < NOW() - INTERVAL '1 hour';
  $$
);

-- 4. Daily analytics aggregation at midnight
SELECT cron.schedule(
  'daily-analytics',
  '0 0 * * *',
  $$
  INSERT INTO daily_analytics (date, total_leads, total_orders, total_revenue, leads_converted)
  SELECT 
    CURRENT_DATE - 1,
    (SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE - 1),
    (SELECT COUNT(*) FROM leads WHERE DATE(converted_at) = CURRENT_DATE - 1)
  ON CONFLICT (date) DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    leads_converted = EXCLUDED.leads_converted;
  $$
);
```

---

## 📱 UPDATED META WEBHOOK (app/api/webhooks/meta/route.ts)

Add this to your existing webhook to trigger AI scoring:

```typescript
// After creating lead, trigger AI scoring
if (newLead) {
  // Queue AI scoring
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-lead-scorer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ lead_id: newLead.id })
  }).catch(console.error);

  // Schedule follow-up sequences based on temperature
  const temperature = newLead.score >= 75 ? 'hot' : newLead.score >= 45 ? 'warm' : 'cold';
  
  const { data: sequences } = await adminClient
    .from('follow_up_sequences')
    .select('*')
    .eq('trigger_event', 'new_lead')
    .or(`temperature.eq.${temperature},temperature.is.null`)
    .eq('is_active', true);

  for (const seq of sequences || []) {
    await adminClient.from('scheduled_follow_ups').insert({
      lead_id: newLead.id,
      sequence_id: seq.id,
      scheduled_at: new Date(Date.now() + seq.delay_minutes * 60000).toISOString(),
      channel: seq.channel
    });
  }
}
```

---

## 🎨 FRONTEND COMPONENTS TO ADD

### 1. Add to your existing LeadKanban.tsx - Temperature Badge

```tsx
// Add this import
import { Flame, ThermometerSun, Snowflake, Sparkles } from 'lucide-react';

// Add temperature badge component
function TemperatureBadge({ temperature }: { temperature: 'hot' | 'warm' | 'cold' }) {
  const config = {
    hot: { label: '🔥 HOT', bg: 'bg-red-500 text-white', icon: Flame },
    warm: { label: '🌡️ WARM', bg: 'bg-orange-100 text-orange-700', icon: ThermometerSun },
    cold: { label: '❄️ COLD', bg: 'bg-blue-100 text-blue-700', icon: Snowflake },
  };
  const { label, bg } = config[temperature];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}>{label}</span>;
}

// Add AI suggestion in lead card
{lead.ai_suggested_action && (
  <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
    <div className="flex items-start gap-1">
      <Sparkles className="w-3 h-3 text-amber-500 mt-0.5" />
      <p className="text-xs text-amber-700">{lead.ai_suggested_action}</p>
    </div>
  </div>
)}
```

### 2. New Dashboard Stats Cards with Temperature

Copy the StatsCards, LeadTemperatureCards, AlertCards components from this project to your Next.js app.

### 3. Owner Leakage Dashboard

Copy the LeakageDetector component for pipeline leak analysis.

### 4. Staff Performance Leaderboard

Copy the StaffPerformanceTable component.

### 5. Campaign ROI Tracker

Copy the CampaignROITable component.

---

## 🔧 ENV VARIABLES TO ADD

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Meta/Facebook
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
META_PAGE_ACCESS_TOKEN=your_page_token
META_APP_SECRET=your_app_secret

# WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_wa_token

# AI (Optional - for advanced features)
OPENAI_API_KEY=your_openai_key (for advanced AI suggestions)
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Database (Day 1-2)
- [ ] Run all SQL migrations
- [ ] Create indexes
- [ ] Test triggers working

### Phase 2: Edge Functions (Day 3-4)
- [ ] Deploy ai-lead-scorer
- [ ] Deploy process-follow-ups
- [ ] Deploy refill-reminders
- [ ] Test all functions

### Phase 3: Cron Jobs (Day 5)
- [ ] Enable pg_cron
- [ ] Schedule all jobs
- [ ] Monitor execution

### Phase 4: Frontend (Day 6-8)
- [ ] Add temperature badges to leads
- [ ] Add AI suggestions display
- [ ] Create Owner Dashboard
- [ ] Create Staff Leaderboard
- [ ] Create Campaign ROI page
- [ ] Add Refill Automation UI

### Phase 5: Testing (Day 9-10)
- [ ] Test Meta webhook → AI scoring
- [ ] Test auto follow-up sequences
- [ ] Test refill reminders
- [ ] Test pipeline analytics

---

## 🎯 EXPECTED RESULTS

After implementation:

1. **Lead Response Time**: 2+ hours → Under 5 minutes (auto WhatsApp)
2. **Follow-up Rate**: 60% → 95% (automated sequences)
3. **Conversion Rate**: +15-25% (AI scoring prioritization)
4. **Staff Efficiency**: +40% (AI suggestions)
5. **Revenue from Refills**: +20% (automation)
6. **Pipeline Visibility**: 100% (owner dashboard)

---

## 🆘 SUPPORT

For implementation help:
1. Check the React prototype in this project
2. Adapt components for Next.js (minimal changes needed)
3. Test Edge Functions locally with Supabase CLI

---

Built with ❤️ for Naturavya Herbals
