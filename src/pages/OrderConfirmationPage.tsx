import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, ChefHat, PackageCheck, AlertCircle, Phone, ArrowLeft } from 'lucide-react';
import { getOrderById, type Order, type OrderStatus } from '@/lib/orders';
import { formatPrice } from '@/data/products';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'placed', label: 'Order Placed', desc: 'Received & logged' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Payment verified' },
  { key: 'preparing', label: 'Baking', desc: 'Handcrafted in kitchen' },
  { key: 'ready', label: 'Ready', desc: 'Packed & ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'On the way' },
  { key: 'delivered', label: 'Completed', desc: 'Delivered / picked up' },
];

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const found = await getOrderById(id);
      setOrder(found || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-brand-primary-dark)]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-elevated">
          <AlertCircle size={48} className="mx-auto text-[var(--color-brand-error)] mb-4" />
          <h2 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-2">
            Order Not Found
          </h2>
          <p className="text-[var(--color-brand-muted)] text-sm mb-6">
            We couldn't locate order #{id}. Please verify your order ID or contact customer support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop" className="btn-primary text-sm">
              <ArrowLeft size={16} /> Back to Shop
            </Link>
            <a href="tel:+918428855444" className="btn-secondary text-sm flex items-center justify-center gap-2">
              <Phone size={16} /> Call Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Determine active step index
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-12">
      <div className="container-main max-w-4xl">
        <div className="bg-white rounded-2xl shadow-elevated overflow-hidden border border-[var(--color-brand-primary-light)]/20">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[var(--color-brand-primary-dark)] to-[var(--color-brand-chocolate)] text-white p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-[#A3E635]" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Order Status & Tracking</h1>
            <p className="text-white/80 text-sm">
              Order ID: <span className="font-mono font-bold text-white">{order.id}</span>
            </p>
            <p className="text-white/60 text-xs mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {/* Status Timeline */}
            <div className="mb-10">
              <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-6">
                Fulfillment Timeline
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)] shadow-sm'
                          : isDone
                          ? 'border-[var(--color-brand-success)]/40 bg-[var(--color-brand-success)]/5 text-[var(--color-brand-chocolate)]'
                          : 'border-gray-200 text-gray-400 opacity-60'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider mb-1">Step {idx + 1}</div>
                      <div className="font-semibold text-xs mb-0.5">{step.label}</div>
                      <div className="text-[10px] text-[var(--color-brand-muted)]">{step.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Customer & Delivery */}
              <div className="bg-[var(--color-brand-cream)] rounded-xl p-5 border border-[var(--color-brand-primary-light)]/30">
                <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                  {order.fulfillment === 'delivery' ? <Truck size={18} /> : <ChefHat size={18} />}
                  {order.fulfillment === 'delivery' ? 'Delivery Details' : 'Store Pickup Details'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-brand-muted)]">Recipient:</span>
                    <span className="font-medium text-[var(--color-brand-chocolate)]">{order.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-brand-muted)]">Phone:</span>
                    <span className="font-medium text-[var(--color-brand-chocolate)]">{order.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-brand-muted)]">Email:</span>
                    <span className="font-medium text-[var(--color-brand-chocolate)]">{order.customer.email}</span>
                  </div>
                  {order.fulfillment === 'delivery' ? (
                    <div className="pt-2 border-t border-[var(--color-brand-primary-light)]/20">
                      <span className="text-[var(--color-brand-muted)] block mb-1">Delivery Address:</span>
                      <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">
                        {order.customer.address}, {order.customer.city} — {order.customer.pincode}
                      </p>
                      {order.customer.instructions && (
                        <p className="text-xs italic text-[var(--color-brand-muted)] mt-1">
                          Note: "{order.customer.instructions}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[var(--color-brand-primary-light)]/20">
                      <span className="text-[var(--color-brand-muted)] block mb-1">Pickup Store:</span>
                      <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">
                        YOYO CAKES Main Kitchen
                      </p>
                      <p className="text-xs text-[var(--color-brand-muted)]">
                        Store pickup ready within 2 hours of confirmation.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-[var(--color-brand-cream)] rounded-xl p-5 border border-[var(--color-brand-primary-light)]/30">
                <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                  <PackageCheck size={18} /> Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-brand-muted)]">Payment Gateway:</span>
                    <span className="font-medium text-[var(--color-brand-chocolate)]">Razorpay Secure</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-brand-muted)]">Payment Status:</span>
                    <span className="font-bold text-[var(--color-brand-success)] capitalize">{order.paymentStatus}</span>
                  </div>
                  {order.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-brand-muted)]">Payment Ref:</span>
                      <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[var(--color-brand-primary-light)]/20 space-y-1">
                    <div className="flex justify-between text-xs text-[var(--color-brand-muted)]">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--color-brand-muted)]">
                      <span>Delivery Fee</span>
                      <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-xs text-[var(--color-brand-success)]">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base text-[var(--color-brand-primary-dark)] pt-1">
                      <span>Total Paid</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="mb-8">
              <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] mb-4">
                Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
              <div className="divide-y divide-[var(--color-brand-primary-light)]/20 border border-[var(--color-brand-primary-light)]/20 rounded-xl overflow-hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-brand-cream)]/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--color-brand-chocolate)]">{item.name}</h4>
                      <p className="text-xs text-[var(--color-brand-muted)]">{item.category} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[var(--color-brand-chocolate)]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-xs text-[var(--color-brand-muted)]">{formatPrice(item.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Actions */}
            <div className="bg-[var(--color-brand-cream)]/70 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-[var(--color-brand-chocolate)]">
                  Need assistance with this order?
                </h4>
                <p className="text-xs text-[var(--color-brand-muted)]">
                  Contact our bakery hotline: +91 84288 55444 / +91 63796 03744
                </p>
              </div>
              <div className="flex gap-2">
                <a href="tel:+918428855444" className="btn-secondary text-xs px-4 py-2">
                  Call Bakery
                </a>
                <Link to="/shop" className="btn-primary text-xs px-4 py-2">
                  Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
