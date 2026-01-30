export type LeadScoreResult = {
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  probability: number;
  reason: string[];
  suggested_action: string;
};

export function scoreLead(lead: any): LeadScoreResult {
  let score = 0;
  const reason: string[] = [];

  // Website interest
  if (lead.website_visits >= 3) {
    score += 15;
    reason.push('Multiple website visits');
  }

  // WhatsApp engagement
  if (lead.whatsapp_responses >= 2) {
    score += 20;
    reason.push('Responded on WhatsApp');
  }

  // Call attempts
  if (lead.call_attempts >= 1) {
    score += 10;
    reason.push('Call connected / attempted');
  }

  // Interested products
  if (
    Array.isArray(lead.interested_products) &&
    lead.interested_products.length > 0
  ) {
    score += 15;
    reason.push('Product interest shown');
  }

  // Source trust
  if (['meta', 'facebook', 'instagram'].includes(lead.source)) {
    score += 10;
    reason.push('Paid ad lead');
  }

  // Follow-ups
  if (lead.follow_up_count >= 2) {
    score += 10;
    reason.push('Multiple follow-ups');
  }

  // Recency
  if (lead.last_activity_at) {
    const hours =
      (Date.now() - new Date(lead.last_activity_at).getTime()) / 36e5;
    if (hours <= 24) {
      score += 10;
      reason.push('Recent activity');
    }
  }

  // Penalties
  if (lead.status === 'lost') {
    score -= 30;
    reason.push('Marked as lost');
  }

  if (lead.revival_attempts >= 3) {
    score -= 15;
    reason.push('Too many revival attempts');
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let temperature: 'hot' | 'warm' | 'cold' = 'cold';
  if (score >= 70) temperature = 'hot';
  else if (score >= 40) temperature = 'warm';

  const probability = score;

  const suggested_action =
    temperature === 'hot'
      ? 'Call immediately + COD confirmation'
      : temperature === 'warm'
      ? 'WhatsApp follow-up today'
      : 'Revival sequence / wait';

  return {
    score,
    temperature,
    probability,
    reason,
    suggested_action,
  };
}
