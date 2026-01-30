export async function updateMetaAdBudget(
  accessToken: string,
  adsetId: string,
  dailyBudgetINR: number
) {
  // Meta uses smallest currency unit (paise)
  const daily_budget = Math.round(dailyBudgetINR * 100);

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${adsetId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daily_budget,
        access_token: accessToken,
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error('Meta budget update failed:', json);
    throw new Error(json.error?.message || 'Meta API error');
  }

  return json;
}
