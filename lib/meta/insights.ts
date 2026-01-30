type MetaInsightRow = {
  ad_id: string;
  adset_id?: string;
  campaign_id?: string;
  spend: number;
  impressions: number;
  clicks: number;
};

export async function fetchMetaInsights(
  accessToken: string,
  adAccountId: string,
  date: string
): Promise<MetaInsightRow[]> {
  const url =
    `https://graph.facebook.com/v19.0/act_${adAccountId}/insights` +
    `?fields=ad_id,adset_id,campaign_id,spend,impressions,clicks` +
    `&time_range[since]=${date}` +
    `&time_range[until]=${date}` +
    `&level=ad` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    console.error('Meta insights error:', json);
    throw new Error('Meta Insights API failed');
  }

  return (json.data || []).map((r: any) => ({
    ad_id: r.ad_id,
    adset_id: r.adset_id,
    campaign_id: r.campaign_id,
    spend: Number(r.spend || 0),
    impressions: Number(r.impressions || 0),
    clicks: Number(r.clicks || 0),
  }));
}
