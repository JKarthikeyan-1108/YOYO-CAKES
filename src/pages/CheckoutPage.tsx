import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Truck, Store, CreditCard, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/data/products';
import { saveOrder, type Order } from '@/lib/orders';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { getUserAddressesFromFirestore, type SavedAddress } from '@/services/firestoreService';

type FulfillmentType = 'delivery' | 'pickup';

function generateNewOrderId(): string {
  return `YOYO-${Date.now().toString(36).toUpperCase()}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Form state
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Chennai',
    pincode: '',
    instructions: '',
    agreeTerms: false,
  });

  // Load saved Firestore addresses for authenticated customer
  useState(() => {
    if (user?.uid) {
      getUserAddressesFromFirestore(user.uid).then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          setForm((prev) => ({
            ...prev,
            name: prev.name || def.name,
            phone: prev.phone || def.phone,
            address: prev.address || def.addressLine,
            city: prev.city || def.city,
            pincode: prev.pincode || def.pincode,
          }));
        }
      });
    }
  });

  const subtotal = getSubtotal();
  const deliveryFee = fulfillment === 'delivery' ? (subtotal >= 500 ? 0 : 40) : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (fulfillment === 'delivery' && (!form.address || !form.city || !form.pincode)) {
      toast.error('Please provide your delivery address');
      return;
    }

    if (!form.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      const generatedOrderId = generateNewOrderId();
      setOrderId(generatedOrderId);

      // Open Razorpay Checkout (uses Razorpay modal or test simulator)
      openRazorpayCheckout({
        amount: total,
        orderId: generatedOrderId,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        onSuccess: async (rzpRes) => {
          const newOrder: Order = {
            id: generatedOrderId,
            userId: user?.uid,
            createdAt: new Date().toISOString(),
            customer: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: fulfillment === 'delivery' ? form.address : undefined,
              city: fulfillment === 'delivery' ? form.city : undefined,
              pincode: fulfillment === 'delivery' ? form.pincode : undefined,
              instructions: form.instructions || undefined,
            },
            items: items.map((item) => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              category: item.product.category,
              image: item.product.image,
            })),
            subtotal,
            deliveryFee,
            discount: 0,
            total,
            fulfillment,
            orderStatus: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'Razorpay',
            razorpayOrderId: rzpRes.razorpay_order_id,
            razorpayPaymentId: rzpRes.razorpay_payment_id,
          };

          await saveOrder(newOrder);
          toast.success('Payment verified & Order placed successfully!');
          setOrderPlaced(true);
          clearCart();
          setProcessing(false);
        },
        onDismiss: () => {
          toast.error('Payment cancelled');
          setProcessing(false);
        },
      });
    } catch {
      toast.error('Order creation failed. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // Order Confirmation
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-elevated p-8 md:p-12 max-w-lg w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-[var(--color-brand-success)]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[var(--color-brand-success)]" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-brand-chocolate)] mb-3">
            Order Confirmed!
          </h1>
          <p className="text-[var(--color-brand-muted)] mb-2">
            Thank you for your order, {form.name}!
          </p>
          <p className="text-sm font-mono bg-[var(--color-brand-cream)] rounded-lg px-4 py-2 inline-block mb-6">
            Order ID: {orderId}
          </p>

          <div className="bg-[var(--color-brand-cream)] rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-brand-muted)]">Fulfillment</span>
              <span className="font-medium capitalize">{fulfillment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-brand-muted)]">Total Paid</span>
              <span className="font-bold text-[var(--color-brand-primary-dark)]">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-brand-muted)]">Payment Status</span>
              <span className="text-[var(--color-brand-success)] font-medium flex items-center gap-1">
                <CheckCircle size={14} /> Paid (Razorpay Verified)
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--color-brand-muted)] mb-6">
            We have received your order! Our bakers will begin preparing your fresh treats shortly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/order/${orderId}`} className="btn-primary">
              Track Order
            </Link>
            <Link to="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen">
      <div className="container-main py-8 lg:py-12">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary-dark)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                  <User size={18} className="text-[var(--color-brand-primary-dark)]" /> Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Fulfillment */}
              <div className="bg-white rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4">
                  Fulfillment Method
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      fulfillment === 'delivery'
                        ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)]'
                        : 'border-[var(--color-brand-primary-light)]/30 hover:border-[var(--color-brand-primary)]'
                    }`}
                  >
                    <Truck
                      size={24}
                      className={`mb-2 ${
                        fulfillment === 'delivery'
                          ? 'text-[var(--color-brand-primary-dark)]'
                          : 'text-[var(--color-brand-muted)]'
                      }`}
                    />
                    <p className="font-semibold text-sm text-[var(--color-brand-chocolate)]">
                      Local Delivery
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                      {subtotal >= 500 ? 'Free delivery' : `Delivery fee: ${formatPrice(40)}`}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      fulfillment === 'pickup'
                        ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)]'
                        : 'border-[var(--color-brand-primary-light)]/30 hover:border-[var(--color-brand-primary)]'
                    }`}
                  >
                    <Store
                      size={24}
                      className={`mb-2 ${
                        fulfillment === 'pickup'
                          ? 'text-[var(--color-brand-primary-dark)]'
                          : 'text-[var(--color-brand-muted)]'
                      }`}
                    />
                    <p className="font-semibold text-sm text-[var(--color-brand-chocolate)]">
                      Store Pickup
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                      No delivery fee
                    </p>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              {fulfillment === 'delivery' && (
                <div className="bg-white rounded-xl p-6 shadow-card animate-fade-in">
                  <h2 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-[var(--color-brand-primary-dark)]" /> Delivery Address
                  </h2>

                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Select from your saved addresses:</p>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                name: addr.name,
                                phone: addr.phone,
                                address: addr.addressLine,
                                city: addr.city,
                                pincode: addr.pincode,
                              }));
                              toast.success(`Selected address for ${addr.name}`);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              form.address === addr.addressLine
                                ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] font-bold'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            📍 {addr.name} ({addr.city})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required={fulfillment === 'delivery'}
                        className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                        placeholder="Full address"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required={fulfillment === 'delivery'}
                          className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          required={fulfillment === 'delivery'}
                          className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                          placeholder="6-digit PIN"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                        Delivery Instructions (optional)
                      </label>
                      <textarea
                        name="instructions"
                        value={form.instructions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm resize-none"
                        placeholder="Any special delivery instructions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup Info */}
              {fulfillment === 'pickup' && (
                <div className="bg-white rounded-xl p-6 shadow-card animate-fade-in">
                  <h2 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                    <Store size={18} className="text-[var(--color-brand-primary-dark)]" /> Pickup Information
                  </h2>
                  <div className="bg-[var(--color-brand-cream)] rounded-lg p-4">
                    <p className="text-sm text-[var(--color-brand-muted)] italic">
                      Store address and pickup instructions will be configured by the business owner in admin settings.
                      You will receive pickup details via email/SMS after order confirmation.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="bg-white rounded-xl p-6 shadow-card">
                <h2 className="font-heading text-lg font-semibold text-[var(--color-brand-chocolate)] mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-[var(--color-brand-primary-dark)]" /> Payment
                </h2>
                <div className="bg-[var(--color-brand-cream)] rounded-lg p-4 flex items-start gap-3">
                  <Shield size={18} className="text-[var(--color-brand-primary-dark)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-brand-chocolate)]">
                      Secure Payment via Razorpay
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                      Supports UPI, Credit/Debit Cards, Net Banking, and more.
                      Payment gateway will be activated once Razorpay credentials are configured.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-[var(--color-brand-primary-dark)]"
                />
                <span className="text-sm text-[var(--color-brand-muted)]">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[var(--color-brand-primary-dark)] underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-[var(--color-brand-primary-dark)] underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-card sticky top-24">
                <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.product.image || `/images/categories/${item.product.categorySlug}.jpg`}
                          alt={item.product.name}
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-[var(--color-brand-cream-dark)]"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `/images/categories/${item.product.categorySlug}.jpg`;
                          }}
                        />
                        <span className="text-[var(--color-brand-chocolate-light)] truncate">
                          {item.product.name} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-medium text-[var(--color-brand-chocolate)] flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-[var(--color-brand-primary-light)]/20 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-brand-muted)]">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-brand-muted)]">Delivery</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-[var(--color-brand-success)]">Free</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-3 border-t border-[var(--color-brand-primary-light)]/20">
                    <span>Total</span>
                    <span className="text-[var(--color-brand-primary-dark)] text-xl">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary w-full mt-6 py-4 text-base justify-center disabled:opacity-50"
                  onClick={handleSubmit}
                >
                  {processing ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order — {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
