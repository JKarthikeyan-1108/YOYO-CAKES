import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  ArrowLeft,
  MapPin,
  AlertCircle,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { getOrderById, getAllOrders, type Order } from '@/lib/orders';
import { formatPrice } from '@/data/products';
import SwiggyLiveDeliveryMap from '@/components/delivery/SwiggyLiveDeliveryMap';
import { triggerHaptic } from '@/services/mobileService';

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
              <Truck size={14} />
              <span>Track Live Delivery</span>
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
            {/* Swiggy / Zepto Live Map Component */}
            <SwiggyLiveDeliveryMap order={activeOrder} autoSimulate={true} />

            {/* Order Items & Receipt Snapshot */}
            <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-brand-chocolate)] mb-4 flex items-center justify-between">
                <span>Items in Cold-Pack Container</span>
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

              {/* Delivery Address Details */}
              <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[var(--color-brand-muted)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--color-brand-primary)]" />
                  Drop Address: <strong className="text-[var(--color-brand-chocolate)]">{activeOrder.customer.address || 'Chennai'}</strong>
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
                <Link
                  to="/account?tab=orders"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all active:scale-95 flex-shrink-0"
                >
                  <Star size={13} className="fill-current text-amber-500" />
                  <span>Rate Order in Account</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
