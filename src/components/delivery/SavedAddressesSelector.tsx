import React from 'react';
import { CheckCircle, Edit3, Trash2, Plus, Star, Navigation } from 'lucide-react';
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
      } catch {
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
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)] block">
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
                  ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-surface-elevated)] shadow-xs ring-1 ring-[var(--color-brand-primary-dark)]/20'
                  : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] hover:border-[var(--color-brand-primary-dark)] hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--color-brand-chocolate)]">
                      {addr.recipientName || addr.name || 'Recipient'}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-primary-dark)] border border-[var(--color-brand-border)] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} className="fill-[var(--color-brand-primary-dark)] text-[var(--color-brand-primary-dark)]" /> Default
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={13} />
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--color-brand-muted)] line-clamp-2 leading-relaxed">
                  {addr.addressLine1 || addr.addressLine}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </p>

                <p className="text-xs text-[var(--color-brand-chocolate)] font-medium mt-1">
                  {addr.locality ? `${addr.locality}, ` : ''}{addr.city} — {addr.postalCode || addr.pincode}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[var(--color-brand-muted)] font-mono">
                    📞 {addr.phone}
                  </span>
                  {typeof addr.latitude === 'number' && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 border border-emerald-500/20">
                      <Navigation size={10} /> GPS Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-brand-border)] text-[11px]">
                {!addr.isDefault && userId && (
                  <button
                    type="button"
                    onClick={(e) => handleSetDefault(e, addr.id)}
                    className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] font-medium cursor-pointer"
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
                    className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary-dark)] p-1 rounded-md hover:bg-[var(--color-brand-surface-elevated)] cursor-pointer"
                    title="Edit address"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, addr.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
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
          className="p-4 rounded-2xl border-2 border-dashed border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-surface-elevated)]/60 hover:bg-[var(--color-brand-surface-elevated)] transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[140px] group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-surface)] text-[var(--color-brand-primary-dark)] border border-[var(--color-brand-border)] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus size={18} />
          </div>
          <span className="text-xs font-bold text-[var(--color-brand-chocolate)]">
            + Add New GPS Delivery Address
          </span>
          <span className="text-[10px] text-[var(--color-brand-muted)] mt-0.5">
            Pinpoint on Google Map & save for 1-click checkout
          </span>
        </div>
      </div>
    </div>
  );
}
