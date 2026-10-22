import React, { useState, useEffect } from 'react';
import { X, MapPin, Save, User, Home, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  saveAddressToFirestore, 
  type SavedAddress 
} from '@/services/firestoreService';
import InteractiveGoogleMap, { type LocationCoordinates } from './InteractiveGoogleMap';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (address: SavedAddress) => void;
  editingAddress?: SavedAddress | null;
}

export default function AddressFormModal({
  isOpen,
  onClose,
  onAddressSaved,
  editingAddress,
}: AddressFormModalProps) {
  const { user } = useAuthStore();

  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('600001');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [latitude, setLatitude] = useState<number>(13.085);
  const [longitude, setLongitude] = useState<number>(80.2101);
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing address if editing, or default to current user profile
  useEffect(() => {
    if (editingAddress) {
      setRecipientName(editingAddress.recipientName || editingAddress.name || '');
      setPhone(editingAddress.phone || '');
      setAddressLine1(editingAddress.addressLine1 || editingAddress.addressLine || '');
      setAddressLine2(editingAddress.addressLine2 || '');
      setLocality(editingAddress.locality || '');
      setCity(editingAddress.city || 'Chennai');
      setState(editingAddress.state || 'Tamil Nadu');
      setPostalCode(editingAddress.postalCode || editingAddress.pincode || '600001');
      setDeliveryInstructions(editingAddress.deliveryInstructions || '');
      setLatitude(typeof editingAddress.latitude === 'number' ? editingAddress.latitude : 13.085);
      setLongitude(typeof editingAddress.longitude === 'number' ? editingAddress.longitude : 80.2101);
      setIsDefault(Boolean(editingAddress.isDefault));
    } else {
      setRecipientName(user?.displayName || '');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setLocality('');
      setCity('Chennai');
      setState('Tamil Nadu');
      setPostalCode('600001');
      setDeliveryInstructions('');
      setLatitude(13.085);
      setLongitude(80.2101);
      setIsDefault(false);
    }
  }, [editingAddress, user, isOpen]);

  if (!isOpen) return null;

  const handleLocationPicked = (loc: LocationCoordinates) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    if (loc.street) setAddressLine1((prev) => prev || loc.street || '');
    if (loc.locality) setLocality(loc.locality);
    if (loc.city) setCity(loc.city);
    if (loc.state) setState(loc.state);
    if (loc.postalCode) setPostalCode(loc.postalCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      toast.error('Please sign in to save your delivery address.');
      return;
    }

    if (!recipientName.trim()) {
      toast.error('Recipient name is required.');
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      toast.error('Valid 10-digit mobile number is required for delivery coordination.');
      return;
    }

    if (!addressLine1.trim()) {
      toast.error('House/Flat number and street are required.');
      return;
    }

    if (!postalCode.trim() || postalCode.length < 6) {
      toast.error('Valid 6-digit postal PIN code is required.');
      return;
    }

    setIsSaving(true);
    try {
      const addressId = editingAddress?.id || `addr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      
      const newAddress: SavedAddress = {
        id: addressId,
        userId: user.uid,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        locality: locality.trim() || city.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        latitude,
        longitude,
        deliveryInstructions: deliveryInstructions.trim(),
        isDefault,
        // Legacy aliases
        name: recipientName.trim(),
        addressLine: `${addressLine1.trim()}${addressLine2.trim() ? ', ' + addressLine2.trim() : ''}`,
        pincode: postalCode.trim(),
      };

      await saveAddressToFirestore(newAddress);
      toast.success(editingAddress ? 'Address updated successfully!' : 'Delivery address saved!');
      onAddressSaved(newAddress);
      onClose();
    } catch (err: any) {
      console.error('[AddressFormModal] Save error:', err);
      toast.error(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4A2411] to-[#2D1609] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <MapPin size={17} />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold">
                {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address & GPS Pin'}
              </h3>
              <p className="text-[11px] text-white/70">
                Pinpoint your gate on the map for accurate doorstep delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Interactive Map & GPS Locator */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
              Step 1: Pinpoint Delivery Location on Map
            </label>
            <InteractiveGoogleMap
              initialCoords={{ latitude, longitude }}
              onLocationSelected={handleLocationPicked}
              height="260px"
            />
          </div>

          {/* Section 2: Address Input Form */}
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Step 2: Recipient & Building Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Recipient Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none"
                  />
                  <User size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Mobile Number *
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:border-[var(--color-brand-primary-dark)] overflow-hidden">
                  <span className="bg-gray-100 px-2.5 py-2 text-xs font-semibold text-gray-600 border-r border-gray-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs sm:text-sm outline-none font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Flat / House / Building & Street *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Flat 302, Royal Palms, 2nd Cross Street"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none"
                  />
                  <Home size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Apartment Name / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Near Metro / Behind Hospital"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Area / Locality *
                </label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Anna Nagar East / T. Nagar"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Postal PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="600040"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City & State *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs sm:text-sm outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Instructions for Driver (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. Leave with security / Ring bell twice / Fragile cake box"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm outline-none"
                  />
                  <FileText size={15} className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-warning rounded-md"
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    Set this as my primary default delivery address
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="address-form"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary-dark)] hover:bg-[#85300B] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving Address...' : 'Save & Confirm Address'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
