import { Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Tag,
  MessageCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Gift,
  Heart,
  Share2,
  Sparkles,
  HelpCircle,
  Lock,
  Truck,
  Store,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, PRODUCTS } from '@/data/products';
import { validateCouponInFirestore } from '@/services/firestoreService';
import { triggerHaptic } from '@/services/mobileService';

// Real bakery pairings from the 27 catalog products
const RECOMMENDED_PAIRINGS = [
  PRODUCTS.find((p) => p.id === 'cake-001') || PRODUCTS[0],
  PRODUCTS.find((p) => p.id === 'br-010') || PRODUCTS[1],
  PRODUCTS.find((p) => p.id === 'tira-001') || PRODUCTS[2],
  PRODUCTS.find((p) => p.id === 'jar-001') || PRODUCTS[3],
].filter(Boolean);

export default function CartPage() {
  const {
    items,
    savedItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    saveForLater,
    moveToCartFromSaved,
    removeSavedItem,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGiftOrder, setIsGiftOrder] = useState(false);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const discount = couponApplied ? discountAmount : 0;
  const estimatedTotal = Math.max(0, subtotal - discount);

  const handleProceedToCheckout = () => {
    triggerHaptic('heavy');
    if (!user) {
      toast.error('Please sign in or create an account to place your order.');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleWhatsAppCartOrder = () => {
    triggerHaptic('medium');
    const hotline = '918428855444';
    const itemLines = items
      .map((i, idx) => {
        let line = `${idx + 1}. *${i.product.name}* × ${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`;
        if (i.customMessage) line += `\n   └ Message: "${i.customMessage}"`;
        if (i.includeCandles) line += `\n   └ (Free knife & candle included)`;
        return line;
      })
      .join('\n');

    const messageLines = [
      `*Hello YOYO CAKES!* 🎂`,
      `I would like to order my shopping cart:`,
      ``,
      itemLines,
      ``,
      `*Subtotal:* ${formatPrice(subtotal)}`,
      discount > 0 ? `*Discount:* -${formatPrice(discount)}` : '',
      `*Fulfillment:* ${fulfillmentMode === 'pickup' ? 'Bakery Pickup (₹0)' : 'Home Delivery (charges calculated by address)'}`,
      isGiftOrder ? `*Gift Packaging Requested:* Yes 🎁` : '',
      `*Estimated Total:* ${formatPrice(estimatedTotal)}`,
      ``,
      `Please confirm kitchen availability for delivery/pickup in Chennai & Coimbatore. Thank you!`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${hotline}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) return;
    const res = await validateCouponInFirestore(code, subtotal);
    if (res.valid) {
      triggerHaptic('success');
      setCouponApplied(true);
      setDiscountAmount(res.discount);
      setCouponCode(code);
      toast.success(res.message || 'Coupon applied successfully!');
    } else {
      triggerHaptic('error');
      setCouponApplied(false);
      setDiscountAmount(0);
      toast.error(res.message || 'Invalid coupon code');
    }
  };

  const handleMoveToWishlist = (product: (typeof PRODUCTS)[0]) => {
    if (!isInWishlist(product.id)) {
      toggleWishlist(product.id);
    }
    removeItem(product.id);
    toast.success(`${product.name} moved to your wishlist`);
  };

  const handleShareProduct = (productId: string, productName: string) => {
    const url = `${window.location.origin}/product/${productId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success(`Copied link for ${productName}`);
    } else {
      toast.success(`Share link: ${url}`);
    }
  };

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] flex items-center justify-center py-16 px-4 pb-28 lg:pb-16">
        <div className="bg-[var(--color-brand-surface)] rounded-2xl shadow-sm border border-[var(--color-brand-border)] p-8 sm:p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={40} />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)] mb-2">
            Your YOYO Cart is empty
          </h2>
          <p className="text-sm text-[var(--color-brand-muted)] mb-8 max-w-sm mx-auto">
            Explore our fresh artisanal 5-in-1 Torte cakes, molten brownies, and handcrafted celebration treats!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-8 py-3 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold rounded-full text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Shop All 27 Treats <ArrowRight size={16} />
            </Link>
            <Link
              to="/wishlist"
              className="px-6 py-3 bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] font-semibold rounded-full text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart size={16} className="text-red-500" /> View Wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen py-6 sm:py-8 font-sans pb-36 lg:pb-12 text-[var(--color-brand-chocolate)]">
      <div className="container-main max-w-7xl px-4">
        {/* Checkout Progress Steps */}
        <div className="flex justify-center mb-6">
          <ul className="steps steps-horizontal w-full max-w-lg text-xs font-bold">
            <li className="step step-primary" data-content="1">Shopping Cart</li>
            <li className="step text-[var(--color-brand-muted)]" data-content="2">Delivery & Slots</li>
            <li className="step text-[var(--color-brand-muted)]" data-content="3">Payment & Review</li>
          </ul>
        </div>

        {/* Fresh Patisserie Kitchen Reassurance Strip */}
        <div className="bg-[var(--color-brand-surface)] rounded-xl p-4 sm:p-5 mb-5 shadow-xs border border-[var(--color-brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-primary)] flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-brand-chocolate)]">
                Fresh Patisserie Kitchen Dispatch
              </p>
              <p className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                Handcrafted small-batch celebration treats baked fresh daily. Choose doorstep delivery or bakery hub pickup at checkout.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg self-start sm:self-auto flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/40">
            <CheckCircle2 size={13} /> 100% Quality Guaranteed
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cart Items & Saved For Later (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Cart Items Card */}
            <div className="bg-[var(--color-brand-surface)] rounded-xl shadow-xs border border-[var(--color-brand-border)] p-4 sm:p-6">
              <div className="flex items-baseline justify-between border-b border-[var(--color-brand-border)] pb-3 mb-4">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)]">
                    Shopping Cart
                  </h1>
                  <span className="text-xs text-[var(--color-brand-muted)]">
                    {items.length === 0 ? 'No items selected' : `${itemCount} items currently in cart`}
                  </span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">
                    Price
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Your cart is currently empty. Check out your saved items below or add items from our fresh bakery menu.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    return (
                      <div
                        key={item.product.id}
                        className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in"
                      >
                        {/* Product Thumbnail */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                          <img
                            src={item.product.image || `/images/categories/${item.product.categorySlug}.jpg`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `/images/categories/${item.product.categorySlug}.jpg`;
                            }}
                          />
                        </div>

                        {/* Product Info & Steppers */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/product/${item.product.id}`}
                                className="font-heading text-base sm:text-lg font-bold text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary)] line-clamp-2 leading-snug"
                              >
                                {item.product.name}
                              </Link>
                              <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                                Category: {item.product.category}
                              </p>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                In Stock • Baked Fresh Daily
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-base sm:text-lg font-extrabold text-[var(--color-brand-chocolate)]">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[11px] text-[var(--color-brand-muted)]">
                                  ({formatPrice(item.product.price)} each)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Custom Cake Message or Candle details */}
                          {(item.customMessage || item.includeCandles) && (
                            <div className="mt-2 text-xs bg-[var(--color-brand-surface-elevated)] p-2.5 rounded-lg border border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] space-y-1">
                              {item.customMessage && (
                                <p className="font-medium">
                                  Message on Cake: <span className="font-bold">"{item.customMessage}"</span>
                                </p>
                              )}
                              {item.includeCandles && (
                                <p className="text-[11px] text-[var(--color-brand-primary)] font-semibold">
                                  ✓ Celebration knife and candle included
                                </p>
                              )}
                            </div>
                          )}

                          {/* Controls Bar: Stepper & Actions */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-3 border-t border-[var(--color-brand-border)] text-xs">
                            {/* Quantity Controls Stepper */}
                            <div className="flex items-center rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] overflow-hidden shadow-2xs">
                              <button
                                onClick={() => {
                                  if (item.quantity <= 1) {
                                    triggerHaptic('medium');
                                    removeItem(item.product.id);
                                    toast.success(`${item.product.name} removed from cart`);
                                  } else {
                                    triggerHaptic('light');
                                    updateQuantity(item.product.id, item.quantity - 1);
                                  }
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-brand-border)] transition-colors text-[var(--color-brand-chocolate)]"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-10 text-center font-bold text-[var(--color-brand-chocolate)] text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  triggerHaptic('light');
                                  updateQuantity(item.product.id, item.quantity + 1);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-brand-border)] transition-colors text-[var(--color-brand-chocolate)]"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <span className="text-[var(--color-brand-border)]">|</span>

                            <button
                              onClick={() => {
                                triggerHaptic('medium');
                                removeItem(item.product.id);
                                toast.success(`${item.product.name} removed from cart`);
                              }}
                              className="text-[var(--color-brand-primary)] hover:underline font-medium cursor-pointer"
                            >
                              Delete
                            </button>

                            <span className="text-[var(--color-brand-border)]">|</span>

                            <button
                              onClick={() => {
                                saveForLater(item.product.id);
                                toast.success(`${item.product.name} saved for later`);
                              }}
                              className="text-[var(--color-brand-primary)] hover:underline font-medium cursor-pointer"
                            >
                              Save for later
                            </button>

                            <span className="text-[var(--color-brand-border)]">|</span>

                            <button
                              onClick={() => handleMoveToWishlist(item.product)}
                              className="text-[var(--color-brand-primary)] hover:underline font-medium cursor-pointer"
                            >
                              Move to Wishlist
                            </button>

                            <span className="text-[var(--color-brand-border)] hidden sm:inline">|</span>

                            <button
                              onClick={() => handleShareProduct(item.product.id, item.product.name)}
                              className="text-[var(--color-brand-primary)] hover:underline font-medium hidden sm:flex items-center gap-1 cursor-pointer"
                            >
                              <Share2 size={12} /> Share
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subtotal bar at bottom of cart card */}
              {items.length > 0 && (
                <div className="border-t border-[var(--color-brand-border)] mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        clearCart();
                        toast.success('Shopping cart cleared');
                      }}
                      className="text-xs text-[var(--color-brand-muted)] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Clear all items
                    </button>
                    <Link
                      to="/shop"
                      className="text-xs text-[var(--color-brand-primary)] hover:underline font-medium"
                    >
                      Continue shopping
                    </Link>
                  </div>
                  <div className="text-sm sm:text-base text-[var(--color-brand-chocolate)]">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                    <span className="text-lg sm:text-xl font-extrabold text-[var(--color-brand-chocolate)]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="bg-[var(--color-brand-surface)] rounded-xl shadow-xs border border-[var(--color-brand-border)] p-4 sm:p-6 animate-fade-in">
                <div className="border-b border-[var(--color-brand-border)] pb-3 mb-4">
                  <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)]">
                    Saved for Later ({savedItems.length}{' '}
                    {savedItems.length === 1 ? 'item' : 'items'})
                  </h2>
                  <p className="text-xs text-[var(--color-brand-muted)]">
                    Items moved here won't be charged until you move them back to your cart.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((sItem) => (
                    <div
                      key={sItem.product.id}
                      className="p-4 rounded-xl border border-[var(--color-brand-border)] flex gap-4 items-start bg-[var(--color-brand-surface-elevated)]"
                    >
                      <img
                        src={sItem.product.image || `/images/categories/${sItem.product.categorySlug}.jpg`}
                        alt={sItem.product.name}
                        className="w-20 h-20 rounded-lg object-cover bg-white border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `/images/categories/${sItem.product.categorySlug}.jpg`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${sItem.product.id}`}
                          className="font-bold text-sm text-[#0F1111] hover:text-[var(--color-brand-primary-dark)] line-clamp-1"
                        >
                          {sItem.product.name}
                        </Link>
                        <div className="font-extrabold text-sm text-[#0F1111] mt-0.5">
                          {formatPrice(sItem.product.price)}
                        </div>
                        <div className="text-[11px] text-[#007600] font-semibold mt-0.5">
                          In Stock
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              moveToCartFromSaved(sItem.product.id);
                              toast.success(`${sItem.product.name} moved to cart`);
                            }}
                            className="px-3 py-1 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-xs rounded-full shadow-2xs transition-all"
                          >
                            Move to Cart
                          </button>
                          <button
                            onClick={() => {
                              removeSavedItem(sItem.product.id);
                              toast.success(`${sItem.product.name} removed`);
                            }}
                            className="text-xs text-[#007185] hover:text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Bakery Pairings (From actual catalog) */}
            <div className="bg-[var(--color-brand-surface)] rounded-xl shadow-xs border border-[var(--color-brand-border)] p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" /> Recommended Bakery Pairings
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)]">
                    Fresh customer favorites to complement your order
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {RECOMMENDED_PAIRINGS.map((addon) => (
                  <div
                    key={addon.id}
                    className="p-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:border-[var(--color-brand-primary)]/50 hover:shadow-2xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-[var(--color-brand-cream-dark)] mb-2">
                        <img
                          src={addon.image || `/images/categories/${addon.categorySlug}.jpg`}
                          alt={addon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-xs text-[var(--color-brand-chocolate)] line-clamp-2 leading-snug mb-1">
                        {addon.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xs font-extrabold text-[var(--color-brand-chocolate)]">
                          {formatPrice(addon.price)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addItem(addon, 1);
                        toast.success(`${addon.name} added to cart`);
                      }}
                      className="w-full py-1.5 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-[11px] rounded-full shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Buy Box & Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-[var(--color-brand-surface)] rounded-xl shadow-xs border border-[var(--color-brand-border)] p-5 sm:p-6">
              {/* Distinct Delivery & Pickup Options */}
              <div className="mb-4 pb-4 border-b border-[var(--color-brand-border)]">
                <span className="text-xs font-bold text-[var(--color-brand-chocolate)] block mb-2">
                  Choose Fulfillment Option
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMode('delivery')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col cursor-pointer ${
                      fulfillmentMode === 'delivery'
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 font-bold text-[var(--color-brand-chocolate)] shadow-2xs ring-1 ring-[var(--color-brand-primary)]/30'
                        : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] hover:border-[var(--color-brand-primary)]/40'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Truck size={14} className="text-[var(--color-brand-primary)]" /> Doorstep Delivery
                    </span>
                    <span className="text-[10px] text-[var(--color-brand-muted)] font-normal mt-1 leading-tight">
                      Calculated at checkout by address
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentMode('pickup')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col cursor-pointer ${
                      fulfillmentMode === 'pickup'
                        ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/15 font-bold text-[var(--color-brand-chocolate)] shadow-2xs ring-1 ring-[var(--color-brand-primary)]/30'
                        : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] hover:border-[var(--color-brand-primary)]/40'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Store size={14} className="text-emerald-600 dark:text-emerald-400" /> Kitchen Pickup
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 leading-tight">
                      ₹0 (Complimentary)
                    </span>
                  </button>
                </div>
              </div>

              {/* Subtotal Display */}
              <div className="mb-4">
                <div className="text-sm text-[var(--color-brand-muted)]">
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
                </div>
                <div className="text-2xl font-extrabold text-[var(--color-brand-chocolate)]">
                  {formatPrice(subtotal)}
                </div>
              </div>

              {/* Gift Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] cursor-pointer mb-5 text-xs text-[var(--color-brand-chocolate)] select-none">
                <input
                  type="checkbox"
                  checked={isGiftOrder}
                  onChange={(e) => setIsGiftOrder(e.target.checked)}
                  className="rounded text-[var(--color-brand-primary-dark)] focus:ring-[var(--color-brand-primary)] mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-bold text-[var(--color-brand-chocolate)] flex items-center gap-1">
                    <Gift size={13} className="text-amber-600" /> This order contains a celebration gift
                  </span>
                  <span className="text-[11px] text-[var(--color-brand-muted)] block mt-0.5">
                    We'll include a complimentary celebration box with personalized handwritten card.
                  </span>
                </div>
              </label>

              {/* Proceed to Buy with Auth Gate */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold rounded-full text-center flex items-center justify-center gap-2 shadow-xs transition-all text-sm mb-3 active:scale-[0.99] cursor-pointer"
              >
                {!user && <Lock size={15} className="text-white/80" />}
                <span>
                  {user ? `Proceed to Buy (${itemCount} items)` : `Sign In to Buy (${itemCount} items)`}
                </span>
              </button>

              {/* WhatsApp Quick Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppCartOrder}
                className="w-full py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-full text-center flex items-center justify-center gap-2 shadow-xs transition-all text-xs cursor-pointer"
              >
                <MessageCircle size={16} /> Order Cart via WhatsApp
              </button>

              {/* Promo Code Section */}
              <div className="mt-5 pt-4 border-t border-[var(--color-brand-border)]">
                <label className="text-xs font-bold text-[var(--color-brand-chocolate)] mb-2 flex items-center justify-between">
                  <span>Apply Promotional Code</span>
                  <Tag size={13} className="text-[var(--color-brand-muted)]" />
                </label>
                <div className="join w-full mb-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. YOYO10)"
                    className="join-item input input-bordered input-sm flex-1 text-xs uppercase font-mono tracking-wider focus:outline-[var(--color-brand-primary)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] border-[var(--color-brand-border)]"
                    disabled={couponApplied}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponApplied || !couponCode.trim()}
                    className="join-item btn btn-neutral btn-sm text-xs font-bold px-4"
                  >
                    {couponApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>

                {!couponApplied && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] mt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('YOYO10')}
                      className="badge badge-warning badge-outline hover:badge-warning cursor-pointer font-mono font-bold transition-all"
                    >
                      YOYO10 (10% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('FIRST50')}
                      className="badge badge-warning badge-outline hover:badge-warning cursor-pointer font-mono font-bold transition-all"
                    >
                      FIRST50 (₹50 OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon('SWEET20')}
                      className="badge badge-warning badge-outline hover:badge-warning cursor-pointer font-mono font-bold transition-all"
                    >
                      SWEET20 (20% OFF)
                    </button>
                  </div>
                )}

                {couponApplied && (
                  <div className="alert alert-success text-xs py-2 px-3 mt-2 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={15} />
                      <span>Coupon "{couponCode}" applied (-{formatPrice(discount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponApplied(false);
                        setDiscountAmount(0);
                        setCouponCode('');
                        toast.success('Coupon removed');
                      }}
                      className="btn btn-ghost btn-xs text-xs font-bold text-red-700 hover:bg-transparent hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown Summary */}
              <div className="mt-4 pt-4 border-t border-[var(--color-brand-border)] space-y-2 text-xs text-[var(--color-brand-muted)]">
                <div className="flex justify-between">
                  <span>Items total</span>
                  <span className="font-semibold text-[var(--color-brand-chocolate)]">{formatPrice(subtotal)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promotion discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery charges</span>
                  <span className="font-semibold text-[var(--color-brand-chocolate)]">
                    {fulfillmentMode === 'pickup' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹0 (Bakery Pickup)</span>
                    ) : (
                      <span className="text-[var(--color-brand-muted)]">Calculated at checkout</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[var(--color-brand-chocolate)] pt-2 border-t border-[var(--color-brand-border)]">
                  <span>Estimated Total:</span>
                  <div className="text-right">
                    <span className="text-base text-[var(--color-brand-primary)]">{formatPrice(estimatedTotal)}</span>
                    {fulfillmentMode === 'delivery' && (
                      <span className="block text-[10px] text-[var(--color-brand-muted)] font-normal">
                        + delivery fee confirmed at checkout
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Guarantee Box */}
              <div className="mt-6 pt-4 border-t border-[var(--color-brand-border)] space-y-2 text-[11px] text-[var(--color-brand-muted)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>256-Bit SSL Encrypted & Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-600" />
                  <span>Fresh daily bakes across Chennai & Coimbatore</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-blue-500" />
                  <span>WhatsApp Bakery Concierge Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar (Positioned above BottomNav with safe-area support) */}
      {items.length > 0 && (
        <div
          className="lg:hidden fixed left-0 right-0 z-40 bg-[var(--color-brand-surface)]/95 backdrop-blur-md border-t border-[var(--color-brand-border)] p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div>
            <span className="text-[10px] text-[var(--color-brand-muted)] block uppercase font-bold">
              Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </span>
            <span className="font-heading text-base font-extrabold text-[var(--color-brand-chocolate)] leading-none">
              {formatPrice(estimatedTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppCartOrder}
              className="bg-[#25D366] text-white p-2.5 rounded-full shadow-xs cursor-pointer active:scale-95 transition-transform"
              title="Order cart on WhatsApp"
              aria-label="Order cart on WhatsApp"
            >
              <MessageCircle size={18} />
            </button>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="py-2.5 px-5 rounded-full bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] active:scale-95 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>Proceed to Buy</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
