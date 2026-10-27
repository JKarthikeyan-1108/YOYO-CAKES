import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Truck,
  ChefHat,
  Eye,
  RefreshCw,
  X,
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Package,
  Calendar,
  CheckCircle2,
  MessageCircle,
  UserCheck,
  Volume2,
  VolumeX,
  ArrowRight,
  Send,
  Radio,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllOrders,
  updateOrderStatus,
  assignOrderRider,
  subscribeToOrders,
  getNextOrderStatus,
  getWhatsAppDispatchLink,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/orders';
import { formatPrice } from '@/data/products';

function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const RIDER_PRESETS = [
  { name: 'Karthik (Express Van)', phone: '9840123456' },
  { name: 'Ramesh (Quick Two-Wheeler)', phone: '9876543210' },
  { name: 'Suresh (Insulated Cake Box)', phone: '9789012345' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [riderModalOrder, setRiderModalOrder] = useState<Order | null>(null);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderNotes, setRiderNotes] = useState('');
  const [submittingRider, setSubmittingRider] = useState(false);

  const prevOrderCountRef = useRef<number>(0);

  // Subscribe to real-time orders feed
  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      if (prevOrderCountRef.current > 0 && newOrders.length > prevOrderCountRef.current) {
        const diff = newOrders.length - prevOrderCountRef.current;
        toast.success(`🔔 ${diff} New Order${diff > 1 ? 's' : ''} Received!`, {
          duration: 4000,
          icon: '🎂',
        });
        if (soundEnabled) {
          playNewOrderChime();
        }
      }
      prevOrderCountRef.current = newOrders.length;
    });

    return () => {
      unsubscribe();
    };
  }, [soundEnabled]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllOrders();
      setOrders(list);
      prevOrderCountRef.current = list.length;
      toast.success('Orders refreshed');
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Escape key to close modals
  useEffect(() => {
    if (!selectedOrder && !riderModalOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
        setRiderModalOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedOrder, riderModalOrder]);

  // Filter
  const filtered = orders.filter((o) => {
    const query = search.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(query) ||
      o.customer.name.toLowerCase().includes(query) ||
      o.customer.phone.includes(query) ||
      (o.dispatchDetails?.riderName && o.dispatchDetails.riderName.toLowerCase().includes(query));

    let matchStatus = true;
    if (statusFilter === 'all') {
      matchStatus = true;
    } else if (statusFilter === 'new') {
      matchStatus = o.orderStatus === 'placed' || o.orderStatus === 'confirmed';
    } else {
      matchStatus = o.orderStatus === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    newPayment?: PaymentStatus
  ) => {
    await updateOrderStatus(orderId, newStatus, newPayment);
    toast.success(`Order #${orderId} transitioned to ${newStatus.replace('_', ' ')}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
        paymentStatus: newPayment || selectedOrder.paymentStatus,
      });
    }
  };

  const handleQuickAdvance = async (order: Order) => {
    const next = getNextOrderStatus(order.orderStatus);
    if (!next) return;

    if (next.nextStatus === 'out_for_delivery') {
      // Open rider assignment modal
      setRiderModalOrder(order);
      setRiderName(order.dispatchDetails?.riderName || 'Karthik (Express Van)');
      setRiderPhone(order.dispatchDetails?.riderPhone || '9840123456');
      setRiderNotes(order.dispatchDetails?.notes || '');
      return;
    }

    await handleStatusChange(order.id, next.nextStatus);
  };

  const handleRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderModalOrder) return;
    if (!riderName.trim()) {
      toast.error('Please enter delivery rider name');
      return;
    }

    setSubmittingRider(true);
    try {
      await assignOrderRider(riderModalOrder.id, riderName, riderPhone, riderNotes);
      toast.success(`Order #${riderModalOrder.id} dispatched with ${riderName}!`, { icon: '🚴' });
      setRiderModalOrder(null);
    } catch {
      toast.error('Failed to assign rider');
    } finally {
      setSubmittingRider(false);
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const newCount = orders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed').length;
  const bakingCount = orders.filter((o) => o.orderStatus === 'preparing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready').length;
  const onRouteCount = orders.filter((o) => o.orderStatus === 'out_for_delivery').length;
  const completedCount = orders.filter((o) => o.orderStatus === 'delivered').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
      case 'preparing':
        return 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse';
      case 'ready':
        return 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'out_for_delivery':
        return 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with Live Status & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
              Orders & Kitchen Dispatch
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)]">
            Real-time bakery orders, kitchen baking workflows, and doorstep delivery dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-colors min-h-[44px] flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
            }`}
            title={soundEnabled ? 'Chime sound alert enabled for new orders' : 'Sound alert muted'}
            aria-label="Toggle new order sound alert"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden md:inline">{soundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={loadOrders}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-surface)] hover:bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)] font-bold text-xs shadow-xs min-h-[44px] flex items-center gap-2 transition-all"
            aria-label="Refresh orders list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[var(--color-brand-primary)]' : 'text-[var(--color-brand-primary)]'} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-[var(--color-brand-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="text-xs font-bold text-[var(--color-brand-muted)] flex items-center gap-1.5">
            <Package size={14} className="text-[var(--color-brand-chocolate)]" /> Total Orders
          </div>
          <div className="text-xl sm:text-2xl font-black text-[var(--color-brand-chocolate)] mt-1">{orders.length}</div>
          <div className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">All customer orders</div>
        </div>

        <div className="bg-[var(--color-brand-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="text-xs font-bold text-[var(--color-brand-muted)] flex items-center gap-1.5">
            <Radio size={14} className="text-blue-700 dark:text-blue-400" /> New Orders
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{newCount}</div>
          <div className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">Placed / Confirmed</div>
        </div>

        <div className="bg-[var(--color-brand-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="text-xs font-bold text-[var(--color-brand-muted)] flex items-center gap-1.5">
            <ChefHat size={14} className="text-amber-700 dark:text-amber-400" /> In Kitchen
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{bakingCount}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">{readyCount} ready to pack</div>
        </div>

        <div className="bg-[var(--color-brand-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="text-xs font-bold text-[var(--color-brand-muted)] flex items-center gap-1.5">
            <Truck size={14} className="text-sky-700 dark:text-sky-400" /> Out for Delivery
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">{onRouteCount}</div>
          <div className="text-[11px] text-sky-700 dark:text-sky-400 font-medium mt-0.5">{completedCount} delivered</div>
        </div>

        <div className="bg-[var(--color-brand-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--color-brand-border)] shadow-xs col-span-2 lg:col-span-1">
          <div className="text-xs font-bold text-[var(--color-brand-muted)] flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-700 dark:text-emerald-400" /> Revenue
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-1">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">Paid online / COD</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--color-brand-surface)] p-3.5 sm:p-4 rounded-2xl border border-[var(--color-brand-border)] shadow-xs flex flex-col gap-3">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer, phone, or rider name..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40 min-h-[44px]"
            aria-label="Search orders"
          />
        </div>

        {/* Stage Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <Filter size={14} className="text-[var(--color-brand-muted)] flex-shrink-0" />
          {[
            { key: 'all', label: `All (${orders.length})` },
            { key: 'new', label: `New (${newCount})` },
            { key: 'preparing', label: `Baking (${bakingCount})` },
            { key: 'ready', label: `Ready (${readyCount})` },
            { key: 'out_for_delivery', label: `On Route (${onRouteCount})` },
            { key: 'delivered', label: `Delivered (${completedCount})` },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors min-h-[36px] flex items-center ${
                statusFilter === s.key
                  ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)] shadow-xs'
                  : 'bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] p-8 sm:p-12 text-center shadow-xs">
          <Package size={40} className="mx-auto text-[var(--color-brand-muted)]/50 mb-3" />
          <h3 className="text-base font-bold text-[var(--color-brand-chocolate)]">No orders found</h3>
          <p className="text-xs text-[var(--color-brand-muted)] mt-1 max-w-sm mx-auto">
            {search ? 'No orders match your search criteria. Try a different query.' : 'No orders in this status category.'}
          </p>
        </div>
      )}

      {/* === MOBILE CARD VIEW (< lg) === */}
      <div className="lg:hidden space-y-3.5">
        {filtered.map((order) => {
          const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
          const nextAction = getNextOrderStatus(order.orderStatus);
          const whatsappUrl = getWhatsAppDispatchLink(order);

          return (
            <div
              key={order.id}
              className="bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] p-4 shadow-xs space-y-3 transition-shadow hover:shadow-sm"
            >
              {/* Card Header: ID, Date & Fulfillment */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[var(--color-brand-border)]">
                <div>
                  <span className="font-mono font-bold text-xs text-[var(--color-brand-chocolate)] block">
                    #{order.id}
                  </span>
                  <span className="text-[11px] text-[var(--color-brand-muted)] flex items-center gap-1 mt-0.5">
                    <Calendar size={11} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 border ${
                      order.fulfillment === 'delivery'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {order.fulfillment === 'delivery' ? <Truck size={10} /> : <ChefHat size={10} />}
                    {order.fulfillment}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer & Phone */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[var(--color-brand-chocolate)] block text-sm">{order.customer.name}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-[var(--color-brand-primary)] hover:underline flex items-center gap-1 text-[11px] font-medium"
                      aria-label={`Call ${order.customer.name} at ${order.customer.phone}`}
                    >
                      <Phone size={11} /> Call
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                      aria-label="Send WhatsApp update"
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-base text-[var(--color-brand-chocolate)]">
                    {formatPrice(order.total)}
                  </div>
                  <span className="text-[11px] text-[var(--color-brand-muted)]">{itemCount} items</span>
                </div>
              </div>

              {/* Rider assigned pill if active */}
              {order.dispatchDetails?.riderName && (
                <div className="bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 p-2 rounded-xl text-[11px] border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold">
                    <Truck size={12} /> {order.dispatchDetails.riderName}
                  </span>
                  {order.dispatchDetails.riderPhone && (
                    <a href={`tel:${order.dispatchDetails.riderPhone}`} className="underline font-mono text-[10px]">
                      {order.dispatchDetails.riderPhone}
                    </a>
                  )}
                </div>
              )}

              {/* Items summary preview */}
              <div className="bg-[var(--color-brand-cream)] rounded-xl p-2.5 text-[11px] text-[var(--color-brand-muted)] border border-[var(--color-brand-border)] space-y-1">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex justify-between truncate">
                    <span className="truncate pr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-semibold text-[var(--color-brand-chocolate)] flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-[10px] italic pt-0.5">
                    +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}...
                  </div>
                )}
              </div>

              {/* Current Status Badge + Quick Advance Button */}
              <div className="pt-1 flex items-center gap-2">
                <span className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex-1 text-center truncate ${getStatusBadge(order.orderStatus)}`}>
                  {order.orderStatus.replace('_', ' ').toUpperCase()}
                </span>

                {nextAction && (
                  <button
                    type="button"
                    onClick={() => handleQuickAdvance(order)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary-light)] text-[var(--color-brand-chocolate)] text-xs font-bold flex items-center gap-1 min-h-[44px] flex-shrink-0 shadow-xs hover:opacity-90 transition-opacity"
                    aria-label={`Advance order to ${nextAction.label}`}
                  >
                    <span>{nextAction.actionText}</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="p-2.5 rounded-xl bg-[var(--color-brand-cream)] hover:bg-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] border border-[var(--color-brand-border)] text-xs font-bold flex items-center min-h-[44px] min-w-[44px] justify-center flex-shrink-0"
                  aria-label={`View full details for order ${order.id}`}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* === DESKTOP TABLE VIEW (lg+) === */}
      <div className="hidden lg:block bg-[var(--color-brand-surface)] rounded-2xl border border-[var(--color-brand-border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-brand-cream)] border-b border-[var(--color-brand-border)] text-[var(--color-brand-muted)] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status & Dispatch</th>
                <th className="py-3.5 px-4">Quick Action</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-brand-border)]">
              {filtered.map((order) => {
                const nextAction = getNextOrderStatus(order.orderStatus);
                const whatsappUrl = getWhatsAppDispatchLink(order);

                return (
                  <tr key={order.id} className="hover:bg-[var(--color-brand-cream)]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--color-brand-chocolate)]">
                      <div>#{order.id}</div>
                      <span className="text-[10px] text-[var(--color-brand-muted)] font-normal flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold block text-[var(--color-brand-chocolate)] text-sm">{order.customer.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="text-[11px] text-[var(--color-brand-primary)] hover:underline inline-flex items-center gap-0.5"
                        >
                          <Phone size={10} /> {order.customer.phone}
                        </a>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                          title="WhatsApp Update"
                        >
                          <MessageCircle size={10} />
                        </a>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium flex items-center gap-1 text-[var(--color-brand-muted)]">
                        {order.fulfillment === 'delivery' ? (
                          <Truck size={14} className="text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChefHat size={14} className="text-amber-600 dark:text-amber-400" />
                        )}
                        {order.fulfillment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[var(--color-brand-chocolate)]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                      <div className="text-[10px] text-[var(--color-brand-muted)] truncate max-w-[140px]">
                        {order.items.map((i) => i.name).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary-light)] text-sm">
                        {formatPrice(order.total)}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`py-1 px-2 rounded-lg text-xs font-bold border transition-colors ${getStatusBadge(
                            order.orderStatus
                          )}`}
                          aria-label={`Status for order ${order.id}`}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Baking</option>
                          <option value="ready">Ready</option>
                          <option value="out_for_delivery">On Route</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {order.dispatchDetails?.riderName && (
                          <div className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold flex items-center gap-1">
                            <Truck size={10} /> {order.dispatchDetails.riderName}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quick Action Button */}
                    <td className="py-3.5 px-4">
                      {nextAction ? (
                        <button
                          type="button"
                          onClick={() => handleQuickAdvance(order)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary-light)] hover:opacity-90 text-[var(--color-brand-chocolate)] font-bold text-xs flex items-center gap-1 shadow-xs transition-opacity"
                        >
                          <span>{nextAction.actionText}</span>
                          <ArrowRight size={13} />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--color-brand-muted)] font-medium">Completed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream)] min-h-[36px]"
                        title="Inspect Order Details"
                        aria-label={`Inspect order ${order.id}`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== RIDER ASSIGNMENT & DISPATCH MODAL ===== */}
      {riderModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setRiderModalOrder(null)}
        >
          <div
            className="bg-[var(--color-brand-surface)] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[var(--color-brand-border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brand-border)]">
              <div className="flex items-center gap-2">
                <Truck className="text-[var(--color-brand-primary)]" size={20} />
                <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                  Assign Delivery Partner
                </h3>
              </div>
              <button
                onClick={() => setRiderModalOrder(null)}
                className="p-1 rounded-full text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                aria-label="Close rider modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRiderSubmit} className="mt-4 space-y-4">
              <div className="bg-[var(--color-brand-cream)] p-3 rounded-xl border border-[var(--color-brand-border)] text-xs text-[var(--color-brand-muted)] space-y-1">
                <div className="font-bold text-[var(--color-brand-chocolate)]">
                  Order #{riderModalOrder.id} — {riderModalOrder.customer.name}
                </div>
                <div>{riderModalOrder.deliveryAddressSnapshot?.addressLine1 || riderModalOrder.customer.address}</div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-muted)] mb-1.5">
                  Bakery Fleet Presets
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {RIDER_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setRiderName(p.name);
                        setRiderPhone(p.phone);
                      }}
                      className="text-left px-3 py-2 rounded-lg bg-[var(--color-brand-cream)] hover:bg-[var(--color-brand-border)] border border-[var(--color-brand-border)] text-xs flex justify-between items-center transition-colors"
                    >
                      <span className="font-semibold text-[var(--color-brand-chocolate)]">{p.name}</span>
                      <span className="font-mono text-[11px] text-[var(--color-brand-muted)]">{p.phone}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rider Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Rider / Driver Name
                </label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] text-xs focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                />
              </div>

              {/* Rider Phone */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Rider Contact Number
                </label>
                <input
                  type="tel"
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] text-xs focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                />
              </div>

              {/* Dispatch Notes */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-brand-chocolate)] mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={riderNotes}
                  onChange={(e) => setRiderNotes(e.target.value)}
                  placeholder="e.g. Cake is fragile, keep in temperature-controlled bag"
                  className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] text-xs focus:ring-2 focus:ring-[var(--color-brand-primary)]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRiderModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-cream)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRider}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[var(--color-brand-primary-dark)] transition-colors"
                >
                  <Send size={14} />
                  <span>{submittingRider ? 'Dispatching...' : 'Confirm & Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== ACCESSIBLE ORDER DETAIL MODAL ===== */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-order-title"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[var(--color-brand-surface)] rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-[var(--color-brand-border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-brand-border)] flex-shrink-0">
              <div>
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-brand-primary-dark)] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full mb-1">
                  Order Details
                </span>
                <h3 id="modal-order-title" className="font-heading text-lg sm:text-xl font-bold text-[var(--color-brand-chocolate)]">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close order details modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer summary */}
              <div className="bg-[var(--color-brand-cream)] p-4 rounded-xl space-y-2 border border-[var(--color-brand-border)]">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-brand-muted)] font-medium">Customer:</span>
                  <span className="font-bold text-[var(--color-brand-chocolate)] text-sm">{selectedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-brand-muted)] font-medium">Contact:</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="text-[var(--color-brand-primary)] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Phone size={12} /> {selectedOrder.customer.phone}
                    </a>
                    <a
                      href={getWhatsAppDispatchLink(selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                </div>

                {selectedOrder.fulfillment === 'delivery' && (
                  <div className="pt-2 border-t border-[var(--color-brand-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-brand-chocolate)] font-semibold flex items-center gap-1">
                        <MapPin size={13} className="text-[var(--color-brand-primary)]" />
                        Doorstep Delivery Address:
                      </span>
                      {selectedOrder.distanceKm && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          ~{selectedOrder.distanceKm} km from bakery
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-[var(--color-brand-chocolate)] leading-relaxed bg-[var(--color-brand-surface)] p-2.5 rounded-lg border border-[var(--color-brand-border)]">
                      {selectedOrder.deliveryAddressSnapshot?.addressLine1 || selectedOrder.customer.address}
                      {selectedOrder.deliveryAddressSnapshot?.addressLine2 ? `, ${selectedOrder.deliveryAddressSnapshot.addressLine2}` : ''}
                      {selectedOrder.deliveryAddressSnapshot?.locality ? `, ${selectedOrder.deliveryAddressSnapshot.locality}` : ''}
                      , {selectedOrder.deliveryAddressSnapshot?.city || selectedOrder.customer.city} — {selectedOrder.deliveryAddressSnapshot?.postalCode || selectedOrder.customer.pincode}
                    </p>

                    {selectedOrder.customer.instructions && (
                      <div className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                        <span className="font-bold">Instructions:</span> {selectedOrder.customer.instructions}
                      </div>
                    )}

                    {/* Google Turn-by-turn Navigation */}
                    {selectedOrder.deliveryAddressSnapshot?.latitude ? (
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--color-brand-muted)] bg-[var(--color-brand-surface)] px-2.5 py-1.5 rounded-lg border border-[var(--color-brand-border)]">
                          <Navigation size={12} className="text-blue-600" />
                          <span>
                            {selectedOrder.deliveryAddressSnapshot.latitude.toFixed(5)}° N, {selectedOrder.deliveryAddressSnapshot.longitude.toFixed(5)}° E
                          </span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.deliveryAddressSnapshot.latitude},${selectedOrder.deliveryAddressSnapshot.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs text-xs min-h-[40px]"
                        >
                          <ExternalLink size={12} /> Driver Turn-by-Turn GPS
                        </a>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Rider assigned details if present */}
              {selectedOrder.dispatchDetails && (
                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-3.5 rounded-xl space-y-1 text-sky-900 dark:text-sky-300">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <UserCheck size={14} /> Assigned Rider: {selectedOrder.dispatchDetails.riderName}
                  </div>
                  {selectedOrder.dispatchDetails.riderPhone && (
                    <div className="text-[11px]">Phone: {selectedOrder.dispatchDetails.riderPhone}</div>
                  )}
                  {selectedOrder.dispatchDetails.notes && (
                    <div className="text-[11px] italic">Notes: {selectedOrder.dispatchDetails.notes}</div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--color-brand-chocolate)] mb-2 flex items-center gap-1.5">
                  <Package size={14} /> Purchased Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-[var(--color-brand-border)] border border-[var(--color-brand-border)] rounded-xl overflow-hidden bg-[var(--color-brand-surface)]">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[var(--color-brand-chocolate)] text-xs">{item.name}</div>
                        <span className="text-[10px] text-[var(--color-brand-muted)]">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                        {item.customMessage && (
                          <div className="text-[10px] text-amber-800 dark:text-amber-300 italic">
                            Message: "{item.customMessage}"
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-[var(--color-brand-chocolate)] text-xs">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[var(--color-brand-cream)] p-4 rounded-xl space-y-1.5 border border-[var(--color-brand-border)]">
                <div className="flex justify-between text-[var(--color-brand-muted)]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--color-brand-chocolate)]">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-brand-muted)]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[var(--color-brand-chocolate)]">{formatPrice(selectedOrder.deliveryFee)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary-light)] pt-2 border-t border-[var(--color-brand-border)]">
                  <span>Total Amount</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Quick Status Buttons */}
              <div className="space-y-2 pt-1">
                <span className="block text-xs font-bold text-[var(--color-brand-chocolate)]">
                  Advance Dispatch Workflow
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                    className="py-2.5 px-3 rounded-xl border border-amber-300 text-amber-950 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 hover:opacity-90 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Start Baking
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'ready')}
                    className="py-2.5 px-3 rounded-xl border border-purple-300 text-purple-950 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 hover:opacity-90 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Mark Ready
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRiderModalOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-sky-300 text-sky-950 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 hover:opacity-90 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Assign Rider
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold min-h-[44px] transition-colors shadow-xs"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
