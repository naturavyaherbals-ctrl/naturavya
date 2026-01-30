export type AdDecision = {
  action: 'scale' | 'pause' | 'optimize';
  reason: string[];
  suggested_budget_change: number; // %
  confidence: number; // 0–100
};

export function decideAdPerformance(ad: any): AdDecision {
  const reason: string[] = [];
  let score = 0;

  if (ad.leads >= 20) {
    score += 20;
    reason.push('Enough lead volume');
  }

  if (ad.conversions >= 3) {
    score += 30;
    reason.push('Conversions happening');
  }

  if (ad.avg_lead_score >= 60) {
    score += 25;
    reason.push('High quality leads');
  }

  if (ad.rto_rate < 20) {
    score += 15;
    reason.push('Low RTO');
  }

  if (ad.cost_per_lead <= ad.target_cpl) {
    score += 10;
    reason.push('CPL under control');
  }

  let action: AdDecision['action'] = 'optimize';
  let budget = 0;

  if (score >= 70) {
    action = 'scale';
    budget = +30;
  } else if (score <= 35) {
    action = 'pause';
    budget = -100;
  } else {
    action = 'optimize';
    budget = -20;
  }

  return {
    action,
    reason,
    suggested_budget_change: budget,
    confidence: Math.min(100, score),
  };
}
