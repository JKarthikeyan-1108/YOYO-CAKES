import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Store,
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Star,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getOrderById, getAllOrders, type Order } from '@/lib/orders';
import { formatPrice } from '@/data/products';
import { triggerHaptic } from '@/services/mobileService';

const KITCHEN_STEPS = [
  { key: 'placed', label: 'Order Confirmed', desc: 'Sent to pastry kitchen', icon: '📋' },
  { key: 'confirmed', label: 'Chef Verified', desc: 'Ingredients prepared', icon: '👨‍🍳' },
  { key: 'preparing', label: 'Baking in Oven', desc: 'Ganache chilled & glazed', icon: '🎂' },
  { key: 'ready', label: 'Ready at Counter', desc: 'Packed in celebration box', icon: '✨' },
  { key: 'delivered', label: 'Collected', desc: 'Enjoy your fresh treat!', icon: '🎉' },
];

export default function LiveTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('id') || orderId || '';

  const [inputOrderId, setInputOrderId] = useState(initialOrderId);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function init() {
      const all = await getAllOrders();
      setRecentOrders(all.slice(0, 3));

      const targetId = orderId || searchParams.get('id');
      if (targetId) {
        setInputOrderId(targetId);
        setLoading(true);
        const found = await getOrderById(targetId);
        setActiveOrder(found || null);
        setLoading(false);
        setSearched(true);
      } else if (all.length > 0) {
        // Default to most recent order if available
        setActiveOrder(all[0]);
        setInputOrderId(all[0].id);
        setSearched(true);
      }
    }
    init();
  }, [orderId, searchParams]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputOrderId.trim()) return;
    triggerHaptic('medium');
    setLoading(true);
    const found = await getOrderById(inputOrderId.trim());
    setActiveOrder(found || null);
    setLoading(false);
    setSearched(true);
  };

  const handleShareTrackingWhatsApp = () => {
    if (!activeOrder) return;
    triggerHaptic('medium');
    const trackingUrl = `${window.location.origin}/track/${activeOrder.id}`;
    const text = `🍰 *Track YOYO CAKES Kitchen Order*\nOrder #${activeOrder.id}\nStatus: ${activeOrder.orderStatus.replace('_', ' ').toUpperCase()}\nTotal: ₹${activeOrder.total}\n\nKitchen Status Link:\n${trackingUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSelectRecent = (order: Order) => {
    triggerHaptic('light');
    setInputOrderId(order.id);
    setActiveOrder(order);
    setSearched(true);
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-6 sm:py-10 pb-28 lg:pb-12 transition-colors">
      <div className="container-main max-w-4xl px-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Patisserie
          </Link>

          <Link
            to="/shop"
            className="text-xs font-bold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
          >
            <ShoppingBag size={14} /> Browse Cakes
          </Link>
        </div>

        {/* Order ID Lookup Bar */}
        <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-4 sm:p-6 mb-6 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
              <input
                type="text"
                value={inputOrderId}
                onChange={(e) => setInputOrderId(e.target.value)}
                placeholder="Enter Order Number (e.g. YOYO-78901)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono uppercase border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] rounded-xl outline-none focus:border-[var(--color-brand-primary)]"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <Store size={14} />
              <span>Check Kitchen Status</span>
            </button>
          </form>

          {/* Quick Recent Order Chips */}
          {recentOrders.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-brand-border)] overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[var(--color-brand-muted)] whitespace-nowrap font-medium">
                Recent Orders:
              </span>
              {recentOrders.map((ro) => (
                <button
                  key={ro.id}
                  type="button"
                  onClick={() => handleSelectRecent(ro)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeOrder?.id === ro.id
                      ? 'bg-[var(--color-brand-chocolate)] text-[var(--color-brand-cream)]'
                      : 'bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                  }`}
                >
                  #{ro.id} ({ro.orderStatus.replace('_', ' ')})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-12 text-center">
            <div className="w-10 h-10 border-3 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-[var(--color-brand-chocolate)]">
              Connecting to Live Swiggy/Zepto Telemetry Radar...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && searched && !activeOrder && (
          <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-8 sm:p-12 text-center">
            <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
            <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
              Order #{inputOrderId} Not Found
            </h3>
            <p className="text-xs text-[var(--color-brand-muted)] max-w-sm mx-auto mt-1 mb-5">
              Please double check the order number from your confirmation email/SMS or pick a sample order above.
            </p>
            <Link
              to="/account?tab=orders"
              className="px-5 py-2.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              View My Account Orders
            </Link>
          </div>
        )}

        {/* Active Order Live Tracking View */}
        {!loading && activeOrder && (
          <div className="space-y-6">
            {/* Kitchen Pickup Status Card */}
            <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-brand-border)]">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-xs font-bold mb-2">
                    <Store size={13} />
                    <span>Kitchen Counter Collection</span>
                  </span>
                  <h2 className="font-heading text-2xl font-black text-[var(--color-brand-chocolate)]">
                    Order #{activeOrder.id}
                  </h2>
                  <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                    Placed on {new Date(activeOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[var(--color-brand-muted)] block">Estimated Counter Collection</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {activeOrder.deliverySlot || 'Ready within 1–2 Hours'}
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="py-6 border-b border-[var(--color-brand-border)]">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  {KITCHEN_STEPS.map((step, idx) => {
                    const stepOrder: Record<string, number> = {
                      placed: 0,
                      confirmed: 1,
                      preparing: 2,
                      ready: 3,
                      out_for_delivery: 3,
                      delivered: 4,
                    };
                    const currentIdx = stepOrder[activeOrder.orderStatus] ?? 0;
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-[var(--color-brand-surface-elevated)] border-[var(--color-brand-primary)] shadow-sm'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--color-brand-chocolate)]'
                            : 'border-[var(--color-brand-border)] opacity-50'
                        }`}
                      >
                        <div className="text-xl mb-1">{step.icon}</div>
                        <div className="text-[11px] font-black text-[var(--color-brand-chocolate)] leading-snug">
                          {step.label}
                        </div>
                        <div className="text-[10px] text-[var(--color-brand-muted)] mt-0.5">
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Counter Location & Contact Box */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-muted)] block">
                    Collection Counter
                  </span>
                  <p className="font-heading font-black text-sm text-[var(--color-brand-chocolate)] flex items-center gap-1.5">
                    <Store size={15} className="text-[var(--color-brand-primary)] flex-shrink-0" />
                    {activeOrder.pickupLocation?.name || 'Anna Nagar Central Kitchen'}
                  </p>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    {activeOrder.pickupLocation?.address || '14/2, 2nd Avenue, Anna Nagar East, Chennai – 600040'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href="tel:+918428855444"
                      className="px-3 py-1.5 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-bold hover:bg-[var(--color-brand-primary-dark)] transition-colors inline-flex items-center gap-1"
                    >
                      <Phone size={12} /> Call Counter
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        activeOrder.pickupLocation?.address || '14/2, 2nd Avenue, Anna Nagar East, Chennai'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full border border-[var(--color-brand-border)] text-xs font-bold text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface)] transition-colors inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Directions
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-muted)] block">
                    Pickup Schedule & Details
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-brand-chocolate)]">
                    <Clock size={14} className="text-[var(--color-brand-primary)]" />
                    <span>Slot: <strong>{activeOrder.deliverySlot || 'Morning Batch (10 AM - 1 PM)'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)]">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Date: <strong>{activeOrder.scheduledDate || 'Today'}</strong></span>
                  </div>
                  {activeOrder.customer?.instructions && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 mt-2">
                      <strong>Cake Message:</strong> "{activeOrder.customer.instructions}"
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items & Receipt Snapshot */}
            <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-brand-chocolate)] mb-4 flex items-center justify-between">
                <span>Items in Celebration Box</span>
                <span className="text-xs font-mono font-bold text-[var(--color-brand-primary)]">
                  Total: {formatPrice(activeOrder.total)}
                </span>
              </h3>

              <div className="divide-y divide-[var(--color-brand-border)]">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cream-dark)] border border-[var(--color-brand-border)] flex items-center justify-center font-bold text-sm">
                        🎂
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-brand-chocolate)] leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-brand-muted)]">
                          Qty: {item.quantity} • {item.category}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--color-brand-chocolate)] font-mono">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Counter Details */}
              <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[var(--color-brand-muted)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--color-brand-primary)]" />
                  Pickup Counter: <strong className="text-[var(--color-brand-chocolate)]">{activeOrder.pickupLocation?.name || activeOrder.customer.city || 'Central Kitchen'}</strong>
                </span>

                <span className="flex items-center gap-1.5 font-mono">
                  Payment: <strong className="text-emerald-600 dark:text-emerald-400 uppercase">{activeOrder.paymentStatus} ({activeOrder.paymentMethod})</strong>
                </span>
              </div>

              {/* Feedback CTA */}
              <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--color-brand-surface-elevated)] -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
                <div>
                  <p className="text-xs font-bold text-[var(--color-brand-chocolate)]">
                    Enjoyed your fresh eggless bake?
                  </p>
                  <p className="text-[11px] text-[var(--color-brand-muted)]">
                    Share your celebration experience with our patisserie kitchen team.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={handleShareTrackingWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Share on WhatsApp</span>
                  </button>
                  <Link
                    to="/account?tab=orders"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all active:scale-95 flex-shrink-0"
                  >
                    <Star size={13} className="fill-current text-amber-500" />
                    <span>Rate in Account</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
