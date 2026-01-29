// lib/services/shiprocket-full.ts

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

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
    tokenCache = {
      token: data.token,
      expiresAt: now + 9 * 24 * 60 * 60 * 1000,
    };
    return data.token;
  }
  throw new Error('Shiprocket Auth Failed: ' + JSON.stringify(data));
}

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const token = await getToken();
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export const shiprocket = {
  checkServiceability: async (pickupPincode: string, deliveryPincode: string, weight: number, cod: boolean) => {
    return apiCall(`/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod ? 1 : 0}`);
  },
  createOrder: async (orderData: any) => {
    return apiCall('/orders/create/adhoc', 'POST', orderData);
  },
  assignAWB: async (shipmentId: string, courierId: string) => {
    return apiCall('/courier/assign/awb', 'POST', { shipment_id: shipmentId, courier_id: courierId });
  },
  requestPickup: async (shipmentId: string) => {
    return apiCall('/courier/generate/pickup', 'POST', { shipment_id: [shipmentId] });
  },
  generateManifest: async (shipmentId: string) => {
    return apiCall('/manifests/generate', 'POST', { shipment_id: [shipmentId] });
  },
  printManifest: async (orderIds: string[]) => {
    return apiCall('/manifests/print', 'POST', { order_ids: orderIds });
  },
  generateLabel: async (shipmentId: string) => {
    return apiCall('/courier/generate/label', 'POST', { shipment_id: [shipmentId] });
  },
  printInvoice: async (orderIds: string[]) => {
    return apiCall('/orders/print/invoice', 'POST', { ids: orderIds });
  },
  trackAWB: async (awb: string) => {
    return apiCall(`/courier/track/awb/${awb}`);
  },
  getOrders: async (page = 1) => {
    return apiCall(`/orders?page=${page}&per_page=20&sort=desc`);
  }
};