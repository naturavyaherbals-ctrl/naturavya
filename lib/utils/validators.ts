export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}

export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

export function isValidGST(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
}

export function sanitizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.substring(2);
  }
  return cleaned;
}

export function validateCheckoutForm(data: {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.length < 2) {
    errors.name = 'Name is required';
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = 'Valid 10-digit phone number is required';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }

  if (!data.address || data.address.length < 10) {
    errors.address = 'Complete address is required';
  }

  if (!data.city) {
    errors.city = 'City is required';
  }

  if (!data.state) {
    errors.state = 'State is required';
  }

  if (!isValidPincode(data.pincode)) {
    errors.pincode = 'Valid 6-digit pincode is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
