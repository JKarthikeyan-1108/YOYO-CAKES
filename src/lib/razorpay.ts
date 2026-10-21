// Razorpay client integration utility

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (e.g. ₹150 = 15000)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const RAZORPAY_TEST_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_yoyo';

export function openRazorpayCheckout({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onDismiss,
}: {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: () => void;
}): void {
  // Check if real Razorpay script is loaded and configured
  if (window.Razorpay && import.meta.env.VITE_RAZORPAY_KEY_ID) {
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: 'INR',
      name: 'YOYO CAKES',
      description: `Order #${orderId}`,
      theme: {
        color: '#7F5643',
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      handler: onSuccess,
      modal: {
        ondismiss: onDismiss,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    // Test mode fallback simulation
    console.info('Razorpay test mode: simulated payment flow');
    setTimeout(() => {
      onSuccess({
        razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
        razorpay_order_id: `order_test_${orderId}`,
        razorpay_signature: `sig_test_${Math.random().toString(36).substring(2, 15)}`,
      });
    }, 1200);
  }
}
