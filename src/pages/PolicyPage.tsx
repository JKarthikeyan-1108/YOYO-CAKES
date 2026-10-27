import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Truck, RefreshCw, AlertCircle } from 'lucide-react';

interface PolicyData {
  title: string;
  badge: string;
  icon: any;
  updatedAt: string;
  sections: { heading: string; body: string }[];
}

const POLICIES: Record<string, PolicyData> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    badge: 'Your Privacy Matters',
    icon: ShieldCheck,
    updatedAt: 'October 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'When you place an order with YOYO CAKES or register an account, we collect necessary personal details such as your full name, email address, contact phone number, and physical delivery address. Payment card and banking credentials are processed exclusively through our certified payment partner Razorpay; YOYO CAKES never views or stores sensitive card CVVs or net banking passwords.',
      },
      {
        heading: '2. Purpose of Data Use',
        body: 'Your information is used solely to fulfill your cake and dessert orders, provide real-time delivery notifications, respond to your inquiries, and occasionally inform you about festive promotions if opted in.',
      },
      {
        heading: '3. Data Security & Storage',
        body: 'We utilize enterprise-grade cloud encryption (Firebase Auth, Cloud Firestore) to safeguard your customer records against unauthorized disclosure or loss.',
      },
      {
        heading: '4. Third-Party Sharing',
        body: 'We do not sell, rent, or trade your personal information. Data is shared exclusively with necessary fulfillment partners (delivery drivers and Razorpay payment gateway) strictly for order completion.',
      },
    ],
  },
  'terms': {
    title: 'Terms & Conditions',
    badge: 'Terms of Service',
    icon: FileText,
    updatedAt: 'October 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By browsing the YOYO CAKES website, registering an account, or placing an order, you agree to comply with and be bound by these Terms and Conditions.',
      },
      {
        heading: '2. Product Pricing & Catalog',
        body: 'All prices shown on our website are in Indian Rupees (₹). While we strive for absolute accuracy across our 27 signature dessert items, YOYO CAKES reserves the right to modify prices, ingredients, and availability with prior notice in administrative records.',
      },
      {
        heading: '3. Order Acceptance & Verification',
        body: 'An order is confirmed only upon successful payment authorization through Razorpay or verified admin reconciliation. In the event of pricing errors or inventory stockouts, YOYO CAKES will contact the customer for a full prompt refund.',
      },
      {
        heading: '4. Food Safety & Consumption',
        body: 'Our baked items contain dairy, sugar, and wheat flour, and may contain traces of nuts and cocoa. Customers are advised to store refrigerated items (cakes and tiramisu) at 2°C – 5°C and consume within the stated shelf life.',
      },
    ],
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    badge: 'Delivery Guidelines',
    icon: Truck,
    updatedAt: 'October 2026',
    sections: [
      {
        heading: '1. Delivery Coverage',
        body: 'YOYO CAKES provides direct local delivery across designated city zones. Orders are packaged carefully with temperature retention boxes to ensure your cakes and desserts arrive in pristine condition.',
      },
      {
        heading: '2. Delivery Charges',
        body: 'Delivery charges are calculated based on your delivery address, distance from our local patisserie kitchen, and selected delivery slot. Exact delivery fees are calculated and clearly shown at checkout before you make any payment.',
      },
      {
        heading: '3. Delivery Timelines',
        body: 'Orders are freshly baked and dispatched according to your selected time slot or within 2 to 4 hours of confirmation for immediate same-day orders. Specific delivery times depend on traffic and weather conditions.',
      },
      {
        heading: '4. Store Pickup',
        body: 'Customers selecting "Store Pickup" can collect their orders from the YOYO CAKES main kitchen during business hours (9:00 AM – 10:00 PM) free of charge.',
      },
    ],
  },
  'cancellation-policy': {
    title: 'Cancellation & Refund Policy',
    badge: 'Customer Satisfaction Guarantee',
    icon: RefreshCw,
    updatedAt: 'October 2026',
    sections: [
      {
        heading: '1. Order Cancellations',
        body: 'As our bakery items are perishable and handcrafted to order, cancellations can only be accepted if requested before our kitchen commences preparation (usually within 30 minutes of placing the order). Once an item is in the oven or decorated, cancellation is not possible.',
      },
      {
        heading: '2. Damaged or Incorrect Items',
        body: 'In the unlikely event that your dessert arrives damaged during transit or differs from what was ordered, please notify us within 2 hours of delivery by providing a photograph via WhatsApp to +91 84288 55444.',
      },
      {
        heading: '3. Refund Processing',
        body: 'Approved refunds are credited back to the original payment source through Razorpay within 5 to 7 business days, in compliance with standard bank processing timelines.',
      },
    ],
  },
};

export default function PolicyPage() {
  const location = useLocation();
  const slug = location.pathname.replace('/', '') || 'privacy-policy';
  const policy = POLICIES[slug] || POLICIES['privacy-policy'];
  const Icon = policy.icon;

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-12 lg:py-20 text-[var(--color-brand-chocolate)]">
      <div className="container-main max-w-4xl">
        {/* Policy Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { path: '/privacy-policy', label: 'Privacy Policy' },
            { path: '/terms', label: 'Terms & Conditions' },
            { path: '/shipping-policy', label: 'Shipping Policy' },
            { path: '/cancellation-policy', label: 'Cancellation & Refund' },
          ].map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] shadow-sm font-bold'
                    : 'bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-cream-dark)]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Notice of Owner Approval */}
        <div className="bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] rounded-xl p-3.5 mb-8 flex items-center gap-3 text-xs text-[var(--color-brand-chocolate)]">
          <AlertCircle size={16} className="text-[var(--color-brand-primary)] flex-shrink-0" />
          <span>
            <strong>Business Notice:</strong> Policy terms are maintained by YOYO CAKES management. Legal modifications are managed via Admin Settings.
          </span>
        </div>

        {/* Main Content Card */}
        <div className="bg-[var(--color-brand-surface)] rounded-3xl shadow-elevated p-8 sm:p-12 border border-[var(--color-brand-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary)] flex items-center justify-center">
              <Icon size={20} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-brand-primary)]">
                {policy.badge}
              </span>
              <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
                {policy.title}
              </h1>
            </div>
          </div>
          <p className="text-xs text-[var(--color-brand-muted)] mb-8 pb-4 border-b border-[var(--color-brand-border)]">
            Last Updated: {policy.updatedAt} • YOYO CAKES Bakery Operations
          </p>

          <div className="space-y-6">
            {policy.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                  {section.heading}
                </h2>
                <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--color-brand-border)] text-xs text-[var(--color-brand-muted)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>Questions regarding this policy?</span>
            <Link to="/contact" className="text-[var(--color-brand-primary)] font-semibold hover:underline">
              Contact our Support Desk →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
