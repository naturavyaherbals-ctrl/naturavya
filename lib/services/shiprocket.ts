// lib/services/shiprocket.ts

let tokenCache: string | null = null;

async function getToken() {
  if (tokenCache) return tokenCache;

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (data.token) {
    tokenCache = data.token;
    return data.token;
  }
  throw new Error('Failed to auth with Shiprocket');
}

export async function linkAwbToShiprocket(awb: string) {
  // Shiprocket doesn't have a simple "track this AWB" API for external orders.
  // Usually, you create the order in Shiprocket first.
  // However, we can TRY to track it if it already exists in their system.
  
  const token = await getToken();
  
  // Just checking tracking status to verify AWB is valid
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return res.json();
}