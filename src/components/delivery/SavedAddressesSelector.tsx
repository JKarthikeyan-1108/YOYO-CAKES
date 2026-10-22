import React from 'react';
import { MapPin, CheckCircle, Edit3, Trash2, Plus, Star, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { type SavedAddress, deleteAddressFromFirestore, setDefaultAddressInFirestore } from '@/services/firestoreService';

interface SavedAddressesSelectorProps {
  addresses: SavedAddress[];
  selectedAddressId: string;
  onSelectAddress: (address: SavedAddress) => void;
  onAddNewAddress: () => void;
  onEditAddress: (address: SavedAddress) => void;
  onAddressDeleted: (addressId: string) => void;
  userId?: string;
}

export default function SavedAddressesSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onAddressDeleted,
  userId,
}: SavedAddressesSelectorProps) {
  const handleDelete = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this delivery address?')) {
      try {
        await deleteAddressFromFirestore(addressId);
        toast.success('Address removed from your address book.');
        onAddressDeleted(addressId);
      } catch (err: any) {
        toast.error('Failed to remove address.');
      }
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await setDefaultAddressInFirestore(userId, addressId);
      toast.success('Default delivery address updated.');
    } catch {
      toast.error('Failed to update default address.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
          Your Saved Delivery Addresses ({addresses.length})
        </label>
        <button
          type="button"
          onClick={onAddNewAddress}
          className="text-xs font-bold text-[var(--color-brand-primary-dark)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Add New GPS Address
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[var(--color-brand-primary-dark)] bg-amber-50/40 shadow-xs ring-1 ring-[var(--color-brand-primary-dark)]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">
                      {addr.recipientName || addr.name || 'Recipient'}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} className="fill-amber-500 text-amber-500" /> Default
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={13} />
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {addr.addressLine1 || addr.addressLine}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </p>

                <p className="text-xs text-gray-700 font-medium mt-1">
                  {addr.locality ? `${addr.locality}, ` : ''}{addr.city} — {addr.postalCode || addr.pincode}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-gray-500 font-mono">
                    📞 {addr.phone}
                  </span>
                  {typeof addr.latitude === 'number' && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
                      <Navigation size={10} /> GPS Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-[11px]">
                {!addr.isDefault && userId && (
                  <button
                    type="button"
                    onClick={(e) => handleSetDefault(e, addr.id)}
                    className="text-gray-500 hover:text-amber-800 font-medium cursor-pointer"
                  >
                    Set as default
                  </button>
                )}
                {addr.isDefault && <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAddress(addr);
                    }}
                    className="text-gray-500 hover:text-[var(--color-brand-primary-dark)] p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                    title="Edit address"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, addr.id)}
                    className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Address Card */}
        <div
          onClick={onAddNewAddress}
          className="p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50/50 hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[140px] group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus size={18} />
          </div>
          <span className="text-xs font-bold text-[var(--color-brand-chocolate)]">
            + Add New GPS Delivery Address
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            Pinpoint on Google Map & save for 1-click checkout
          </span>
        </div>
      </div>
    </div>
  );
}
