import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { formatPrice, PRODUCTS } from '@/data/products';
import { validateCouponInFirestore } from '@/services/firestoreService';

// Curated celebration party add-ons for the "Customers Also Bought" section
const CELEBRATION_ADDONS = [
  {
    id: 'addon-sparkler',
    name: 'Sparkler Fountain Candle (Pack of 2)',
    category: 'Celebration',
    categorySlug: 'cakes',
    price: 99,
    mrp: 149,
    image: '/images/categories/cakes.jpg',
    description: 'Smokeless gold sparkler candle for birthday cakes',
    inStock: true,
    stockQuantity: 50,
    featured: false,
    bestseller: true,
    ingredients: '',
    allergens: '',
  },
  {
    id: 'addon-topper',
    name: 'Golden Metallic "Happy Birthday" Topper',
    category: 'Celebration',
    categorySlug: 'cakes',
    price: 89,
    mrp: 129,
    image: '/images/categories/cakes.jpg',
    description: 'Acrylic reusable luxury golden birthday topper',
    inStock: true,
    stockQuantity: 40,
    featured: false,
    bestseller: false,
    ingredients: '',
    allergens: '',
  },
  {
    id: 'addon-dip',
    name: 'Extra Warm Belgian Chocolate Fudge Dip (100ml)',
    category: 'Brownies',
    categorySlug: 'brownies',
    price: 129,
    mrp: 179,
    image: '/images/categories/brownies.jpg',
    description: 'Melted 55% Belgian chocolate ganache cup',
    inStock: true,
    stockQuantity: 30,
    featured: false,
    bestseller: true,
    ingredients: 'Belgian cocoa, cream, butter',
    allergens: 'Dairy',
  },
  {
    id: 'addon-card',
    name: 'Handwritten Calligraphy Greeting Card',
    category: 'Celebration',
    categorySlug: 'cakes',
    price: 49,
    mrp: 79,
    image: '/images/categories/cakes.jpg',
    description: 'Custom message penned with luxury golden ink',
    inStock: true,
    stockQuantity: 100,
    featured: false,
    bestseller: false,
    ingredients: '',
    allergens: '',
  },
];

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

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isGiftOrder, setIsGiftOrder] = useState(false);

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const freeDeliveryThreshold = 500;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const deliveryFee = isFreeDelivery ? 0 : 40;
  const discount = couponApplied ? discountAmount : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Compute total simulated M.R.P. savings
  const totalMrp = items.reduce((acc, i) => {
    const itemMrp = Math.round((i.product.price * 1.18) / 10) * 10;
    return acc + itemMrp * i.quantity;
  }, 0);
  const totalSavings = Math.max(0, totalMrp - subtotal + discount);

  const handleWhatsAppCartOrder = () => {
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
      `*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}`,
      isGiftOrder ? `*Gift Packaging Requested:* Yes 🎁` : '',
      `*Total:* ${formatPrice(total)}`,
      ``,
      `Please confirm kitchen availability for delivery/pickup in Chennai. Thank you!`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${hotline}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) return;
    const res = await validateCouponInFirestore(code, subtotal);
    if (res.valid) {
      setCouponApplied(true);
      setDiscountAmount(res.discount);
      setCouponCode(code);
      toast.success(res.message || 'Coupon applied successfully!');
    } else {
      setCouponApplied(false);
      setDiscountAmount(0);
      toast.error(res.message || 'Invalid coupon code');
    }
  };

  const handleMoveToWishlist = (product: (typeof items)[0]['product']) => {
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
      <div className="min-h-screen bg-[#F0F2F2] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={40} />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F1111] mb-2">
            Your YOYO Cart is empty
          </h2>
          <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
            Explore our fresh artisanal 5-in-1 Torte cakes, molten brownies, and handcrafted celebration treats!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-8 py-3 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold rounded-full text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              Shop Today's Deals <ArrowRight size={16} />
            </Link>
            <Link
              to="/wishlist"
              className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-full text-sm transition-all flex items-center justify-center gap-2"
            >
              <Heart size={16} className="text-red-500" /> View Wishlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-6 sm:py-8 font-sans">
      <div className="container-main max-w-7xl px-4">
        {/* DaisyUI Checkout Progress Steps */}
        <div className="flex justify-center mb-6">
          <ul className="steps steps-horizontal w-full max-w-lg text-xs font-bold">
            <li className="step step-primary" data-content="1">Shopping Cart</li>
            <li className="step text-gray-500" data-content="2">Delivery & Slots</li>
            <li className="step text-gray-500" data-content="3">Payment & Review</li>
          </ul>
        </div>

        {/* Amazon-Style Free Delivery Progress Bar */}
        <div className="bg-white rounded-xl p-4 sm:p-5 mb-5 shadow-xs border border-gray-200/90">
          <div className="flex items-center gap-3 mb-2.5">
            {isFreeDelivery ? (
              <CheckCircle2 size={24} className="text-[#007600] flex-shrink-0" />
            ) : (
              <Sparkles size={22} className="text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              {isFreeDelivery ? (
                <div className="text-sm sm:text-base font-bold text-[#007600]">
                  Your order qualifies for FREE Express Delivery in Chennai!
                  <span className="text-xs font-normal text-gray-600 block sm:inline sm:ml-2">
                    (Orders above {formatPrice(freeDeliveryThreshold)})
                  </span>
                </div>
              ) : (
                <div className="text-sm sm:text-base text-gray-800 font-medium">
                  Add{' '}
                  <span className="font-extrabold text-[#B12704]">
                    {formatPrice(amountToFreeDelivery)}
                  </span>{' '}
                  more of eligible fresh bakes to qualify for{' '}
                  <span className="font-bold text-[#007600]">FREE Delivery</span>.
                </div>
              )}
            </div>
          </div>
          {/* Progress track */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeDelivery ? 'bg-[#007600]' : 'bg-[#FFD814]'
              }`}
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cart Items & Saved For Later (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Cart Items Card */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-6">
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-3 mb-4">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F1111]">
                    Shopping Cart
                  </h1>
                  <span className="text-xs text-gray-500">
                    {items.length === 0 ? 'No items selected' : `${itemCount} items currently in cart`}
                  </span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    const itemMrp = Math.round((item.product.price * 1.18) / 10) * 10;
                    const itemDiscount = Math.round(((itemMrp - item.product.price) / itemMrp) * 100);

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

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/product/${item.product.id}`}
                                className="font-heading text-base sm:text-lg font-bold text-[#0F1111] hover:text-[#C7511F] transition-colors leading-snug"
                              >
                                {item.product.name}
                              </Link>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Category: <span className="font-semibold text-gray-700">{item.product.category}</span>
                              </div>

                              {/* Fresh Stock Badge */}
                              <div className="text-xs font-semibold text-[#007600] mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#007600] inline-block animate-pulse" />
                                In Stock – Freshly Baked to Order in Chennai
                              </div>

                              {/* Eligible for Free Shipping badge */}
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Eligible for <span className="font-semibold text-gray-700">FREE Express Delivery</span>
                              </div>

                              {/* Custom Message if added */}
                              {item.customMessage && (
                                <div className="mt-2 text-xs bg-amber-50/70 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-md inline-block">
                                  <span className="font-bold">Message on Cake:</span> "{item.customMessage}"
                                </div>
                              )}

                              {item.includeCandles && (
                                <div className="mt-1 text-[11px] text-[#007600] font-medium">
                                  ✓ Complimentary cake knife & candles included
                                </div>
                              )}
                            </div>

                            {/* Price for Mobile & Desktop */}
                            <div className="sm:text-right mt-1 sm:mt-0 flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                              <span className="text-lg font-extrabold text-[#0F1111]">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="line-through">{formatPrice(itemMrp * item.quantity)}</span>
                                <span className="text-xs font-bold text-[#CC0C39]">
                                  {itemDiscount}% off
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amazon-Style Actions Row */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 text-xs">
                            {/* Quantity Stepper */}
                            <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded-lg shadow-2xs overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1 hover:bg-gray-200 transition-colors text-gray-700"
                                title="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="px-3 py-1 font-bold text-gray-800 bg-white border-x border-gray-300 min-w-[28px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1 hover:bg-gray-200 transition-colors text-gray-700"
                                title="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <span className="text-gray-300 hidden sm:inline">|</span>

                            <button
                              onClick={() => {
                                removeItem(item.product.id);
                                toast.success(`${item.product.name} removed`);
                              }}
                              className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
                            >
                              Delete
                            </button>

                            <span className="text-gray-300">|</span>

                            <button
                              onClick={() => {
                                saveForLater(item.product.id);
                                toast.success(`${item.product.name} saved for later`);
                              }}
                              className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
                            >
                              Save for later
                            </button>

                            <span className="text-gray-300">|</span>

                            <button
                              onClick={() => handleMoveToWishlist(item.product)}
                              className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
                            >
                              Move to Wishlist
                            </button>

                            <span className="text-gray-300 hidden sm:inline">|</span>

                            <button
                              onClick={() => handleShareProduct(item.product.id, item.product.name)}
                              className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium hidden sm:flex items-center gap-1"
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
                <div className="border-t border-gray-200 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        clearCart();
                        toast.success('Shopping cart cleared');
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Clear all items
                    </button>
                    <Link
                      to="/shop"
                      className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
                    >
                      Continue shopping
                    </Link>
                  </div>
                  <div className="text-sm sm:text-base text-gray-800">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                    <span className="text-lg sm:text-xl font-extrabold text-[#0F1111]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Amazon-Style "Saved for Later" Section */}
            {savedItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-6 animate-fade-in">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h2 className="font-heading text-xl font-bold text-[#0F1111]">
                    Saved for Later ({savedItems.length}{' '}
                    {savedItems.length === 1 ? 'item' : 'items'})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Items moved here won't be charged until you move them back to your cart.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((sItem) => (
                    <div
                      key={sItem.product.id}
                      className="p-4 rounded-xl border border-gray-200 flex gap-4 items-start bg-gray-50/50"
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
                          className="font-bold text-sm text-[#0F1111] hover:text-[#C7511F] line-clamp-1"
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
                            className="px-3 py-1 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs rounded-full shadow-2xs transition-all"
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

            {/* Amazon "Customers Also Bought" / Party Add-ons Carousel */}
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#0F1111] flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" /> Customers Also Bought Fresh Party Add-ons
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add celebration candles, toppers, and warm chocolate fudge dip to complete your order!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {CELEBRATION_ADDONS.map((addon) => (
                  <div
                    key={addon.id}
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                        <img
                          src={addon.image}
                          alt={addon.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug mb-1">
                        {addon.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xs font-extrabold text-[#0F1111]">
                          {formatPrice(addon.price)}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(addon.mrp)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addItem(addon as (typeof PRODUCTS)[0], 1);
                        toast.success(`${addon.name} added to cart`);
                      }}
                      className="w-full py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-[11px] rounded-full shadow-2xs transition-all flex items-center justify-center gap-1"
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Amazon Buy Box & Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 sm:p-6">
              {/* Free Delivery Reassurance */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-[#007600] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-bold text-[#007600]">
                      {isFreeDelivery ? 'Qualifies for FREE Delivery.' : 'Fast Express Delivery.'}
                    </span>{' '}
                    Choose delivery time slot at checkout.
                  </div>
                </div>
              </div>

              {/* Subtotal Display */}
              <div className="mb-4">
                <div className="text-sm text-gray-800">
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
                </div>
                <div className="text-2xl font-extrabold text-[#0F1111]">
                  {formatPrice(subtotal)}
                </div>
                {totalSavings > 0 && (
                  <div className="text-xs font-semibold text-[#007600] mt-0.5">
                    You save {formatPrice(totalSavings)} on this order!
                  </div>
                )}
              </div>

              {/* Gift Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer mb-5 text-xs text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={isGiftOrder}
                  onChange={(e) => setIsGiftOrder(e.target.checked)}
                  className="rounded text-[#FF9900] focus:ring-[#FF9900] mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Gift size={13} className="text-amber-600" /> This order contains a gift
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    We'll include a complimentary celebration box with personalized card.
                  </span>
                </div>
              </label>

              {/* Amazon Gold Button: Proceed to Buy */}
              <Link
                to="/checkout"
                className="w-full py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] border border-[#FCD200] text-[#0F1111] font-bold rounded-full text-center block shadow-xs transition-all text-sm mb-3 active:scale-[0.99]"
              >
                Proceed to Buy ({itemCount} items)
              </Link>

              {/* WhatsApp Quick Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppCartOrder}
                className="w-full py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-full text-center flex items-center justify-center gap-2 shadow-xs transition-all text-xs"
              >
                <MessageCircle size={16} /> Order Cart via WhatsApp
              </button>

              {/* Coupon Accordion / Box */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                <label className="text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>Apply Promotional Code</span>
                  <Tag size={13} className="text-gray-400" />
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. YOYO10)"
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#FF9900] uppercase font-mono"
                    disabled={couponApplied}
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponApplied || !couponCode.trim()}
                    className="px-3.5 py-2 bg-[#232F3E] text-white text-xs font-bold rounded-lg hover:bg-[#131921] disabled:opacity-50 transition-colors"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

                {/* Popular Coupons Pills */}
                {!couponApplied && (
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      onClick={() => handleApplyCoupon('YOYO10')}
                      className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono font-bold hover:bg-amber-100"
                    >
                      YOYO10 (10% OFF)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon('FIRST50')}
                      className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono font-bold hover:bg-amber-100"
                    >
                      FIRST50 (₹50 OFF)
                    </button>
                  </div>
                )}

                {couponApplied && (
                  <div className="text-xs text-[#007600] font-semibold flex items-center justify-between mt-1">
                    <span>Coupon "{couponCode}" applied</span>
                    <button
                      onClick={() => {
                        setCouponApplied(false);
                        setDiscountAmount(0);
                        setCouponCode('');
                        toast.success('Coupon removed');
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Items total</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-[#007600] font-semibold">
                    <span>Promotion discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? <span className="text-[#007600]">FREE</span> : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#0F1111] pt-2 border-t border-gray-200">
                  <span>Order Total:</span>
                  <span className="text-base text-[#B12704]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Amazon Trust Guarantee Box */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#007600]" />
                  <span>256-Bit SSL Encrypted & Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-amber-600" />
                  <span>Same-Day & Midnight Delivery across Chennai</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-blue-600" />
                  <span>24x7 WhatsApp Bakery Concierge Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
