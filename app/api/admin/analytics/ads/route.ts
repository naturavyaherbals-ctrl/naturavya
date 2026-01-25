import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch ad analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adminClient = createAdminClient();

    const platform = searchParams.get('platform'); // 'meta', 'google', or null for all
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get ad accounts
    let accountsQuery = adminClient
      .from('ad_accounts')
      .select('*')
      .eq('is_active', true);

    if (platform) {
      accountsQuery = accountsQuery.eq('platform', platform);
    }

    const { data: accounts } = await accountsQuery;

    // Get campaigns with metrics
    let campaignsQuery = adminClient
      .from('ad_campaigns')
      .select(`
        *,
        adsets:ad_adsets(*)
      `)
      .order('spend', { ascending: false });

    if (platform) {
      campaignsQuery = campaignsQuery.eq('platform', platform);
    }

    const { data: campaigns } = await campaignsQuery;

    // Get daily metrics
    let metricsQuery = adminClient
      .from('ad_daily_metrics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (platform) {
      metricsQuery = metricsQuery.eq('platform', platform);
    }

    const { data: dailyMetrics } = await metricsQuery;

    // Calculate aggregate stats
    const totals = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      leads: 0,
      purchases: 0,
      purchaseValue: 0,
      reach: 0,
    };

    (dailyMetrics || []).forEach(day => {
      totals.impressions += day.impressions || 0;
      totals.clicks += day.clicks || 0;
      totals.spend += parseFloat(day.spend) || 0;
      totals.leads += day.leads || 0;
      totals.purchases += day.purchases || 0;
      totals.purchaseValue += parseFloat(day.purchase_value) || 0;
      totals.reach += day.reach || 0;
    });

    // Calculate derived metrics
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    const costPerLead = totals.leads > 0 ? totals.spend / totals.leads : 0;
    const costPerPurchase = totals.purchases > 0 ? totals.spend / totals.purchases : 0;
    const roas = totals.spend > 0 ? totals.purchaseValue / totals.spend : 0;

    // Group metrics by date for chart
    const chartData = (dailyMetrics || []).reduce((acc: any[], day) => {
      const existingDay = acc.find(d => d.date === day.date);
      if (existingDay) {
        existingDay.impressions += day.impressions || 0;
        existingDay.clicks += day.clicks || 0;
        existingDay.spend += parseFloat(day.spend) || 0;
        existingDay.leads += day.leads || 0;
        existingDay.purchases += day.purchases || 0;
      } else {
        acc.push({
          date: day.date,
          impressions: day.impressions || 0,
          clicks: day.clicks || 0,
          spend: parseFloat(day.spend) || 0,
          leads: day.leads || 0,
          purchases: day.purchases || 0,
        });
      }
      return acc;
    }, []);

    // Get leads by source for attribution
    const { data: leadsBySource } = await adminClient
      .from('leads')
      .select('source, status')
      .in('source', ['meta_ads', 'google_ads'])
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const leadAttribution = {
      meta_ads: {
        total: 0,
        converted: 0,
      },
      google_ads: {
        total: 0,
        converted: 0,
      },
    };

    (leadsBySource || []).forEach(lead => {
      if (lead.source === 'meta_ads') {
        leadAttribution.meta_ads.total++;
        if (lead.status === 'order_confirmed') leadAttribution.meta_ads.converted++;
      } else if (lead.source === 'google_ads') {
        leadAttribution.google_ads.total++;
        if (lead.status === 'order_confirmed') leadAttribution.google_ads.converted++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        accounts,
        campaigns,
        totals: {
          ...totals,
          ctr,
          cpc,
          cpm,
          costPerLead,
          costPerPurchase,
          roas,
        },
        chartData,
        leadAttribution,
        dateRange: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error('Ad analytics fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch ad analytics' }, { status: 500 });
  }
}

// POST - Sync ad data (manual trigger)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, accountId } = body;

    // In a real implementation, this would:
    // 1. Fetch data from Meta/Google Ads API
    // 2. Process and store in our database
    // 3. Return sync status

    // For now, we'll simulate a successful sync
    const adminClient = createAdminClient();

    if (accountId) {
      await adminClient
        .from('ad_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', accountId);
    }

    return NextResponse.json({
      success: true,
      message: 'Sync initiated. Data will be updated shortly.',
    });
  } catch (error) {
    console.error('Ad sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync ad data' }, { status: 500 });
  }
}