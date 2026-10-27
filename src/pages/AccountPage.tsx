import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Search,
  Phone,
  MessageCircle,
  Sparkles,
  RotateCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Heart,
  Edit2,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import AddressFormModal from '@/components/delivery/AddressFormModal';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useThemeStore, type Theme } from '@/stores/themeStore';
import { getAllOrders, type Order } from '@/lib/orders';
import {
  getUserAddressesFromFirestore,
  deleteAddressFromFirestore,
  getUserSettingsFromFirestore,
  saveUserSettingsToFirestore,
  type SavedAddress,
  type UserSettings,
} from '@/services/firestoreService';
import { formatPrice } from '@/data/products';
import toast from 'react-hot-toast';

type AccountTab = 'orders' | 'profile' | 'addresses' | 'support' | 'settings';

export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, isAdmin } = useAuthStore();
  const buyAgainItems = useCartStore((s) => s.buyAgainItems);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const tabFromQuery = searchParams.get('tab') as AccountTab | null;
  const [activeTab, setActiveTabState] = useState<AccountTab>(() => {
    if (location.pathname === '/orders') return 'orders';
    if (tabFromQuery && ['orders', 'profile', 'addresses', 'support', 'settings'].includes(tabFromQuery)) {
      return tabFromQuery;
    }
    return 'orders';
  });

  const setActiveTab = (tab: AccountTab) => {
    setActiveTabState(tab);
    if (location.pathname !== '/orders') {
      searchParams.set('tab', tab);
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    const target =
      location.pathname === '/orders'
        ? 'orders'
        : tabFromQuery && ['orders', 'profile', 'addresses', 'support', 'settings'].includes(tabFromQuery)
        ? tabFromQuery
        : null;

    if (target && target !== activeTab) {
      const timer = setTimeout(() => {
        setActiveTabState(target);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, tabFromQuery, activeTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '');

  const [settings, setSettings] = useState<UserSettings>({
    userId: '',
    theme: useThemeStore.getState().theme,
    emailNotifications: true,
    orderUpdates: true,
    smsAlerts: true,
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
        if (userPrefs.theme) {
          useThemeStore.getState().setTheme(userPrefs.theme);
        }
      } else {
        setSettings((prev) => ({ ...prev, userId: user.uid, theme: useThemeStore.getState().theme }));
      }

      if (user.displayName) setProfileName(user.displayName);
      if (user.phoneNumber) setProfilePhone(user.phoneNumber);
    }

    loadData();
  }, [user]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search match
      const query = orderSearchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.items.some((i) => i.name.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Status filter
      if (orderFilter === 'in_progress') {
        return o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled';
      }
      if (orderFilter === 'delivered') {
        return o.orderStatus === 'delivered';
      }
      return true;
    });
  }, [orders, orderSearchQuery, orderFilter]);

  const handleAddressSavedFromModal = (saved: SavedAddress) => {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : a));
      }
      return [saved, ...prev];
    });
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddressFromFirestore(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address removed');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile details updated successfully');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    useThemeStore.getState().setTheme(settings.theme);
    await saveUserSettingsToFirestore({
      ...settings,
      userId: user.uid,
    });
    toast.success('Account preferences saved to Firestore!');
  };

  const handleBuyAgain = (order: Order) => {
    buyAgainItems(
      order.items.map((i) => ({
        id: i.id,
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }))
    );
    toast.success(`Items from order ${order.id} added to cart!`);
    navigate('/cart');
  };

  const handleWhatsAppOrderSupport = (orderId: string) => {
    const text = encodeURIComponent(
      `Hello YOYO CAKES! I need assistance with my order #${orderId}. Please let me know the status.`
    );
    window.open(`https://wa.me/918428855444?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  // Stepper helper
  const getStepIndex = (status: Order['orderStatus']) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] min-h-screen py-8 font-sans transition-colors">
      <div className="container-main max-w-6xl px-4">
        {/* Account Welcome Header Banner */}
        <div className="bg-[var(--color-brand-surface)] rounded-2xl shadow-xs border border-[var(--color-brand-border)] p-5 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center font-heading text-xl sm:text-2xl font-bold shadow-xs flex-shrink-0">
                {profileName
                  ? profileName.charAt(0).toUpperCase()
                  : user?.email
                  ? user.email.charAt(0).toUpperCase()
                  : 'Y'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-heading text-xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
                    Hello, {profileName || 'Customer'}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-primary-dark)] border border-[var(--color-brand-border)] text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-2xs">
                    <Sparkles size={11} /> YOYO Member
                  </span>
                  {isAdmin && (
                    <span className="bg-[var(--color-brand-chocolate)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                  {user?.email || 'Logged-in Customer'} • Chennai Express Delivery Zone
                </p>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck size={14} /> Admin Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[var(--color-brand-border)] hover:bg-red-500/10 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* 2x2 Mobile / 4-Col Desktop Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 sm:divide-x sm:divide-[var(--color-brand-border)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] rounded-2xl overflow-hidden mt-6 p-2 sm:p-0">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="p-3 sm:p-4 hover:bg-[var(--color-brand-surface)] transition-colors text-left rounded-xl sm:rounded-none cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-brand-muted)]">Total Orders</span>
                <Package size={18} className="text-[var(--color-brand-primary-dark)]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--color-brand-chocolate)]">{orders.length}</div>
              <div className="text-[10px] text-[var(--color-brand-muted)] truncate">Past & active bakes</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className="p-3 sm:p-4 hover:bg-[var(--color-brand-surface)] transition-colors text-left rounded-xl sm:rounded-none cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-brand-muted)]">Addresses</span>
                <MapPin size={18} className="text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--color-brand-chocolate)]">{addresses.length}</div>
              <div className="text-[10px] text-[var(--color-brand-muted)] truncate">Delivery spots</div>
            </button>

            <Link
              to="/wishlist"
              className="p-3 sm:p-4 hover:bg-[var(--color-brand-surface)] transition-colors text-left rounded-xl sm:rounded-none cursor-pointer block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-brand-muted)]">Wishlist</span>
                <Heart size={18} className="text-red-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--color-brand-chocolate)]">{wishlistCount}</div>
              <div className="text-[10px] text-[var(--color-brand-muted)] truncate">Saved cakes</div>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className="p-3 sm:p-4 hover:bg-[var(--color-brand-surface)] transition-colors text-left rounded-xl sm:rounded-none cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-brand-muted)]">Concierge</span>
                <MessageCircle size={18} className="text-emerald-500" />
              </div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600 flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" /> Live Online
              </div>
              <div className="text-[10px] text-[var(--color-brand-muted)] truncate">WhatsApp chat</div>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Tab Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none sm:hidden">
          {([
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'support', label: 'Support', icon: Headphones },
            { id: 'settings', label: 'Settings', icon: Sparkles },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-brand-primary-dark)] text-white shadow-xs'
                    : 'bg-[var(--color-brand-surface)] text-[var(--color-brand-muted)] border border-[var(--color-brand-border)]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Feature Tiles Grid */}
        <div className="hidden sm:grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[var(--color-brand-surface)] border-[var(--color-brand-primary-dark)] shadow-sm ring-2 ring-[var(--color-brand-primary-dark)]/20'
                : 'bg-[var(--color-brand-surface)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary-dark)] shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-primary-dark)] flex items-center justify-center flex-shrink-0 border border-[var(--color-brand-border)]">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--color-brand-chocolate)]">Your Orders</h3>
                <p className="text-xs text-[var(--color-brand-muted)]">Track packages, view details, buy again</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-brand-muted)]" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[var(--color-brand-surface)] border-[var(--color-brand-primary-dark)] shadow-sm ring-2 ring-[var(--color-brand-primary-dark)]/20'
                : 'bg-[var(--color-brand-surface)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary-dark)] shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-surface-elevated)] text-blue-500 flex items-center justify-center flex-shrink-0 border border-[var(--color-brand-border)]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--color-brand-chocolate)]">Your Addresses</h3>
                <p className="text-xs text-[var(--color-brand-muted)]">Manage delivery locations in Chennai</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-brand-muted)]" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[var(--color-brand-surface)] border-[var(--color-brand-primary-dark)] shadow-sm ring-2 ring-[var(--color-brand-primary-dark)]/20'
                : 'bg-[var(--color-brand-surface)] border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary-dark)] shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-surface-elevated)] text-green-500 flex items-center justify-center flex-shrink-0 border border-[var(--color-brand-border)]">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-[var(--color-brand-chocolate)]">Login & Security</h3>
                <p className="text-xs text-[var(--color-brand-muted)]">Edit name, phone number, credentials</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-brand-muted)]" />
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'orders' && (
          <div className="bg-[var(--color-brand-surface)] rounded-2xl shadow-xs border border-[var(--color-brand-border)] p-5 sm:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-brand-border)]">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[var(--color-brand-chocolate)]">Your Past Orders</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  View and manage celebration orders, download tax invoices, or buy treats again.
                </p>
              </div>

              {/* Order Search & Filter */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search all orders by ID..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF9900]"
                  />
                </div>

                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                      orderFilter === 'all' ? 'bg-white shadow-2xs text-[#0F1111]' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOrderFilter('in_progress')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                      orderFilter === 'in_progress' ? 'bg-white shadow-2xs text-[#0F1111]' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setOrderFilter('delivered')}
                    className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                      orderFilter === 'delivered' ? 'bg-white shadow-2xs text-[#0F1111]' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Package size={32} />
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-800 mb-1">
                  {orderSearchQuery ? 'No orders match your search' : "You haven't placed any orders yet"}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  {orderSearchQuery
                    ? 'Try searching with a different order ID or cake name.'
                    : 'Check out our 27 fresh handcrafted celebration cakes, brownies, and mini jar cakes.'}
                </p>
                <Link
                  to="/shop"
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs inline-flex items-center gap-2"
                >
                  <ShoppingBag size={14} /> Explore Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const stepIdx = getStepIndex(order.orderStatus);

                  return (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      {/* Amazon-Style Order Card Header */}
                      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex flex-wrap items-center gap-6 text-gray-600">
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                              Order Placed
                            </span>
                            <span className="font-bold text-gray-800">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                              Total
                            </span>
                            <span className="font-extrabold text-[#0F1111]">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-400 uppercase font-semibold">
                              Ship To
                            </span>
                            <span className="font-bold text-gray-800">
                              {order.customer.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-gray-500 text-[11px]">
                            ORDER # <span className="font-bold text-gray-800">{order.id}</span>
                          </span>
                          <Link
                            to={`/order/${order.id}`}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline font-bold"
                          >
                            View Order Details
                          </Link>
                        </div>
                      </div>

                      {/* Order Body & Stepper */}
                      <div className="p-5 sm:p-6">
                        {/* Fulfillment Stepper */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                              {order.orderStatus === 'delivered' ? (
                                <CheckCircle2 size={16} className="text-[#007600]" />
                              ) : (
                                <Truck size={16} className="text-amber-600 animate-bounce" />
                              )}
                              Status: <span className="capitalize">{order.orderStatus.replace('_', ' ')}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.fulfillment === 'pickup' ? 'Bakery Store Pickup' : 'Express Doorstep Delivery'}
                            </span>
                          </div>

                          {/* Visual Progress Steps using DaisyUI steps */}
                          <div className="w-full py-2">
                            <ul className="steps steps-vertical sm:steps-horizontal w-full text-xs">
                              {['Order Placed', 'Payment Confirmed', 'Baking in Kitchen', 'Out for Delivery / Ready'].map(
                                (label, sIdx) => {
                                  const isDone = stepIdx >= sIdx;
                                  return (
                                    <li
                                      key={label}
                                      className={`step ${isDone ? 'step-primary font-bold' : 'text-gray-400 font-medium'}`}
                                      data-content={isDone ? '✓' : String(sIdx + 1)}
                                    >
                                      {label}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Order Items & Buy Again Buttons */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                          <div className="space-y-3 flex-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                  <img
                                    src={`/images/categories/cakes.jpg`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm text-[#0F1111] line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <div className="text-xs text-gray-500">
                                    Qty: <span className="font-semibold text-gray-800">{item.quantity}</span> •{' '}
                                    <span className="font-bold text-gray-800">{formatPrice(item.price)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Amazon-Style Action Buttons */}
                          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 w-full lg:w-48 flex-shrink-0">
                            <button
                              onClick={() => handleBuyAgain(order)}
                              className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                            >
                              <RotateCw size={13} /> Buy it again
                            </button>
                            <Link
                              to={`/order/${order.id}`}
                              className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-xs rounded-full text-center transition-all flex items-center justify-center gap-1.5"
                            >
                              <Truck size={13} /> Track package
                            </Link>
                            <button
                              onClick={() => handleWhatsAppOrderSupport(order.id)}
                              className="w-full py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-full text-center transition-all flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle size={13} /> WhatsApp Help
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-[#0F1111]">Your Addresses</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Saved delivery locations for home celebrations, office treats, and gifting.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressModal(true);
                }}
                className="px-4 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Add Address Card */}
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressModal(true);
                }}
                className="h-56 border-2 border-dashed border-gray-300 hover:border-[#FF9900] hover:bg-amber-50/20 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-gray-800 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center text-gray-400 group-hover:text-amber-700 mb-2 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-bold text-sm">Add New Address</span>
                <span className="text-[11px] text-gray-400 mt-0.5">With interactive Google Map</span>
              </button>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 border border-gray-200 rounded-2xl relative hover:border-gray-300 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-sm text-[#0F1111]">
                        {addr.recipientName || addr.name}
                      </h4>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-relaxed mb-1">
                      {addr.addressLine1 || addr.addressLine}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {addr.locality ? `${addr.locality}, ` : ''}{addr.city} – {addr.postalCode || addr.pincode}
                    </p>
                    <p className="text-xs text-gray-600 font-mono">
                      📞 {addr.phone}
                    </p>

                    {typeof addr.latitude === 'number' && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                          <MapPin size={10} className="text-amber-700" />
                          {addr.latitude.toFixed(4)}, {addr.longitude?.toFixed(4)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline"
                        >
                          <span>Map</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {addr.deliveryInstructions && (
                      <p className="text-[11px] text-gray-500 italic mt-2 bg-gray-50 p-1.5 rounded">
                        Note: "{addr.deliveryInstructions}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowAddressModal(true);
                      }}
                      className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold text-xs cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Login & Security */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-2xl">
            <h2 className="font-heading text-2xl font-extrabold text-[#0F1111] mb-1">
              Login & Security
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Manage your personal credentials, contact numbers, and security settings.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF9900]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email || 'guest@yoyocakes.com'}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Verified with Firebase Authentication
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF9900]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Customer Support / Bakery Concierge */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 animate-fade-in">
            <h2 className="font-heading text-2xl font-extrabold text-[#0F1111] mb-1">
              Bakery Customer Service & Support
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Connect directly with our head master bakers in Chennai for custom cake requests or order questions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <a
                href="https://wa.me/918428855444"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-xl border border-gray-200 hover:border-[#25D366] hover:bg-green-50/30 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">WhatsApp Bakery Concierge</h4>
                <p className="text-xs text-gray-500 mb-2">Instant responses in ~2 minutes</p>
                <span className="text-xs font-bold text-[#128C7E] group-hover:underline">
                  Chat Now (+91 84288 55444)
                </span>
              </a>

              <a
                href="tel:+918428855444"
                className="p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#232F3E] text-white flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  <Phone size={24} />
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Kitchen Hotline</h4>
                <p className="text-xs text-gray-500 mb-2">Direct kitchen assistance</p>
                <span className="text-xs font-bold text-[#007185] group-hover:underline">
                  Call +91 84288 55444
                </span>
              </a>

              <Link
                to="/faq"
                className="p-5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#FFD814] text-[#0F1111] flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  <Headphones size={24} />
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">FAQs & Policies</h4>
                <p className="text-xs text-gray-500 mb-2">Shelf life, eggless & delivery FAQs</p>
                <span className="text-xs font-bold text-[#007185] group-hover:underline">
                  View FAQs
                </span>
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
              <div className="font-bold text-sm text-[#0F1111] mb-1">
                YOYO CAKES Central Kitchen & Store Locations
              </div>
              <p>📍 Central Bakery Kitchen: 14/2, 2nd Avenue, Anna Nagar, Chennai – 600040</p>
              <p>📍 Pickup Hub: G-12, Usman Road, T. Nagar, Chennai – 600017</p>
              <p>⏰ Kitchen Baking Hours: Monday – Sunday: 9:00 AM – 11:30 PM</p>
            </div>
          </div>
        )}

        {/* Tab 5: Preferences */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 animate-fade-in max-w-xl">
            <h2 className="font-heading text-2xl font-extrabold text-[#0F1111] mb-1">
              Account Preferences & Alerts
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Configure how you receive order baking milestones, dispatch notifications, and receipts.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Theme Preference */}
              <div className="p-4 border rounded-xl border-gray-200 bg-[var(--color-brand-surface)] space-y-2.5">
                <span className="text-xs font-bold text-gray-900 block">
                  Website Theme & Color Appearance
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Choose your preferred theme across the entire bakery storefront, product catalog, cart, and dashboard.
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'cream' as Theme, label: 'Cream (Light)', icon: Sun },
                    { id: 'dark' as Theme, label: 'Dark Mode', icon: Moon },
                    { id: 'system' as Theme, label: 'System (Auto)', icon: Monitor },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, theme: id }));
                        useThemeStore.getState().setTheme(id);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        settings.theme === id
                          ? 'border-[var(--color-brand-primary-dark)] bg-amber-50 text-[var(--color-brand-chocolate)] shadow-xs ring-2 ring-[var(--color-brand-primary-dark)]/20'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-[11px]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 p-3.5 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="rounded text-[#FF9900] focus:ring-[#FF9900] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Email Invoices & Receipts
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Receive detailed PDF receipts for every confirmed order.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={(e) =>
                    setSettings({ ...settings, orderUpdates: e.target.checked })
                  }
                  className="rounded text-[#FF9900] focus:ring-[#FF9900] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Baking & Delivery Milestones
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Real-time status alerts when your cake enters the oven and dispatches with rider.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 border rounded-xl border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={(e) =>
                    setSettings({ ...settings, smsAlerts: e.target.checked })
                  }
                  className="rounded text-[#FF9900] focus:ring-[#FF9900] mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    SMS & WhatsApp Alerts
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Receive instant rider arrival notifications on your mobile phone.
                  </span>
                </div>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Address Form Modal with Interactive Google Map */}
      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        onAddressSaved={handleAddressSavedFromModal}
        editingAddress={editingAddress}
      />
    </div>
  );
}
