import type { Lead, Order, Campaign, StaffPerformance, LeakagePoint, HinglishTemplate, DashboardStats } from '@/types';

// =====================================================
// HINGLISH AI MESSAGE TEMPLATES
// =====================================================

export const HINGLISH_TEMPLATES: HinglishTemplate[] = [
  // 🔥 HOT LEAD MESSAGES
  {
    id: 'hot_welcome',
    name: 'Hot Lead Welcome',
    trigger: 'new_hot_lead',
    temperature: 'hot',
    message: `🙏 Namaste {{name}} ji!

Naturavya mein aapka swagat hai! 🌿

Aapne {{product}} ke baare mein interest dikhaya - bahut sahi decision liya aapne! 

Yeh 100% Ayurvedic hai aur hazaron logon ne iska fayda uthaya hai.

Kya aap abhi 2 minute baat kar sakte hain? Main aapko poori detail de deta/deti hun. 📞`,
    follow_up_delay_hours: 0.5
  },
  {
    id: 'hot_followup_1',
    name: 'Hot Lead Follow-up 1',
    trigger: 'hot_no_response_30min',
    temperature: 'hot',
    message: `{{name}} ji, aapka call miss ho gaya lagta hai! 

Koi baat nahi, main phir se try karunga/karungi. 

Agar aap busy hain toh mujhe bata dijiye konsa time theek rahega? ⏰

Ya phir yahan WhatsApp pe bhi baat kar sakte hain! 💬`,
    follow_up_delay_hours: 2
  },
  {
    id: 'hot_followup_2',
    name: 'Hot Lead Follow-up 2',
    trigger: 'hot_no_response_2hr',
    temperature: 'hot',
    message: `🌿 {{name}} ji, 

Bas ek quick reminder - aapne {{product}} ke baare mein enquiry ki thi.

Abhi special offer chal raha hai:
✅ FREE Delivery
✅ 10% Extra Discount
✅ COD Available

Yeh offer sirf aaj ke liye hai! Order confirm karein? 🎁`,
    follow_up_delay_hours: 6
  },

  // 🌡️ WARM LEAD MESSAGES
  {
    id: 'warm_welcome',
    name: 'Warm Lead Welcome',
    trigger: 'new_warm_lead',
    temperature: 'warm',
    message: `Namaste {{name}} ji! 🙏

Main {{agent_name}} bol raha/rahi hun Naturavya se.

Dekha maine aapne {{product}} ke baare mein jaanna chaha. Bahut accha choice hai!

Kya main aapko iske benefits bata sakta/sakti hun? 
Sirf 2 minute lagenge! 🌿`,
    follow_up_delay_hours: 1
  },
  {
    id: 'warm_followup_1',
    name: 'Warm Lead Follow-up 1',
    trigger: 'warm_no_response_1hr',
    temperature: 'warm',
    message: `{{name}} ji, 

Aapki health humare liye important hai! 💚

Maine dekha aapne abhi tak reply nahi kiya. Koi tension nahi, jab bhi free hon tab baat karte hain.

Ek sawaal - kya aapko koi specific health problem hai jiske liye solution dhundh rahe hain?`,
    follow_up_delay_hours: 4
  },
  {
    id: 'warm_followup_2',
    name: 'Warm Lead Follow-up 2', 
    trigger: 'warm_no_response_4hr',
    temperature: 'warm',
    message: `Hi {{name}} ji! 👋

Sirf yeh batana tha ki bahut saare customers ne {{product}} use karke amazing results dekhe hain:

⭐ "3 hafte mein farak dikh gaya" - Ramesh, Delhi
⭐ "Best Ayurvedic product" - Priya, Mumbai

Aap bhi try karke dekhein? Koi risk nahi - satisfaction guarantee hai! 🛡️`,
    follow_up_delay_hours: 24
  },

  // ❄️ COLD LEAD MESSAGES  
  {
    id: 'cold_welcome',
    name: 'Cold Lead Welcome',
    trigger: 'new_cold_lead',
    temperature: 'cold',
    message: `Namaste {{name}} ji 🙏

Naturavya Herbals ki taraf se!

Humne dekha aapne humare products mein interest dikhaya. 

Kya main aapki koi help kar sakta/sakti hun? 🌿`,
    follow_up_delay_hours: 2
  },
  {
    id: 'cold_followup_1',
    name: 'Cold Lead Follow-up 1',
    trigger: 'cold_no_response_24hr',
    temperature: 'cold',
    message: `{{name}} ji, 

Kal humne message kiya tha. Shayad aap busy the.

Agar aapko Ayurvedic solutions mein interest hai toh batayein. 

Hum yahan aapki help ke liye hain! 🙏`,
    follow_up_delay_hours: 48
  },
  {
    id: 'cold_revival',
    name: 'Cold Lead Revival',
    trigger: 'cold_no_response_48hr',
    temperature: 'cold',
    message: `{{name}} ji, last message! 

Agar abhi interest nahi hai toh koi baat nahi. 

Jab bhi zaroorat ho, Naturavya yaad rakhiyega! 🌿

Take care! 💚`,
    follow_up_delay_hours: 168
  },

  // 🎯 SPECIAL TRIGGERS
  {
    id: 'callback_reminder',
    name: 'Callback Reminder',
    trigger: 'callback_scheduled',
    temperature: 'warm',
    message: `{{name}} ji, yaad dilana tha! 📞

Aapne {{time}} baje callback maanga tha. 

Main 5 minute mein call kar raha/rahi hun. Please phone ready rakhein! 🙏`,
    follow_up_delay_hours: 0
  },
  {
    id: 'order_confirmed',
    name: 'Order Confirmed',
    trigger: 'order_placed',
    temperature: 'hot',
    message: `🎉 Bahut Badhai {{name}} ji!

Aapka order confirm ho gaya hai! 

Order Details:
📦 {{product}}
💰 ₹{{amount}}
🚚 {{delivery_days}} din mein delivery

Tracking link jaldi bhejenge! 

Naturavya family mein welcome! 🌿💚`,
    follow_up_delay_hours: 0
  },
  {
    id: 'refill_reminder',
    name: 'Refill Reminder',
    trigger: 'refill_due',
    temperature: 'warm',
    message: `{{name}} ji, kaise hain aap? 🙏

Lagta hai aapka {{product}} ab khatam hone wala hai! 

Refill order kar dein? 

Special Repeat Customer Offer:
🎁 15% OFF on refill
🚚 FREE Delivery
💳 Same Day Dispatch

Reply karein "REFILL" aur hum order process kar denge! 🌿`,
    follow_up_delay_hours: 0
  }
];

// =====================================================
// AI SUGGESTIONS FOR STAFF
// =====================================================

export const AI_SUGGESTIONS = {
  hot_lead: [
    "🔥 HOT LEAD! Turant call karo - 5 minute ke andar",
    "Yeh lead serious buyer hai, price discussion pe focus karo",
    "COD offer karo - conversion chances 80% badh jayenge",
    "Isko special discount de sakte ho - Manager se approval lo"
  ],
  warm_lead: [
    "📞 2 ghante mein follow-up karo",
    "Product benefits pe focus karo, price baad mein",
    "Customer reviews share karo trust build karne ke liye",
    "WhatsApp pe detailed info bhejo"
  ],
  cold_lead: [
    "⏰ Kal subah 10 baje try karo - better pickup rate",
    "Soft approach use karo, pushy mat ho",
    "Pehle problem samjho, phir solution batao",
    "Agar 3 attempts mein response nahi toh pause karo"
  ],
  no_response: [
    "Different time pe try karo - shayad busy hain",
    "WhatsApp message bhejo instead of call",
    "Voicemail chhodo agar option hai",
    "SMS reminder bhejo"
  ],
  callback: [
    "⏰ Exact time pe call karo - punctuality important hai",
    "Notes padho pehle - context ready rakho",
    "Offer sheet ready rakho",
    "Questions list ready rakho"
  ],
  objection_price: [
    "EMI option batao",
    "Value vs price explain karo",
    "Competitor comparison do",
    "Limited time discount offer karo"
  ],
  objection_trust: [
    "Customer testimonials share karo",
    "Return policy explain karo",
    "COD option batao - no risk",
    "Company background batao"
  ]
};

// =====================================================
// MOCK LEADS DATA
// =====================================================

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    full_name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh@gmail.com',
    city: 'Delhi',
    state: 'Delhi',
    source: 'meta_ads',
    source_campaign: 'Diabetes Care Campaign',
    source_adset: 'Age 35-55 Males',
    source_ad: 'Video Ad - Success Story',
    status: 'hot_lead',
    temperature: 'hot',
    score: 92,
    priority: 10,
    assigned_to: 'tm1',
    call_attempts: 1,
    last_call_at: new Date(Date.now() - 30 * 60000).toISOString(),
    next_follow_up: new Date(Date.now() + 30 * 60000).toISOString(),
    interested_products: ['Diabetic Care Pack', 'Sugar Control'],
    notes: 'Very interested, wants COD. Wife also has diabetes.',
    tags: ['high_value', 'repeat_potential'],
    ai_insights: [
      { type: 'behavior', message: 'Lead ne 3 baar website visit kiya', confidence: 95, created_at: new Date().toISOString() },
      { type: 'timing', message: 'Best time to call: 11 AM - 1 PM', confidence: 85, created_at: new Date().toISOString() },
      { type: 'product', message: 'Sugar Control mein interested - upsell opportunity', confidence: 90, created_at: new Date().toISOString() }
    ],
    ai_suggested_message: 'Rajesh ji, aapne Diabetic Care Pack ke baare mein pucha tha. Bahut accha choice hai! Kya abhi 2 minute baat kar sakte hain?',
    ai_suggested_action: '🔥 URGENT: Turant call karo! Hot lead hai, COD ready',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    full_name: 'Priya Sharma',
    phone: '9876543211',
    city: 'Mumbai',
    state: 'Maharashtra',
    source: 'meta_ads',
    source_campaign: 'Weight Loss Campaign',
    source_adset: 'Women 25-45',
    source_ad: 'Carousel - Before After',
    status: 'interested',
    temperature: 'warm',
    score: 68,
    priority: 7,
    assigned_to: 'tm2',
    call_attempts: 2,
    last_call_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    next_follow_up: new Date(Date.now() + 2 * 3600000).toISOString(),
    interested_products: ['Weight Loss Kit'],
    notes: 'Interested but checking with husband',
    tags: ['needs_follow_up'],
    ai_insights: [
      { type: 'behavior', message: 'Price page 2 baar dekha - price sensitive', confidence: 80, created_at: new Date().toISOString() },
      { type: 'sentiment', message: 'Positive response but needs convincing', confidence: 75, created_at: new Date().toISOString() }
    ],
    ai_suggested_message: 'Priya ji, kya aapne husband se baat ki? Koi sawaal ho toh batayein!',
    ai_suggested_action: '📞 4 PM ke baad call karo - husband bhi available hoga',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    full_name: 'Amit Patel',
    phone: '9876543212',
    city: 'Ahmedabad',
    state: 'Gujarat',
    source: 'google_ads',
    source_campaign: 'Hair Care Brand',
    status: 'new',
    temperature: 'warm',
    score: 55,
    priority: 6,
    call_attempts: 0,
    interested_products: ['Hair Growth Oil'],
    tags: ['new'],
    ai_insights: [
      { type: 'timing', message: 'Gujarat leads best convert at 11 AM', confidence: 82, created_at: new Date().toISOString() }
    ],
    ai_suggested_message: 'Amit ji, Naturavya Hair Growth Oil ke baare mein jaanna chahte hain? Main detail bhej deta hun!',
    ai_suggested_action: '🆕 Naya lead - 30 minute mein contact karo',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    full_name: 'Sunita Verma',
    phone: '9876543213',
    city: 'Jaipur',
    state: 'Rajasthan',
    source: 'meta_ads',
    source_campaign: 'Joint Pain Relief',
    status: 'not_picked',
    temperature: 'cold',
    score: 35,
    priority: 4,
    assigned_to: 'tm1',
    call_attempts: 3,
    last_call_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    next_follow_up: new Date(Date.now() + 24 * 3600000).toISOString(),
    interested_products: ['Joint Pain Oil'],
    notes: 'Phone not picked 3 times',
    tags: ['not_responding'],
    ai_insights: [
      { type: 'timing', message: '3 baar call miss - shayad kaam pe hain', confidence: 70, created_at: new Date().toISOString() },
      { type: 'behavior', message: 'WhatsApp try karo instead', confidence: 85, created_at: new Date().toISOString() }
    ],
    ai_suggested_message: 'Sunita ji, aapka call miss ho gaya. WhatsApp pe baat karein?',
    ai_suggested_action: '📱 WhatsApp message bhejo - call kaam nahi kar raha',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    full_name: 'Vikram Singh',
    phone: '9876543214',
    city: 'Lucknow',
    state: 'UP',
    source: 'meta_ads',
    source_campaign: 'Diabetes Care Campaign',
    status: 'follow_up',
    temperature: 'warm',
    score: 62,
    priority: 6,
    assigned_to: 'tm3',
    call_attempts: 2,
    last_call_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    next_follow_up: new Date(Date.now() - 30 * 60000).toISOString(), // Overdue!
    interested_products: ['Diabetic Care Pack'],
    notes: 'Asked for discount, said will think',
    tags: ['price_objection', 'overdue'],
    ai_insights: [
      { type: 'sentiment', message: 'Price objection - discount offer karo', confidence: 88, created_at: new Date().toISOString() }
    ],
    ai_suggested_message: 'Vikram ji, special offer hai aaj - 10% OFF! Interested?',
    ai_suggested_action: '⚠️ OVERDUE! 10% discount offer karo aur close karo',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    full_name: 'Meera Reddy',
    phone: '9876543215',
    city: 'Hyderabad',
    state: 'Telangana',
    source: 'website',
    status: 'order_confirmed',
    temperature: 'hot',
    score: 100,
    priority: 10,
    assigned_to: 'tm2',
    call_attempts: 2,
    last_call_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    interested_products: ['Complete Wellness Kit'],
    notes: 'Order confirmed! COD - ₹2499',
    tags: ['converted', 'high_value'],
    ai_insights: [],
    ai_suggested_message: 'Meera ji, order ship ho gaya! Tracking link bhej raha hun.',
    ai_suggested_action: '✅ Converted! Order fulfill karo',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// MOCK ORDERS DATA
// =====================================================

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    order_number: 'NTV-2024-001',
    lead_id: '6',
    total_amount: 2499,
    status: 'confirmed',
    payment_method: 'cod',
    shipping_name: 'Meera Reddy',
    shipping_phone: '9876543215',
    shipping_city: 'Hyderabad',
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    is_repeat_customer: false
  },
  {
    id: 'o2',
    order_number: 'NTV-2024-002',
    total_amount: 1299,
    status: 'shipped',
    payment_method: 'online',
    shipping_name: 'Ramesh Gupta',
    shipping_phone: '9876543220',
    shipping_city: 'Delhi',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    is_repeat_customer: true,
    refill_due_date: new Date(Date.now() + 25 * 24 * 3600000).toISOString()
  },
  {
    id: 'o3',
    order_number: 'NTV-2024-003',
    total_amount: 1899,
    status: 'delivered',
    payment_method: 'cod',
    shipping_name: 'Anjali Mishra',
    shipping_phone: '9876543221',
    shipping_city: 'Mumbai',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    is_repeat_customer: false,
    refill_due_date: new Date(Date.now() + 20 * 24 * 3600000).toISOString()
  },
  {
    id: 'o4',
    order_number: 'NTV-2024-004',
    total_amount: 999,
    status: 'ndr',
    payment_method: 'cod',
    shipping_name: 'Suresh Kumar',
    shipping_phone: '9876543222',
    shipping_city: 'Patna',
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    is_repeat_customer: false
  }
];

// =====================================================
// MOCK CAMPAIGN ROI DATA
// =====================================================

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Diabetes Care Campaign',
    platform: 'meta',
    adset_name: 'Age 35-55 Males',
    ad_name: 'Video Ad - Success Story',
    spend: 15000,
    leads_count: 120,
    conversions: 28,
    revenue: 69720,
    roi: 365,
    cpl: 125,
    cpa: 536
  },
  {
    id: 'c2',
    name: 'Weight Loss Campaign',
    platform: 'meta',
    adset_name: 'Women 25-45',
    ad_name: 'Carousel - Before After',
    spend: 12000,
    leads_count: 95,
    conversions: 18,
    revenue: 35820,
    roi: 198,
    cpl: 126,
    cpa: 667
  },
  {
    id: 'c3',
    name: 'Hair Care Brand',
    platform: 'google',
    spend: 8000,
    leads_count: 45,
    conversions: 12,
    revenue: 23880,
    roi: 199,
    cpl: 178,
    cpa: 667
  },
  {
    id: 'c4',
    name: 'Joint Pain Relief',
    platform: 'meta',
    spend: 10000,
    leads_count: 85,
    conversions: 8,
    revenue: 15920,
    roi: 59,
    cpl: 118,
    cpa: 1250
  }
];

// =====================================================
// MOCK STAFF PERFORMANCE DATA
// =====================================================

export const MOCK_STAFF_PERFORMANCE: StaffPerformance[] = [
  {
    team_member_id: 'tm1',
    name: 'Rahul Verma',
    leads_assigned: 45,
    leads_contacted: 42,
    leads_converted: 12,
    revenue: 29880,
    conversion_rate: 26.7,
    avg_response_time: 8,
    pending_follow_ups: 5,
    hot_leads: 3,
    rank: 1
  },
  {
    team_member_id: 'tm2',
    name: 'Pooja Singh',
    leads_assigned: 38,
    leads_contacted: 35,
    leads_converted: 9,
    revenue: 22410,
    conversion_rate: 23.7,
    avg_response_time: 12,
    pending_follow_ups: 8,
    hot_leads: 2,
    rank: 2
  },
  {
    team_member_id: 'tm3',
    name: 'Amit Kumar',
    leads_assigned: 42,
    leads_contacted: 38,
    leads_converted: 7,
    revenue: 17430,
    conversion_rate: 16.7,
    avg_response_time: 18,
    pending_follow_ups: 12,
    hot_leads: 4,
    rank: 3
  }
];

// =====================================================
// MOCK LEAKAGE POINTS (FOR OWNER DASHBOARD)
// =====================================================

export const MOCK_LEAKAGE_POINTS: LeakagePoint[] = [
  {
    stage: 'New → Contacted',
    from_count: 150,
    to_count: 132,
    drop_rate: 12,
    potential_revenue_loss: 44820,
    suggestion: '18 leads contact nahi hue - Auto WhatsApp enable karo new leads ke liye'
  },
  {
    stage: 'Contacted → Interested',
    from_count: 132,
    to_count: 89,
    drop_rate: 32.6,
    potential_revenue_loss: 107070,
    suggestion: '43 leads interested nahi - Better script training do team ko'
  },
  {
    stage: 'Interested → Hot Lead',
    from_count: 89,
    to_count: 45,
    drop_rate: 49.4,
    potential_revenue_loss: 109560,
    suggestion: '44 interested leads convert nahi hue - Follow-up delay hai, automation lagao'
  },
  {
    stage: 'Hot Lead → Order',
    from_count: 45,
    to_count: 28,
    drop_rate: 37.8,
    potential_revenue_loss: 42330,
    suggestion: '17 hot leads lost - Immediate discount offer karo, same day close karo'
  },
  {
    stage: 'Shipped → Delivered',
    from_count: 28,
    to_count: 24,
    drop_rate: 14.3,
    potential_revenue_loss: 9960,
    suggestion: '4 orders RTO/NDR - Better address verification at order time'
  }
];

// =====================================================
// DASHBOARD STATS
// =====================================================

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  leads_today: 23,
  leads_total: 450,
  hot_leads: 12,
  warm_leads: 85,
  cold_leads: 45,
  orders_today: 8,
  revenue_today: 19920,
  conversion_rate: 18.5,
  avg_response_time: 12,
  pending_follow_ups: 34,
  overdue_follow_ups: 8
};
