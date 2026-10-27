import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Store, 
  Truck, 
  ToggleLeft,
  ToggleRight,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  fetchDeliverySettings, 
  updateDeliverySettingsApi, 
  type DeliverySettings,
  FALLBACK_DELIVERY_SETTINGS
} from '@/services/deliveryService';
import InteractiveGoogleMap from '@/components/delivery/InteractiveGoogleMap';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delivery settings state
  const [settings, setSettings] = useState<DeliverySettings>(FALLBACK_DELIVERY_SETTINGS);

  useEffect(() => {
    fetchDeliverySettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleToggle = (key: 'deliveryEnabled' | 'pickupEnabled') => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLocationPicked = (loc: { latitude: number; longitude: number; formattedAddress?: string }) => {
    setSettings((prev) => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      storeAddress: loc.formattedAddress || prev.storeAddress,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be signed in as an administrator to modify delivery rules.');
      return;
    }

    setSaving(true);
    try {
      await updateDeliverySettingsApi(settings);
      toast.success('Bakery delivery rules and store location updated in Firestore & Render API!');
    } catch (err: any) {
      console.error('[AdminSettingsPage] Update error:', err);
      toast.error(err?.message || 'Failed to update delivery settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <span className="loading loading-spinner text-warning loading-lg" />
        <p className="text-xs text-[var(--color-brand-muted)] mt-2">Loading bakery delivery rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-brand-chocolate)]">
            Delivery & Bakery Kitchen Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
            Configure bakery store GPS coordinates, service radius, delivery fee formulas, and fulfillment toggles
          </p>
        </div>

        <button
          type="submit"
          form="delivery-settings-form"
          disabled={saving}
          className="btn btn-primary text-xs px-5 flex items-center gap-2 self-start sm:self-auto shadow-md"
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form id="delivery-settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Fulfillment Status Toggles */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs space-y-4">
          <h2 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Package size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
            Fulfillment Availability Toggles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doorstep Delivery Toggle */}
            <div
              onClick={() => handleToggle('deliveryEnabled')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                settings.deliveryEnabled
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-[var(--color-brand-cream-dark)] border-[var(--color-brand-border)] opacity-70'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-[var(--color-brand-chocolate)] block">
                  Doorstep Delivery Service
                </span>
                <span className="text-[11px] text-[var(--color-brand-muted)]">
                  {settings.deliveryEnabled
                    ? 'Active: Accepting fresh delivery orders'
                    : 'Paused: Delivery paused for kitchen maintenance'}
                </span>
              </div>
              <button type="button" className="text-2xl text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">
                {settings.deliveryEnabled ? <ToggleRight size={28} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={28} className="text-gray-400 dark:text-gray-600" />}
              </button>
            </div>

            {/* In-Store Pickup Toggle */}
            <div
              onClick={() => handleToggle('pickupEnabled')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                settings.pickupEnabled
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                  : 'bg-[var(--color-brand-cream-dark)] border-[var(--color-brand-border)] opacity-70'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-[var(--color-brand-chocolate)] block">
                  In-Store Bakery Pickup
                </span>
                <span className="text-[11px] text-[var(--color-brand-muted)]">
                  {settings.pickupEnabled
                    ? 'Active: Customers can pick up at counter'
                    : 'Disabled: Pick-up counter closed'}
                </span>
              </div>
              <button type="button" className="text-2xl text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">
                {settings.pickupEnabled ? <ToggleRight size={28} className="text-blue-600 dark:text-blue-400" /> : <ToggleLeft size={28} className="text-gray-400 dark:text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bakery Store Location & GPS Coordinates */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
              <Store size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
              Bakery Kitchen Location & GPS Coordinates
            </h2>
            <span className="text-[11px] font-mono text-[var(--color-brand-muted)] bg-[var(--color-brand-cream-dark)] px-2 py-0.5 rounded border border-[var(--color-brand-border)]">
              {settings.latitude.toFixed(4)}° N, {settings.longitude.toFixed(4)}° E
            </span>
          </div>

          <p className="text-xs text-[var(--color-brand-muted)]">
            Click on the map or drag the pin to configure the central kitchen location where cakes are baked and dispatched from.
          </p>

          <InteractiveGoogleMap
            initialCoords={{ latitude: settings.latitude, longitude: settings.longitude }}
            onLocationSelected={handleLocationPicked}
            maxRadiusKm={settings.maxRadiusKm}
            height="280px"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Bakery Kitchen Name
              </label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="input-field text-xs py-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.00001"
                name="latitude"
                value={settings.latitude}
                onChange={handleChange}
                className="input-field text-xs py-2 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.00001"
                name="longitude"
                value={settings.longitude}
                onChange={handleChange}
                className="input-field text-xs py-2 font-mono"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Physical Street Address
              </label>
              <input
                type="text"
                name="storeAddress"
                value={settings.storeAddress}
                onChange={handleChange}
                className="input-field text-xs py-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Delivery Radius & Pricing Formulas */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs space-y-4">
          <h2 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Truck size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
            Delivery Service Radius & Fee Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Maximum Delivery Radius (km) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="maxRadiusKm"
                  min="1"
                  max="100"
                  value={settings.maxRadiusKm}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pr-8"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">km</span>
              </div>
              <p className="text-[10px] text-[var(--color-brand-muted)] mt-0.5">Orders beyond this radius are restricted to pickup.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Minimum Cart Value for Delivery (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">₹</span>
                <input
                  type="number"
                  name="minOrderValue"
                  min="0"
                  value={settings.minOrderValue}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Complimentary Delivery Threshold (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">₹</span>
                <input
                  type="number"
                  name="freeDeliveryThreshold"
                  min="0"
                  value={settings.freeDeliveryThreshold}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pl-7"
                  required
                />
              </div>
              <p className="text-[10px] text-[var(--color-brand-muted)] mt-0.5">Carts at or above this value qualify for complimentary delivery waiver.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Base Delivery Fee (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">₹</span>
                <input
                  type="number"
                  name="baseDeliveryFee"
                  min="0"
                  value={settings.baseDeliveryFee}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pl-7"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Base Radius Covered by Base Fee (km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="baseRadiusKm"
                  min="1"
                  value={settings.baseRadiusKm}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">km</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Extra Rate per km beyond Base Radius (₹/km)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[var(--color-brand-muted)] font-bold">₹</span>
                <input
                  type="number"
                  name="ratePerKmBeyondBase"
                  min="0"
                  value={settings.ratePerKmBeyondBase}
                  onChange={handleChange}
                  className="input-field text-xs py-2 pl-7"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Counter Details */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs space-y-4">
          <h2 className="font-heading text-base font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
            <Store size={18} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
            Pick-up Counter Instructions for Customers
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Pick-up Counter Address & Directions
              </label>
              <input
                type="text"
                name="pickupAddress"
                value={settings.pickupAddress}
                onChange={handleChange}
                className="input-field text-xs py-2"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-chocolate)] mb-1">
                Pick-up Collection Instructions
              </label>
              <textarea
                name="pickupInstructions"
                value={settings.pickupInstructions}
                onChange={handleChange}
                rows={2}
                className="input-field text-xs py-2"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary text-xs px-6 py-2.5 flex items-center gap-2 shadow-md"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
