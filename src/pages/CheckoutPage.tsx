import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
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
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import BrandLogo from '@/components/common/BrandLogo';
import { formatPrice } from '@/data/products';
import { saveOrder, type Order } from '@/lib/orders';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { 
  getUserAddressesFromFirestore, 
  saveAddressToFirestore, 
  type SavedAddress 
} from '@/services/firestoreService';
import InteractiveGoogleMap, { type LocationCoordinates } from '@/components/delivery/InteractiveGoogleMap';
import AddressFormModal from '@/components/delivery/AddressFormModal';
import SavedAddressesSelector from '@/components/delivery/SavedAddressesSelector';
import { 
  checkDeliveryServiceabilityApi, 
  fetchDeliverySettings,
  type ServiceabilityResponse,
  type DeliverySettings,
  FALLBACK_DELIVERY_SETTINGS
} from '@/services/deliveryService';

type FulfillmentType = 'delivery' | 'pickup';
type PaymentChoice = 'razorpay' | 'cod';

const TODAY_DATE = new Date().toISOString().split('T')[0];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Delivery', time: '10:00 AM – 1:00 PM', desc: 'Fresh morning bake' },
  { id: 'afternoon', label: 'Afternoon Delivery', time: '1:00 PM – 5:00 PM', desc: 'Standard daytime slot' },
  { id: 'evening', label: 'Evening Celebration', time: '5:00 PM – 9:00 PM', desc: 'Party & dinner delivery' },
  { id: 'midnight', label: 'Midnight Surprise', time: '11:00 PM – 12:00 AM', desc: '✨ Best for Birthday Countdown' },
];

function generateNewOrderId(): string {
  return `YOYO-${Date.now().toString(36).toUpperCase()}`;
}

function generateAddressId(): string {
  return `addr-${Date.now().toString(36)}`;
}

function getIsoTimestamp(): string {
  return new Date().toISOString();
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, loginWithGoogle } = useAuthStore();
  const { currentLocation, openModal: openLocationModal } = useLocationStore();

  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery');
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('razorpay');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [deliverySlot, setDeliverySlot] = useState('evening');
  const [saveAddressToBook, setSaveAddressToBook] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(FALLBACK_DELIVERY_SETTINGS);
  const [serviceability, setServiceability] = useState<ServiceabilityResponse | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Form state pre-filled with user profile & selected delivery location
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    landmark: '',
    locality: currentLocation?.area || '',
    city: currentLocation?.city || 'Chennai',
    state: 'Tamil Nadu',
    pincode: currentLocation?.pincode || '600001',
    latitude: currentLocation?.latitude ?? 13.085,
    longitude: currentLocation?.longitude ?? 80.2101,
    instructions: '',
    agreeTerms: true,
  });

  // Load delivery rules from backend
  useEffect(() => {
    fetchDeliverySettings()
      .then((cfg) => setDeliverySettings(cfg))
      .catch(() => {});
  }, []);

  // Check delivery serviceability whenever coordinates or cart value changes
  useEffect(() => {
    if (fulfillment !== 'delivery') {
      setServiceability(null);
      return;
    }

    let isMounted = true;
    setCheckingServiceability(true);

    const timer = setTimeout(() => {
      checkDeliveryServiceabilityApi({
        latitude: form.latitude,
        longitude: form.longitude,
        subtotal: getSubtotal(),
        fulfillment: 'delivery',
      })
        .then((res) => {
          if (isMounted) {
            setServiceability(res);
            setCheckingServiceability(false);
          }
        })
        .catch(() => {
          if (isMounted) setCheckingServiceability(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [form.latitude, form.longitude, fulfillment, items]);

  // Keep delivery city, pincode, locality and coordinates updated from location store
  useEffect(() => {
    if (currentLocation?.pincode) {
      const timer = setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          city: currentLocation.city || prev.city,
          pincode: currentLocation.pincode || prev.pincode,
          locality: currentLocation.area || prev.locality,
          latitude: currentLocation.latitude ?? prev.latitude,
          longitude: currentLocation.longitude ?? prev.longitude,
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentLocation]);

  // Load saved Firestore addresses for authenticated customer
  useEffect(() => {
    if (user?.uid) {
      getUserAddressesFromFirestore(user.uid).then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(def.id);
          setForm((prev) => ({
            ...prev,
            name: def.recipientName || def.name || prev.name,
            phone: def.phone || prev.phone,
            address: def.addressLine1 || def.addressLine || prev.address,
            landmark: def.addressLine2 || prev.landmark,
            locality: def.locality || prev.locality,
            city: def.city || prev.city,
            state: def.state || prev.state,
            pincode: def.postalCode || def.pincode || prev.pincode,
            latitude: typeof def.latitude === 'number' ? def.latitude : prev.latitude,
            longitude: typeof def.longitude === 'number' ? def.longitude : prev.longitude,
            instructions: def.deliveryInstructions || prev.instructions,
          }));
        }
      });
    }
  }, [user]);

  const subtotal = getSubtotal();
  const deliveryFee =
    fulfillment === 'delivery'
      ? serviceability?.deliveryFee ?? (subtotal >= deliverySettings.freeDeliveryThreshold ? 0 : deliverySettings.baseDeliveryFee)
      : 0;
  const total = subtotal + deliveryFee;

  const isCoimbatore =
    currentLocation?.city === 'Coimbatore' ||
    form.city === 'Coimbatore' ||
    (form.latitude >= 10.8 && form.latitude <= 11.3 && form.longitude >= 76.7 && form.longitude <= 77.3);

  const activePickupName = isCoimbatore
    ? 'YOYO CAKES Coimbatore Kitchen Counter'
    : deliverySettings.storeName;

  const activePickupAddress = isCoimbatore
    ? '72, DB Road, RS Puram, Coimbatore, Tamil Nadu 641002'
    : deliverySettings.pickupAddress;

  const handleAddressSelect = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      name: addr.recipientName || addr.name || prev.name,
      phone: addr.phone || prev.phone,
      address: addr.addressLine1 || addr.addressLine || prev.address,
      landmark: addr.addressLine2 || '',
      locality: addr.locality || '',
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.postalCode || addr.pincode || prev.pincode,
      latitude: typeof addr.latitude === 'number' ? addr.latitude : prev.latitude,
      longitude: typeof addr.longitude === 'number' ? addr.longitude : prev.longitude,
      instructions: addr.deliveryInstructions || prev.instructions,
    }));
  };

  const handleMapLocationPicked = (loc: LocationCoordinates) => {
    setForm((prev) => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.street || prev.address || loc.formattedAddress || '',
      locality: loc.locality || prev.locality,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      pincode: loc.postalCode || prev.pincode,
    }));
  };

  const handleAddressSaved = (saved: SavedAddress) => {
    setSavedAddresses((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : a));
      }
      return [saved, ...prev];
    });
    handleAddressSelect(saved);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  // Place Order Handler (Both Razorpay & Cash on Delivery)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Please fill in your name, email, and mobile number');
      return;
    }

    if (fulfillment === 'delivery') {
      if (!form.address.trim() || !form.city.trim() || !form.pincode.trim()) {
        toast.error('Please provide a complete delivery address');
        return;
      }

      if (serviceability && !serviceability.serviceable) {
        toast.error(serviceability.reason || 'This address is outside our delivery radius. Please switch to Store Pickup.');
        return;
      }
    }

    if (!form.agreeTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setProcessing(true);

    try {
      const generatedOrderId = generateNewOrderId();

      // Optionally save address to Firestore for logged in user
      if (user?.uid && saveAddressToBook && selectedAddressId === 'new' && fulfillment === 'delivery') {
        saveAddressToFirestore({
          id: generateAddressId(),
          userId: user.uid,
          recipientName: form.name,
          phone: form.phone,
          addressLine1: form.address,
          addressLine2: form.landmark,
          locality: form.locality || form.city,
          city: form.city,
          state: form.state,
          postalCode: form.pincode,
          latitude: form.latitude,
          longitude: form.longitude,
          deliveryInstructions: form.instructions,
          isDefault: savedAddresses.length === 0,
        }).catch(() => {});
      }

      const orderPayload: Order = {
        id: generatedOrderId,
        userId: user?.uid,
        createdAt: getIsoTimestamp(),
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: fulfillment === 'delivery' ? `${form.address}${form.landmark ? ` (Landmark: ${form.landmark})` : ''}` : undefined,
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
          customMessage: item.customMessage,
          includeCandles: item.includeCandles,
        })),
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        fulfillment,
        distanceKm: fulfillment === 'delivery' ? serviceability?.distanceKm : 0,
        orderStatus: 'confirmed',
        paymentStatus: paymentChoice === 'razorpay' ? 'paid' : 'pending',
        paymentMethod: paymentChoice === 'razorpay' ? 'Razorpay' : 'Cash on Delivery',
        deliveryAddressSnapshot:
          fulfillment === 'delivery'
            ? {
                recipientName: form.name,
                phone: form.phone,
                addressLine1: form.address,
                addressLine2: form.landmark || '',
                locality: form.locality || form.city,
                city: form.city,
                state: form.state,
                postalCode: form.pincode,
                latitude: form.latitude,
                longitude: form.longitude,
                deliveryInstructions: form.instructions || '',
                capturedAt: getIsoTimestamp(),
              }
            : undefined,
        pickupLocation:
          fulfillment === 'pickup'
            ? {
                name: activePickupName,
                address: activePickupAddress,
                phone: '8428855444',
                instructions: deliverySettings.pickupInstructions,
              }
            : undefined,
      };

      // CASE 1: CASH ON DELIVERY / PAY ON DELIVERY (Like Amazon Pay on Delivery)
      if (paymentChoice === 'cod') {
        await saveOrder(orderPayload);
        setPlacedOrder(orderPayload);
        setOrderPlaced(true);
        clearCart();
        setProcessing(false);
        toast.success('Order placed successfully with Pay on Delivery!');
        return;
      }

      // CASE 2: RAZORPAY INSTANT CHECKOUT (UPI, Cards, Netbanking)
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
          toast.success('Payment verified & fresh cake order placed!');
        },
        onDismiss: () => {
          toast.error('Payment cancelled. You can retry or choose Pay on Delivery.');
          setProcessing(false);
        },
      });
    } catch {
      toast.error('Could not process order. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // MANDATORY AUTHENTICATION GUARD: Customers must sign in or register to place order
  if (!user && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-amber-200/60 p-6 sm:p-8 text-center animate-fade-in">
          <Link to="/" className="inline-block mb-4">
            <BrandLogo size="lg" />
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
            <Lock size={12} className="text-amber-700" />
            <span>Account Required to Place Order</span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-black text-gray-900 mb-2">
            Sign In or Create Account
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            To safeguard your fresh bakery delivery, provide live order tracking, and issue digital receipts, customers must sign in to YOYO CAKES.
          </p>

          {/* Quick Cart summary badge */}
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 mb-6 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Your Current Order</span>
              <span className="text-xs font-bold text-gray-900 block">
                {items.length} {items.length === 1 ? 'item' : 'items'} • Total: {formatPrice(subtotal)}
              </span>
            </div>
            <span className="badge badge-warning text-[10px] font-bold">Waiting</span>
          </div>

          <div className="space-y-3">
            {/* Primary Sign In Button */}
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 bg-gradient-to-r from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E5B500] text-[#0F1111] font-extrabold rounded-2xl block text-center shadow-md transition-all text-xs sm:text-sm border border-[#FCD200]"
            >
              Sign In with Mobile OTP / Email
            </Link>

            {/* 1-Click Google Sign In */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                  toast.success('Signed in successfully! Continuing with checkout.');
                } catch {
                  // Handled in store
                }
              }}
              className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>1-Click Continue with Google</span>
            </button>

            {/* Register Link */}
            <div className="pt-2 text-xs text-gray-500">
              New customer?{' '}
              <Link
                to="/register?redirect=/checkout"
                className="font-bold text-amber-800 hover:text-amber-950 underline"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AMAZON-STYLE ORDER CONFIRMATION SCREEN
  if (orderPlaced && placedOrder) {
    const selectedSlotObj = TIME_SLOTS.find((s) => s.id === deliverySlot);
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* DaisyUI Checkout Progress Steps */}
          <div className="flex justify-center mb-8">
            <ul className="steps steps-horizontal w-full max-w-lg text-xs font-bold">
              <li className="step step-primary" data-content="✓">Cart</li>
              <li className="step step-primary" data-content="✓">Delivery & Slots</li>
              <li className="step step-primary" data-content="✓">Order Confirmed</li>
            </ul>
          </div>

          {/* Top Banner */}
          <div className="bg-white rounded-2xl shadow-elevated border border-[var(--color-brand-primary-light)]/30 overflow-hidden mb-6">
            <div className="bg-[var(--color-brand-chocolate)] p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-success)] text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h1 className="font-heading text-xl sm:text-2xl font-bold">
                    Order Placed, Thank You!
                  </h1>
                  <p className="text-xs text-white/80 mt-0.5">
                    Confirmation sent to <span className="font-semibold text-white">{placedOrder.customer.email}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 text-center sm:text-right">
                <span className="text-[11px] uppercase tracking-wider text-white/70 block">Order Number</span>
                <span className="font-mono text-sm font-bold bg-white/10 px-3 py-1 rounded-lg inline-block mt-1">
                  {placedOrder.id}
                </span>
              </div>
            </div>

            {/* DaisyUI Stats Strip */}
            <div className="stats stats-vertical sm:stats-horizontal w-full border-b border-gray-100 bg-gray-50/50 rounded-none text-xs">
              <div className="stat py-3 px-4">
                <div className="stat-title text-[11px] text-gray-500 font-semibold">Delivery Date</div>
                <div className="stat-value text-sm font-bold text-gray-900">{deliveryDate}</div>
                <div className="stat-desc text-[11px] text-[#007600] font-semibold">{selectedSlotObj?.time || 'Evening Slot'}</div>
              </div>
              <div className="stat py-3 px-4">
                <div className="stat-title text-[11px] text-gray-500 font-semibold">Payment Status</div>
                <div className="stat-value text-sm font-bold text-gray-900">{placedOrder.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'}</div>
                <div className="stat-desc text-[11px] text-gray-500 font-semibold">{placedOrder.paymentMethod}</div>
              </div>
              <div className="stat py-3 px-4">
                <div className="stat-title text-[11px] text-gray-500 font-semibold">Total Amount</div>
                <div className="stat-value text-sm font-extrabold text-[#B12704]">{formatPrice(placedOrder.total)}</div>
                <div className="stat-desc text-[11px] text-[#007600] font-semibold">{placedOrder.deliveryFee === 0 ? 'Free Express Delivery' : 'Standard Delivery'}</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Delivery Promise */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40">
                <Truck className="text-[var(--color-brand-primary-dark)] mt-1 flex-shrink-0" size={22} />
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-brand-chocolate)]">
                    Guaranteed Delivery: {deliveryDate}
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                    Slot: <span className="font-semibold">{selectedSlotObj?.time || 'Evening'}</span> ({selectedSlotObj?.label})
                  </p>
                  <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                    Delivering to: <span className="font-medium text-[var(--color-brand-chocolate)]">{placedOrder.customer.name}</span>, {placedOrder.customer.address}, {placedOrder.customer.city} - {placedOrder.customer.pincode}
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-3">
                  Items Ordered ({placedOrder.items.length})
                </h4>
                <div className="divide-y divide-[var(--color-brand-primary-light)]/20 border border-[var(--color-brand-primary-light)]/30 rounded-xl overflow-hidden bg-white">
                  {placedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image || '/images/products/crunch-cake.jpg'} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg border border-[var(--color-brand-primary-light)]/30"
                        />
                        <div>
                          <p className="text-sm font-bold text-[var(--color-brand-chocolate)] line-clamp-1">{item.name}</p>
                          <p className="text-xs text-[var(--color-brand-muted)]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          {item.customMessage && (
                            <span className="text-[10px] font-semibold text-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)] px-2 py-0.5 rounded-full inline-block mt-0.5">
                              Message: "{item.customMessage}"
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-sm text-[var(--color-brand-chocolate)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-[var(--color-brand-cream)] rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-[var(--color-brand-muted)]">
                  <span>Payment Method</span>
                  <span className="font-semibold text-[var(--color-brand-chocolate)]">
                    {placedOrder.paymentMethod} ({placedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pay on Delivery'})
                  </span>
                </div>
                <div className="flex justify-between text-[var(--color-brand-muted)]">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-[var(--color-brand-success)]">
                    {placedOrder.deliveryFee === 0 ? 'FREE' : formatPrice(placedOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--color-brand-chocolate)] pt-2 border-t border-[var(--color-brand-primary-light)]/40">
                  <span>Total Amount</span>
                  <span className="text-[var(--color-brand-primary-dark)]">{formatPrice(placedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  to={`/order/${placedOrder.id}`}
                  className="w-full py-3 text-center rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm shadow-sm transition-all border border-[#FCD200]"
                >
                  Track Your Delivery
                </Link>
                <Link
                  to="/shop"
                  className="w-full py-3 text-center rounded-xl bg-white hover:bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] font-bold text-sm border border-[var(--color-brand-primary-light)]/60 shadow-sm transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AMAZON-STYLE CHECKOUT SCREEN
  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[var(--color-brand-chocolate)] pb-16">
      {/* Amazon-Style Clean Header */}
      <header className="bg-white border-b border-gray-200 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="container-main max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center font-heading text-lg font-bold">
              Y
            </div>
            <div>
              <span className="font-heading text-xl font-bold tracking-tight leading-none block text-[var(--color-brand-chocolate)]">
                YOYO CAKES
              </span>
              <span className="text-[10px] text-[var(--color-brand-muted)] font-medium">Checkout</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Lock size={15} className="text-[var(--color-brand-success)]" />
            <span className="hidden sm:inline">100% Secure 256-Bit SSL Checkout</span>
          </div>
        </div>
      </header>

      <main className="container-main max-w-6xl py-8">
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/cart" className="hover:text-[var(--color-brand-primary-dark)] font-medium flex items-center gap-1">
            <ArrowLeft size={14} /> Return to Cart
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">Review & Pay</span>
        </div>

        {/* DaisyUI Checkout Progress Steps */}
        <div className="flex justify-center mb-8">
          <ul className="steps steps-horizontal w-full max-w-lg text-xs font-bold">
            <li className="step step-primary" data-content="✓">Cart</li>
            <li className="step step-primary" data-content="2">Delivery & Slots</li>
            <li className="step text-gray-400 font-medium" data-content="3">Payment & Review</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Accordion Steps */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: DELIVERY ADDRESS & GPS PINPOINT */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                      {fulfillment === 'delivery' ? 'Delivery Address & GPS Location' : 'Bakery Store Pickup Details'}
                    </h2>
                  </div>
                  {savedAddresses.length > 0 && fulfillment === 'delivery' && (
                    <span className="text-xs text-[var(--color-brand-primary-dark)] font-semibold">
                      {savedAddresses.length} saved address{savedAddresses.length > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>

                {/* Fulfillment Choice Tabs */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fulfillment === 'delivery'
                        ? 'bg-white text-gray-900 shadow-xs ring-1 ring-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Truck size={15} className="text-[var(--color-brand-primary-dark)]" />
                    Doorstep Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fulfillment === 'pickup'
                        ? 'bg-white text-gray-900 shadow-xs ring-1 ring-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Store size={15} className="text-[var(--color-brand-primary-dark)]" />
                    Bakery Store Pickup (Free)
                  </button>
                </div>

                {/* FULFILLMENT MODE A: DOORSTEP DELIVERY */}
                {fulfillment === 'delivery' ? (
                  <div className="space-y-5">
                    {/* Saved Addresses Selector */}
                    {savedAddresses.length > 0 && (
                      <SavedAddressesSelector
                        addresses={savedAddresses}
                        selectedAddressId={selectedAddressId}
                        onSelectAddress={handleAddressSelect}
                        onAddNewAddress={() => {
                          setEditingAddress(null);
                          setIsAddressModalOpen(true);
                        }}
                        onEditAddress={(addr) => {
                          setEditingAddress(addr);
                          setIsAddressModalOpen(true);
                        }}
                        onAddressDeleted={(delId) => {
                          setSavedAddresses((prev) => prev.filter((a) => a.id !== delId));
                          if (selectedAddressId === delId) setSelectedAddressId('new');
                        }}
                        userId={user?.uid}
                      />
                    )}

                    {/* Interactive Google Map with GPS Button */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                          Pinpoint Delivery Gate on Google Map
                        </label>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Drag pin or tap GPS
                        </span>
                      </div>

                      <InteractiveGoogleMap
                        initialCoords={{ latitude: form.latitude, longitude: form.longitude }}
                        onLocationSelected={handleMapLocationPicked}
                        maxRadiusKm={deliverySettings.maxRadiusKm}
                        height="260px"
                      />
                    </div>

                    {/* Live Serviceability & Distance Status Card */}
                    {checkingServiceability && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-pulse">
                        <span className="loading loading-spinner loading-xs text-amber-700" />
                        <span>Validating kitchen road distance & serviceability...</span>
                      </div>
                    )}

                    {!checkingServiceability && serviceability?.serviceable && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                        <div>
                          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle size={15} className="text-emerald-600" />
                            <span>Serviceable Delivery Area</span>
                          </div>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Road distance: <span className="font-semibold">{serviceability.distanceKm} km</span> from kitchen • Dispatch ETA: <span className="font-semibold">~{serviceability.estimatedMinutes} mins</span>
                          </p>
                        </div>
                        <div className="text-right sm:self-center">
                          <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold block">Delivery Fee</span>
                          <span className="font-extrabold text-sm text-emerald-900">
                            {serviceability.deliveryFee === 0 ? 'FREE' : formatPrice(serviceability.deliveryFee)}
                          </span>
                        </div>
                      </div>
                    )}

                    {!checkingServiceability && serviceability && !serviceability.serviceable && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2.5 shadow-xs">
                        <div className="font-bold flex items-center gap-1.5 text-rose-800">
                          <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                          <span>Delivery Unavailable for Selected Location</span>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          {serviceability.reason}
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setFulfillment('pickup')}
                            className="btn btn-sm bg-[var(--color-brand-primary-dark)] hover:bg-[#85300B] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Store size={14} /> Switch to Bakery Store Pickup (Free)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Manual Address Input Form Fields */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Recipient Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Receiver's full name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Mobile Number (For Delivery Updates) *
                        </label>
                        <div className="flex rounded-xl border border-gray-300 focus-within:border-[var(--color-brand-primary-dark)] overflow-hidden">
                          <span className="bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 border-r border-gray-300 flex items-center">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            maxLength={10}
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="10-digit phone"
                            className="w-full px-3 py-2.5 text-sm outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Street Address / Flat / Building *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          placeholder="House/Flat No., Apartment name, Street name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Apartment / Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={form.landmark}
                          onChange={handleChange}
                          placeholder="e.g. Near Metro / Behind Temple"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                            Pincode *
                          </label>
                          <button
                            type="button"
                            onClick={openLocationModal}
                            className="text-[11px] font-semibold text-[var(--color-brand-primary-dark)] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin size={12} /> Change Hub / GPS
                          </button>
                        </div>
                        <input
                          type="text"
                          name="pincode"
                          maxLength={6}
                          value={form.pincode}
                          onChange={handleChange}
                          required
                          placeholder="600001"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="Order confirmation email"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium"
                        />
                      </div>
                    </div>

                    {user && (
                      <label className="flex items-center gap-2 mt-4 text-xs text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveAddressToBook}
                          onChange={(e) => setSaveAddressToBook(e.target.checked)}
                          className="rounded accent-[var(--color-brand-primary-dark)]"
                        />
                        <span>Save this address to my YOYO CAKES address book for 1-click checkout next time</span>
                      </label>
                    )}
                  </div>
                ) : (
                  /* FULFILLMENT MODE B: BAKERY STORE PICKUP */
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                      <div className="flex items-center gap-2 text-[var(--color-brand-chocolate)] font-bold text-sm">
                        <Store size={18} className="text-[var(--color-brand-primary-dark)]" />
                        <span>{activePickupName}</span>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                        📍 {activePickupAddress}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 text-xs text-gray-600">
                        <div>
                          <span className="font-semibold block text-gray-900">⏰ Pick-up Hours:</span>
                          <span>Mon – Sun: 9:00 AM – 10:00 PM</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-gray-900">📞 Kitchen Helpline:</span>
                          <span>+91 84288 55444 / +91 63796 03744</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-amber-100 text-[11px] text-amber-900">
                        ✨ <strong>Zero Delivery Fee:</strong> No delivery charges apply on store pickups. Your fresh cake will be packed in a refrigerated bakery gift box ready for pickup!
                      </div>
                    </div>

                    {/* Pickup Customer Verification Info */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Collector's Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Person picking up cake"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-sm outline-none bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                          Mobile Number (For Ready-to-Collect SMS) *
                        </label>
                        <div className="flex rounded-xl border border-gray-300 focus-within:border-[var(--color-brand-primary-dark)] overflow-hidden">
                          <span className="bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 border-r border-gray-300 flex items-center">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            maxLength={10}
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="10-digit mobile"
                            className="w-full px-3 py-2.5 text-sm outline-none font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: DELIVERY DATE & TIME SLOT */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                    Choose Delivery Date & Time Slot
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[var(--color-brand-primary-dark)]" />
                      Select Delivery Date
                    </label>
                    <input
                      type="date"
                      min={TODAY_DATE}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 focus:border-[var(--color-brand-primary-dark)] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 block">
                      Choose Your Time Slot
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <label
                          key={slot.id}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            deliverySlot === slot.id
                              ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)]/50 ring-2 ring-[var(--color-brand-primary-dark)]/15'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliverySlot"
                            value={slot.id}
                            checked={deliverySlot === slot.id}
                            onChange={() => setDeliverySlot(slot.id)}
                            className="mt-1 accent-[var(--color-brand-primary-dark)]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--color-brand-chocolate)]">
                                {slot.label}
                              </span>
                            </div>
                            <span className="text-xs text-[var(--color-brand-primary-dark)] font-bold block mt-0.5">
                              {slot.time}
                            </span>
                            <span className="text-[11px] text-gray-500 block mt-0.5">{slot.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: PAYMENT METHOD (Amazon-Style Selection) */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Option A: Razorpay */}
                  <label
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentChoice === 'razorpay'
                        ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)]/40 ring-2 ring-[var(--color-brand-primary-dark)]/15'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      value="razorpay"
                      checked={paymentChoice === 'razorpay'}
                      onChange={() => setPaymentChoice('razorpay')}
                      className="mt-1 accent-[var(--color-brand-primary-dark)]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <CreditCard size={16} className="text-[var(--color-brand-primary-dark)]" />
                          Online Payment (UPI, Cards, Netbanking)
                        </span>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          Instant Confirmation
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Pay via Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay, or Netbanking through secure 256-bit Razorpay.
                      </p>
                    </div>
                  </label>

                  {/* Option B: Pay on Delivery */}
                  <label
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      paymentChoice === 'cod'
                        ? 'border-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)]/40 ring-2 ring-[var(--color-brand-primary-dark)]/15'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentChoice"
                      value="cod"
                      checked={paymentChoice === 'cod'}
                      onChange={() => setPaymentChoice('cod')}
                      className="mt-1 accent-[var(--color-brand-primary-dark)]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Banknote size={16} className="text-[var(--color-brand-primary-dark)]" />
                          Pay on Delivery (Cash or UPI at Doorstep)
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Zero Advance Needed
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Pay in cash or scan delivery partner's QR code on arrival after verifying your fresh bakery package.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* STEP 4: REVIEW ITEMS & SPECIAL INSTRUCTIONS */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-7 rounded-full bg-[var(--color-brand-primary-dark)] text-white font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                    Review Items & Cake Customization
                  </h2>
                </div>

                <div className="divide-y divide-gray-100 mb-5">
                  {items.map((item) => (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          {item.customMessage && (
                            <p className="text-[11px] font-semibold text-[var(--color-brand-primary-dark)] mt-0.5">
                              Message: "{item.customMessage}"
                            </p>
                          )}
                          {item.includeCandles && (
                            <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.2 rounded font-medium inline-block mt-0.5">
                              ✓ Free Candles & Wooden Knife
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 block">
                    Special Delivery Instructions / Gate Code (Optional)
                  </label>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Ring bell twice, deliver to security guard, baby sleeping"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm outline-none focus:border-[var(--color-brand-primary-dark)]"
                  />
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Amazon-Style Sticky Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  {/* Prominent Amazon Place Order Button */}
                  <button
                    type="submit"
                    disabled={processing || (fulfillment === 'delivery' && Boolean(serviceability && !serviceability.serviceable))}
                    className="w-full py-3.5 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-[#FCD200] mb-3 cursor-pointer"
                  >
                    {processing ? (
                      <span className="inline-block animate-spin mr-2">⏳</span>
                    ) : fulfillment === 'delivery' && serviceability && !serviceability.serviceable ? (
                      'Address Outside Delivery Radius'
                    ) : (
                      paymentChoice === 'razorpay' ? 'Place Your Order & Pay' : 'Place Your Order (Pay on Delivery)'
                    )}
                  </button>

                  <p className="text-[11px] text-gray-500 text-center leading-relaxed mb-5">
                    By placing your order, you agree to YOYO CAKES' Privacy Notice and Conditions of Use.
                  </p>

                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-900 pb-3 border-b border-gray-100 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({items.reduce((s, i) => s + i.quantity, 0)}):</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery & Handling:</span>
                      {deliveryFee === 0 ? (
                        <span className="font-semibold text-emerald-700">₹0 (Complimentary / Pickup)</span>
                      ) : (
                        <span className="font-semibold text-gray-900">{formatPrice(deliveryFee)}</span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-gray-900">
                      <span>Order Total:</span>
                      <span className="text-[var(--color-brand-primary-dark)]">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Trust guarantees */}
                  <div className="mt-6 pt-5 border-t border-gray-100 space-y-2.5 text-[11px] text-gray-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-green-600 flex-shrink-0" />
                      <span>100% Freshly Baked Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-blue-600 flex-shrink-0" />
                      <span>Temperature Controlled Delivery Boxes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                      <span>Complimentary Candles & Wooden Knife</span>
                    </div>
                  </div>
                </div>

                {/* Need assistance helper box */}
                <div className="bg-[var(--color-brand-cream)] rounded-xl border border-[var(--color-brand-primary-light)]/40 p-4 text-xs">
                  <span className="font-bold text-[var(--color-brand-chocolate)] block mb-1">
                    Need Help with Your Order?
                  </span>
                  <p className="text-[var(--color-brand-muted)] mb-2">
                    Our master bakery concierge is online to assist with delivery timing or custom decor.
                  </p>
                  <a
                    href="https://wa.me/918428855444"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-brand-primary-dark)] font-bold hover:underline"
                  >
                    Chat on WhatsApp (+91 84288 55444) →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Interactive Delivery Address & GPS Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onAddressSaved={handleAddressSaved}
        editingAddress={editingAddress}
      />
    </div>
  );
}
