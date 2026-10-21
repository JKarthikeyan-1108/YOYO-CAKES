import { useState } from 'react';
import { Save, Store, Phone, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { seedCatalogToFirestore } from '@/lib/seed';

interface BusinessSettings {
  businessName: string;
  tagline: string;
  phone1: string;
  phone2: string;
  email: string;
  instagramUrl: string;
  businessAddress: string;
  openingHours: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  pickupAddress: string;
}

const SETTINGS_KEY = 'yoyo_business_settings';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'YOYO CAKES',
  tagline: 'Every bite, a little happiness.',
  phone1: '8428855444',
  phone2: '6379603744',
  email: 'hello@yoyocakes.in',
  instagramUrl: 'https://instagram.com/yoyocakes_official',
  businessAddress: 'YOYO CAKES Artisan Kitchen, Chennai, Tamil Nadu',
  openingHours: 'Mon – Sun: 9:00 AM – 10:00 PM',
  freeDeliveryThreshold: 500,
  deliveryFee: 40,
  pickupAddress: 'YOYO CAKES Flagship Kitchen & Pick-up Counter',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      toast.success('Business settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
          Business & Storefront Settings
        </h1>
        <p className="text-sm text-[var(--color-brand-muted)] mt-1">
          Configure brand identifiers, customer contact hotlines, delivery rates, and pickup locations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Store size={20} className="text-[var(--color-brand-primary-dark)]" />
            Brand Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Channels */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Phone size={20} className="text-[var(--color-brand-primary-dark)]" />
            Customer Contact Hotlines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Primary Phone *
              </label>
              <input
                type="text"
                name="phone1"
                required
                value={settings.phone1}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Secondary Phone *
              </label>
              <input
                type="text"
                name="phone2"
                required
                value={settings.phone2}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Instagram Handle / URL
            </label>
            <input
              type="text"
              name="instagramUrl"
              value={settings.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/yoyocakes"
              className="input-field text-xs py-2"
            />
          </div>
        </div>

        {/* Delivery & Fulfillment Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Truck size={20} className="text-[var(--color-brand-primary-dark)]" />
            Fulfillment & Delivery Charges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Standard Delivery Fee (₹)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={settings.deliveryFee}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                name="freeDeliveryThreshold"
                value={settings.freeDeliveryThreshold}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Store Pickup Address & Counter
            </label>
            <input
              type="text"
              name="pickupAddress"
              value={settings.pickupAddress}
              onChange={handleChange}
              className="input-field text-xs py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bakery Operating Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={settings.openingHours}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Main Kitchen Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={settings.businessAddress}
                onChange={handleChange}
                className="input-field text-xs py-2"
              />
            </div>
          </div>
        </div>

        {/* Database & Cloud Firestore Sync */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
                <Shield size={20} className="text-[var(--color-brand-primary-dark)]" />
                Database Catalog Synchronization
              </h2>
              <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                Populate or sync all 27 artisanal dessert products and categories with Cloud Firestore
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const res = await seedCatalogToFirestore();
                if (res.success) {
                  toast.success(`Synced ${res.count} products to Cloud Firestore!`);
                } else {
                  toast(res.error || 'Seed skipped (Configure Firebase in .env to sync)', { icon: 'ℹ️' });
                }
              }}
              className="btn-secondary text-xs px-4 py-2 font-semibold"
            >
              Sync 27 Items to Firestore
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="btn-primary px-8 py-3 text-sm flex items-center gap-2 shadow-elevated"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
