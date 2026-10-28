import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  Calendar, 
  Banknote, 
  Lock,
  Sparkles,
  Store,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Gift,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/common/BrandLogo';
import { formatPrice } from '@/data/products';
import { saveOrder, type Order } from '@/lib/orders';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { triggerHaptic } from '@/services/mobileService';

type PaymentChoice = 'razorpay' | 'cod';

const PICKUP_HUBS = [
  {
    id: 'anna-nagar',
    name: 'Anna Nagar Central Kitchen',
    address: '14/2, 2nd Ave, Anna Nagar, Chennai – 600040',
    phone: '+91 84288 55444',
    hours: '9:00 AM – 10:30 PM',
    badge: 'Main Bakery Studio',
  },
  {
    id: 't-nagar',
    name: 'T. Nagar Patisserie Hub',
    address: '28, South Usman Road, T. Nagar, Chennai – 600017',
    phone: '+91 63796 03744',
    hours: '9:30 AM – 11:00 PM',
    badge: 'Express Pickup',
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore Kitchen Counter',
    address: '72, DB Road, RS Puram, Coimbatore – 641002',
    phone: '+91 63796 03744',
    hours: '10:00 AM – 9:30 PM',
    badge: 'West Hub',
  },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Batch', time: '10:00 AM – 1:00 PM', desc: 'Fresh oven bakes & morning pickup' },
  { id: 'afternoon', label: 'Afternoon Batch', time: '1:00 PM – 5:00 PM', desc: 'Afternoon treats & jar cakes' },
  { id: 'evening', label: 'Evening Celebration', time: '5:00 PM – 9:00 PM', desc: 'Prime party collection slot' },
  { id: 'night', label: 'Night Owl Pickup', time: '9:00 PM – 10:30 PM', desc: 'Late night cake collection' },
];

function generateNewOrderId(): string {
  return `YOYO-${Date.now().toString(36).toUpperCase()}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [selectedHub, setSelectedHub] = useState(PICKUP_HUBS[0].id);
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pickupSlot, setPickupSlot] = useState('evening');
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('razorpay');
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    specialMessage: '',
    instructions: '',
    agreeTerms: true,
  });

  const subtotal = getSubtotal();
  const total = subtotal; // Complimentary Kitchen Pickup

  const activeHubObj = PICKUP_HUBS.find((h) => h.id === selectedHub) || PICKUP_HUBS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;
    triggerHaptic('heavy');

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      triggerHaptic('error');
      toast.error('Please enter your name, email, and mobile contact number');
      return;
    }

    if (!form.agreeTerms) {
      triggerHaptic('error');
      toast.error('Please accept the order terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      const generatedOrderId = generateNewOrderId();

      const orderPayload: Order = {
        id: generatedOrderId,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          instructions: [
            form.specialMessage ? `Message on cake: "${form.specialMessage}"` : '',
            form.instructions ? `Pickup notes: ${form.instructions}` : '',
            `Pickup Slot: ${pickupDate} (${TIME_SLOTS.find((s) => s.id === pickupSlot)?.label || pickupSlot})`,
          ].filter(Boolean).join(' | '),
        },
        items: items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category,
          image: item.product.image,
          customMessage: item.customMessage || form.specialMessage,
          includeCandles: item.includeCandles,
        })),
        subtotal,
        deliveryFee: 0,
        discount: 0,
        total,
        fulfillment: 'pickup',
        distanceKm: 0,
        orderStatus: 'confirmed',
        paymentStatus: paymentChoice === 'razorpay' ? 'paid' : 'pending',
        paymentMethod: paymentChoice === 'razorpay' ? 'Razorpay (Online)' : 'Pay on Pickup Counter',
        pickupLocation: {
          name: activeHubObj.name,
          address: activeHubObj.address,
          phone: activeHubObj.phone,
          instructions: `Counter collection between ${activeHubObj.hours}`,
        },
      };

      // Pay at Pickup Counter
      if (paymentChoice === 'cod') {
        await saveOrder(orderPayload);
        setPlacedOrder(orderPayload);
        setOrderPlaced(true);
        clearCart();
        setProcessing(false);
        triggerHaptic('success');
        toast.success('Pickup order confirmed! Pay at the bakery counter on collection.');
        return;
      }

      // Razorpay Online Payment
      openRazorpayCheckout({
        amount: total,
        orderId: generatedOrderId,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        onSuccess: async (rzpRes) => {
          const paidOrder: Order = {
            ...orderPayload,
            paymentStatus: 'paid',
            paymentMethod: 'Razorpay',
            razorpayOrderId: rzpRes.razorpay_order_id,
            razorpayPaymentId: rzpRes.razorpay_payment_id,
          };
          await saveOrder(paidOrder);
          setPlacedOrder(paidOrder);
          setOrderPlaced(true);
          clearCart();
          setProcessing(false);
          triggerHaptic('success');
          toast.success('Payment verified & fresh cake order confirmed!');
        },
        onDismiss: () => {
          triggerHaptic('warning');
          toast.error('Payment cancelled. You can retry or choose Pay at Kitchen Counter.');
          setProcessing(false);
        },
      });
    } catch {
      triggerHaptic('error');
      toast.error('Could not process order. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // Auth Guard
  if (!user && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[var(--color-brand-surface)] rounded-3xl shadow-2xl border border-[var(--color-brand-border)] p-6 sm:p-8 text-center animate-fade-in">
          <Link to="/" className="inline-block mb-4">
            <BrandLogo size="lg" />
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[var(--color-brand-chocolate)] text-xs font-bold mb-3">
            <Lock size={12} className="text-[var(--color-brand-primary)]" />
            <span>Sign In Required</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading text-[var(--color-brand-chocolate)] mb-2">
            Sign In to Complete Your Order
          </h2>
          <p className="text-xs text-[var(--color-brand-muted)] mb-6 leading-relaxed">
            Please log in with your email or Google account to track your orders, view order history, and collect your fresh bakes.
          </p>

          <div className="space-y-3">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E5B500] text-[#0F1111] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-[#FCD200]"
            >
              Sign In to Continue
            </Link>
            <Link
              to="/register?redirect=/checkout"
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] font-bold text-sm transition-all flex items-center justify-center border border-[var(--color-brand-border)]"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ORDER SUCCESS SCREEN
  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[var(--color-brand-surface)] rounded-3xl shadow-2xl border border-[var(--color-brand-border)] p-6 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <Sparkles size={12} /> Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[var(--color-brand-chocolate)] mb-2">
            Fresh Bakes Reserved!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mb-6">
            Order Reference: <strong className="font-mono text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">{placedOrder.id}</strong>
          </p>

          {/* Kitchen Pickup Details Card */}
          <div className="p-5 rounded-2xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] text-left mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <Store size={18} className="text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--color-brand-chocolate)]">
                  {placedOrder.pickupLocation?.name}
                </p>
                <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                  {placedOrder.pickupLocation?.address}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                  📞 Kitchen Hotline: {placedOrder.pickupLocation?.phone}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-brand-border)]/60 flex items-center justify-between text-xs">
              <span className="text-[var(--color-brand-muted)]">Payment Mode:</span>
              <span className="font-bold text-[var(--color-brand-chocolate)]">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-brand-muted)]">Total Amount:</span>
              <span className="font-black text-sm text-[var(--color-brand-primary)]">{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/orders"
              className="flex-1 py-3.5 px-4 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center"
            >
              View in My Orders
            </Link>
            <Link
              to="/"
              className="py-3.5 px-6 rounded-xl bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] font-bold text-xs sm:text-sm border border-[var(--color-brand-border)] text-center transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] py-6 sm:py-10 text-[var(--color-brand-chocolate)]">
      <div className="container-main max-w-6xl px-4">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs">
          <Link to="/cart" className="inline-flex items-center gap-1 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] font-bold">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <span className="text-[var(--color-brand-border)]">/</span>
          <span className="font-extrabold text-[var(--color-brand-chocolate)]">Kitchen Pickup Checkout</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns: Pickup Information */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: Select Pickup Kitchen */}
              <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-black text-[var(--color-brand-chocolate)]">
                    Choose Kitchen Pickup Counter
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mb-4 ml-8">
                  Select which YOYO Patisserie kitchen you would like to collect your freshly baked treats from:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-0 sm:ml-8">
                  {PICKUP_HUBS.map((hub) => {
                    const isSelected = selectedHub === hub.id;
                    return (
                      <div
                        key={hub.id}
                        onClick={() => setSelectedHub(hub.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 ring-2 ring-[var(--color-brand-primary)]/30 shadow-xs'
                            : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:border-[var(--color-brand-primary)]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]">
                              {hub.badge}
                            </span>
                            {isSelected && <Check size={14} className="text-[var(--color-brand-primary)]" />}
                          </div>
                          <h3 className="text-xs font-bold text-[var(--color-brand-chocolate)] leading-snug">
                            {hub.name}
                          </h3>
                          <p className="text-[11px] text-[var(--color-brand-muted)] mt-1 line-clamp-2">
                            {hub.address}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-[var(--color-brand-border)]/60 text-[10px] text-[var(--color-brand-muted)]">
                          <Clock size={11} className="inline mr-1 text-[var(--color-brand-primary)]" />
                          {hub.hours}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Pickup Date & Slot */}
              <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-black text-[var(--color-brand-chocolate)]">
                    Select Pickup Date & Time Slot
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mb-4 ml-8">
                  Your order is prepared fresh in time for your chosen collection slot:
                </p>

                <div className="ml-0 sm:ml-8 space-y-4">
                  {/* Date Input */}
                  <div>
                    <label className="text-xs font-bold text-[var(--color-brand-chocolate)] block mb-1.5">
                      Collection Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                    />
                  </div>

                  {/* Slot Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = pickupSlot === slot.id;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setPickupSlot(slot.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 shadow-2xs font-bold'
                              : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:border-[var(--color-brand-primary)]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-[var(--color-brand-chocolate)]">
                            <span className="font-extrabold">{slot.label}</span>
                            <span className="font-mono text-[11px] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] font-bold">
                              {slot.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--color-brand-muted)] mt-0.5 font-normal">
                            {slot.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP 3: Customer Contact & Cake Notes */}
              <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-black text-[var(--color-brand-chocolate)]">
                    Contact & Cake Personalization
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mb-4 ml-8">
                  We'll send your pickup invoice and SMS confirmation to these contact details:
                </p>

                <div className="ml-0 sm:ml-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--color-brand-chocolate)] block mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-xs text-[var(--color-brand-chocolate)] outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--color-brand-chocolate)] block mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        autoComplete="off"
                        required
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-xs text-[var(--color-brand-chocolate)] outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--color-brand-chocolate)] block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        autoComplete="off"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-xs text-[var(--color-brand-chocolate)] outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                      />
                    </div>
                  </div>

                  {/* Special Cake Message */}
                  <div>
                    <label className="text-xs font-bold text-[var(--color-brand-chocolate)] flex items-center gap-1.5 mb-1">
                      <Gift size={13} className="text-amber-600" />
                      <span>Message on Cake / Greeting Card (Complimentary)</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={form.specialMessage}
                      onChange={(e) => setForm({ ...form, specialMessage: e.target.value })}
                      placeholder="e.g. Happy 25th Birthday Priya! ❤️"
                      maxLength={60}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-xs text-[var(--color-brand-chocolate)] outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="text-xs font-bold text-[var(--color-brand-chocolate)] flex items-center gap-1.5 mb-1">
                      <MessageSquare size={13} className="text-[var(--color-brand-muted)]" />
                      <span>Special Baking or Packaging Instructions</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      placeholder="e.g. Extra dark chocolate ganache, wooden knives needed"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-xs text-[var(--color-brand-chocolate)] outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/40"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4: Payment Choice */}
              <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)] text-white text-xs font-black flex items-center justify-center">
                    4
                  </span>
                  <h2 className="text-base sm:text-lg font-heading font-black text-[var(--color-brand-chocolate)]">
                    Payment Method
                  </h2>
                </div>
                <p className="text-xs text-[var(--color-brand-muted)] mb-4 ml-8">
                  Choose how you would like to pay for your reserved treats:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-0 sm:ml-8">
                  {/* Option 1: Razorpay */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentChoice === 'razorpay'
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 ring-2 ring-[var(--color-brand-primary)]/30 shadow-xs'
                        : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:border-[var(--color-brand-primary)]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      value="razorpay"
                      checked={paymentChoice === 'razorpay'}
                      onChange={() => setPaymentChoice('razorpay')}
                      className="mt-1 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--color-brand-chocolate)] mb-0.5">
                        <CreditCard size={15} className="text-sky-600" />
                        <span>Online Payment (UPI, Cards, NetBanking)</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed">
                        Instant payment via Google Pay, PhonePe, Paytm, Credit/Debit cards with 256-Bit SSL protection.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Pay on Pickup */}
                  <label
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      paymentChoice === 'cod'
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10 ring-2 ring-[var(--color-brand-primary)]/30 shadow-xs'
                        : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:border-[var(--color-brand-primary)]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      value="cod"
                      checked={paymentChoice === 'cod'}
                      onChange={() => setPaymentChoice('cod')}
                      className="mt-1 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--color-brand-chocolate)] mb-0.5">
                        <Banknote size={15} className="text-emerald-600" />
                        <span>Pay at Kitchen Counter on Collection</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed">
                        Reserve your treats online and pay with Cash, UPI, or Card directly at the bakery counter.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Order Summary Box */}
            <div className="lg:col-span-4 sticky top-20 space-y-4">
              <div className="p-6 rounded-3xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-md">
                <h3 className="font-heading font-extrabold text-base text-[var(--color-brand-chocolate)] mb-4 pb-3 border-b border-[var(--color-brand-border)]">
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[var(--color-brand-border)] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--color-brand-chocolate)] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-brand-muted)]">
                          Qty: {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <span className="font-bold text-[var(--color-brand-chocolate)]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-[var(--color-brand-border)] space-y-2 text-xs text-[var(--color-brand-muted)]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-[var(--color-brand-chocolate)]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Kitchen Counter Pickup</span>
                    <span className="font-bold">₹0 (Free)</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[var(--color-brand-chocolate)] pt-3 border-t border-[var(--color-brand-border)]">
                    <span>Total Amount:</span>
                    <span className="text-[var(--color-brand-primary)]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Terms agreement checkbox */}
                <label className="flex items-start gap-2 mt-4 text-[11px] text-[var(--color-brand-muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                    className="rounded text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)] mt-0.5"
                  />
                  <span>
                    I confirm my kitchen pickup slot and agree to YOYO CAKES' freshness & collection policy.
                  </span>
                </label>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E5B500] text-[#0F1111] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-[#FCD200]"
                >
                  {processing ? (
                    'Processing Order...'
                  ) : paymentChoice === 'razorpay' ? (
                    `Pay ${formatPrice(total)} & Confirm`
                  ) : (
                    'Confirm Pickup Order'
                  )}
                </button>

                <div className="mt-4 pt-3 border-t border-[var(--color-brand-border)]/60 text-center text-[10px] text-[var(--color-brand-muted)] flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Freshly Baked Guarantee • Zero Artificial Additives</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
