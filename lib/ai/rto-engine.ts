export function calculateRtoRisk({
  isCod,
  addressComplete,
  pincodeRisk,
  leadScore,
  isRepeatCustomer,
  whatsappReplied,
}: {
  isCod: boolean;
  addressComplete: boolean;
  pincodeRisk: boolean;
  leadScore: number;
  isRepeatCustomer: boolean;
  whatsappReplied: boolean;
}) {
  let score = 0;

  if (isCod) score += 20;
  if (!addressComplete) score += 30;
  if (pincodeRisk) score += 25;
  if (leadScore < 50) score += 15;
  if (!isRepeatCustomer) score += 10;
  if (!whatsappReplied) score += 10;

  let risk: 'low' | 'medium' | 'high' = 'low';

  if (score > 60) risk = 'high';
  else if (score > 30) risk = 'medium';

  return { score, risk };
}
