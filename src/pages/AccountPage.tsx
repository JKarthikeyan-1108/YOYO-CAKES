import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getLocalOrders, type Order } from '@/lib/orders';
import { formatPrice } from '@/data/products';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load customer orders
    const all = getLocalOrders();
    if (user?.email) {
      setOrders(all.filter((o) => o.customer.email.toLowerCase() === user.email?.toLowerCase()));
    } else {
      setOrders(all);
    }
  }, [user]);

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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-primary-dark)] flex items-center justify-center text-white font-heading text-2xl font-bold shadow-md">
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
              <MapPin size={18} /> Saved Addresses
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
                    Profile credentials are authenticated via Firebase Auth.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 sm:p-8 border border-[var(--color-brand-primary-light)]/20">
                <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6">
                  Saved Delivery Addresses
                </h2>
                <div className="p-5 border border-dashed border-[var(--color-brand-primary-light)] rounded-xl bg-[var(--color-brand-cream)]/50 text-center">
                  <MapPin size={32} className="mx-auto text-[var(--color-brand-primary)] mb-2" />
                  <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">
                    Local Delivery Available Across City
                  </p>
                  <p className="text-xs text-[var(--color-brand-muted)] max-w-sm mx-auto mt-1">
                    Your preferred delivery address is automatically captured and confirmed during checkout.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
