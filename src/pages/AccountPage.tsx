import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  Bell,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getAllOrders, type Order } from '@/lib/orders';
import {
  getUserAddressesFromFirestore,
  saveAddressToFirestore,
  deleteAddressFromFirestore,
  getUserSettingsFromFirestore,
  saveUserSettingsToFirestore,
  type SavedAddress,
  type UserSettings,
} from '@/services/firestoreService';
import { formatPrice } from '@/data/products';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: 'Chennai',
    pincode: '',
    isDefault: false,
  });
  const [settings, setSettings] = useState<UserSettings>({
    userId: '',
    theme: 'cream',
    emailNotifications: true,
    orderUpdates: true,
    smsAlerts: false,
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      // 1. Load orders
      const all = await getAllOrders();
      if (user.email) {
        setOrders(
          all.filter(
            (o) =>
              (o.userId && o.userId === user.uid) ||
              o.customer.email.toLowerCase() === user.email?.toLowerCase()
          )
        );
      } else {
        setOrders(all);
      }

      // 2. Load addresses
      const userAddrs = await getUserAddressesFromFirestore(user.uid);
      setAddresses(userAddrs);

      // 3. Load user settings
      const userPrefs = await getUserSettingsFromFirestore(user.uid);
      if (userPrefs) {
        setSettings(userPrefs);
      } else {
        setSettings((prev) => ({ ...prev, userId: user.uid }));
      }
    }

    loadData();
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine || !newAddress.pincode) {
      toast.error('Please complete all address fields.');
      return;
    }

    const addrId = `addr-${Date.now().toString(36)}`;
    const addressToSave: SavedAddress = {
      id: addrId,
      userId: user.uid,
      name: newAddress.name,
      phone: newAddress.phone,
      addressLine: newAddress.addressLine,
      city: newAddress.city,
      pincode: newAddress.pincode,
      isDefault: newAddress.isDefault,
    };

    await saveAddressToFirestore(addressToSave);
    setAddresses((prev) => [...prev, addressToSave]);
    setShowAddressModal(false);
    setNewAddress({
      name: '',
      phone: '',
      addressLine: '',
      city: 'Chennai',
      pincode: '',
      isDefault: false,
    });
    toast.success('Address saved to Firestore!');
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddressFromFirestore(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address removed');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await saveUserSettingsToFirestore({
      ...settings,
      userId: user.uid,
    });
    toast.success('Preferences updated in Firestore!');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-10">
      <div className="container-main max-w-5xl">
        {/* Account Header */}
        <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 mb-8 border border-[var(--color-brand-primary-light)]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary-dark)] text-[var(--color-brand-cream)] flex items-center justify-center font-heading text-2xl font-bold shadow-sm">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'Y'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)]">
                  {user?.displayName || 'Valued Customer'}
                </h1>
                {isAdmin && (
                  <span className="bg-[var(--color-brand-primary-dark)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-brand-muted)]">
                {user?.email || 'Logged in guest'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5">
                <ShieldCheck size={16} /> Admin Portal
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs px-4 py-2 text-[var(--color-brand-error)] hover:bg-[var(--color-brand-error)]/10 border-[var(--color-brand-error)]/30 flex items-center gap-1.5"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Account Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[var(--color-brand-chocolate)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream-dark)]'
              }`}
            >
              <Package size={18} /> Order History ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[var(--color-brand-chocolate)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream-dark)]'
              }`}
            >
              <User size={18} /> Profile Details
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-[var(--color-brand-chocolate)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream-dark)]'
              }`}
            >
              <MapPin size={18} /> Saved Addresses ({addresses.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[var(--color-brand-chocolate)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream-dark)]'
              }`}
            >
              <SettingsIcon size={18} /> Preferences & Alerts
            </button>
            <Link
              to="/wishlist"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white text-[var(--color-brand-chocolate-light)] hover:bg-[var(--color-brand-cream-dark)] transition-colors"
            >
              <Heart size={18} /> My Wishlist
            </Link>
          </div>

          {/* Main Tab Content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 border border-[var(--color-brand-primary-light)]/20">
                <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6 flex items-center justify-between">
                  <span>Past Orders</span>
                  <Link to="/shop" className="text-xs font-sans text-[var(--color-brand-primary-dark)] hover:underline font-normal">
                    Order New Treats +
                  </Link>
                </h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-[var(--color-brand-muted)]/50 mb-3" />
                    <p className="text-[var(--color-brand-muted)] text-sm mb-4">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn-primary text-xs px-6 py-2.5">
                      Explore Our Menu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="border border-[var(--color-brand-primary-light)]/30 rounded-xl p-5 hover:border-[var(--color-brand-primary)] transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                          <div>
                            <span className="font-mono font-bold text-sm text-[var(--color-brand-chocolate)]">
                              {o.id}
                            </span>
                            <span className="text-xs text-[var(--color-brand-muted)] ml-3">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)]">
                              {o.orderStatus.replace('_', ' ')}
                            </span>
                            <span className="text-xs uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-green-50 text-green-700">
                              {o.paymentStatus}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-xs text-[var(--color-brand-chocolate-light)]">
                            <span className="font-semibold">{o.items.length} item(s):</span>{' '}
                            {o.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="font-bold text-base text-[var(--color-brand-primary-dark)]">
                              {formatPrice(o.total)}
                            </div>
                            <Link
                              to={`/order/${o.id}`}
                              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                            >
                              Track <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 border border-[var(--color-brand-primary-light)]/20">
                <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6">
                  Personal Information
                </h2>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.displayName || 'Customer'}
                      className="input-field bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ''}
                      className="input-field bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-brand-muted)] pt-2">
                    Profile credentials and security managed via Firebase Authentication and Cloud Firestore.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 border border-[var(--color-brand-primary-light)]/20 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)]">
                    Saved Delivery Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(!showAddressModal)}
                    className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {showAddressModal && (
                  <form onSubmit={handleSaveAddress} className="p-5 border border-[var(--color-brand-primary-light)] rounded-xl bg-[var(--color-brand-cream)]/30 space-y-4">
                    <h3 className="font-heading text-sm font-bold text-[var(--color-brand-chocolate)]">
                      New Delivery Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Recipient Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          placeholder="e.g. Karthik"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="10-digit mobile number"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                          placeholder="Flat / House No., Landmark, Area"
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="input-field text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          placeholder="600001"
                          className="input-field text-xs py-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressModal(false)}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs px-4 py-1.5">
                        Save to Firestore
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="p-8 border border-dashed border-[var(--color-brand-primary-light)] rounded-xl bg-[var(--color-brand-cream)]/50 text-center">
                    <MapPin size={32} className="mx-auto text-[var(--color-brand-primary)] mb-2" />
                    <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">
                      No saved addresses yet
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)] max-w-sm mx-auto mt-1">
                      Add a delivery address now or save it during checkout for fast 1-click reordering.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 border border-[var(--color-brand-primary-light)]/40 rounded-xl relative hover:border-[var(--color-brand-primary)] transition-colors bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-[var(--color-brand-chocolate)]">
                            {addr.name}
                          </h4>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {addr.addressLine}, {addr.city} – {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          📞 {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 border border-[var(--color-brand-primary-light)]/20">
                <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6 flex items-center gap-2">
                  <Bell size={20} className="text-[var(--color-brand-primary-dark)]" />
                  Account Preferences & Notifications
                </h2>
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Storefront Theme Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cream', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSettings({ ...settings, theme: t })}
                          className={`py-2 px-3 text-xs font-medium rounded-lg border capitalize transition-all ${
                            settings.theme === t
                              ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)] font-bold shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Notification Preferences
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          setSettings({ ...settings, emailNotifications: e.target.checked })
                        }
                        className="rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <span className="text-xs text-gray-700">
                        Email Notifications (Order receipts, promos, and invoices)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={settings.orderUpdates}
                        onChange={(e) =>
                          setSettings({ ...settings, orderUpdates: e.target.checked })
                        }
                        className="rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <span className="text-xs text-gray-700">
                        Order Real-time Status Alerts (Baking, Dispatch, Out for Delivery)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={settings.smsAlerts}
                        onChange={(e) =>
                          setSettings({ ...settings, smsAlerts: e.target.checked })
                        }
                        className="rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                      />
                      <span className="text-xs text-gray-700">
                        SMS & WhatsApp Delivery Notifications
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary text-xs px-6 py-2.5 shadow-md flex items-center gap-2"
                  >
                    <Check size={14} /> Save Preferences to Firestore
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

