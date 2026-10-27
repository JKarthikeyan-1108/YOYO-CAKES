import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  ArrowLeft, 
  Star, 
  Share2, 
  Sparkles, 
  CheckCircle, 
  MessageCircle, 
  Truck, 
  ShieldCheck, 
  AlertCircle,
  Zap, 
  Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductById, formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useProductStore } from '@/stores/productStore';
import ProductCard from '@/components/product/ProductCard';
import { triggerHaptic } from '@/services/mobileService';
import {
  getApprovedReviews,
  addCustomerReview,
  type CustomerReview,
} from '@/services/reviewService';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(id || ''));

  const getStoreProduct = useProductStore((s) => s.getProductById);
  const allProducts = useProductStore((s) => s.products);
  const productFromStore = id ? getStoreProduct(id) : undefined;
  const product = productFromStore || (id ? getProductById(id) : undefined);
  const categoryImage = product ? `/images/categories/${product.categorySlug}.jpg` : '';
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  // Cake customization options
  const [customMessage, setCustomMessage] = useState('');
  const [includeCandles, setIncludeCandles] = useState(false);

  // Review submission state from real reviewService
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(() => {
    return getApprovedReviews().filter((r) => r.productId === id);
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewHeadline, setNewReviewHeadline] = useState('');
  const [newReviewText, setNewReviewText] = useState('');

  // Always scroll to top when product ID loads or changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] mb-3">
            Product Not Found
          </h2>
          <p className="text-[var(--color-brand-muted)] mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/shop" className="btn-primary">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const displayImage = imgSrc || product.image || categoryImage;

  const handleImageError = () => {
    if (!hasFailedOnce && displayImage !== categoryImage) {
      setImgSrc(categoryImage);
      setHasFailedOnce(true);
    }
  };

  const handleAddToCart = () => {
    triggerHaptic('medium');
    addItem(product, quantity, {
      customMessage: customMessage.trim() || undefined,
      includeCandles,
    });
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    triggerHaptic('heavy');
    addItem(product, quantity, {
      customMessage: customMessage.trim() || undefined,
      includeCandles,
    });
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    triggerHaptic('light');
    toggleWishlist(product.id);
    if (!isInWishlist) {
      toast.success(`${product.name} added to wishlist!`);
    } else {
      toast('Removed from wishlist', { icon: '🤍' });
    }
  };

  const handleShare = async () => {
    if (!product) return;
    triggerHaptic('light');
    const shareData = {
      title: `${product.name} | YOYO CAKES`,
      text: `Check out ${product.name} from YOYO CAKES Artisanal Patisserie!`,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          navigator.clipboard?.writeText(window.location.href);
          toast.success('Product link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleWhatsAppOrder = () => {
    const hotline = '918428855444';
    const messageLines = [
      `*Hello YOYO CAKES!* 🎂`,
      `I would like to order:`,
      `• *Item:* ${product.name}`,
      `• *Quantity:* ${quantity}`,
      `• *Price:* ${formatPrice(product.price * quantity)}`,
      customMessage.trim() ? `• *Message on cake:* "${customMessage.trim()}"` : '',
      includeCandles ? `• *Complimentary:* Free wooden knife & candle included` : '',
      ``,
      `Please confirm kitchen availability and delivery/pickup time. Thank you!`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${hotline}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewText.trim()) {
      toast.error('Please provide your name and review comment');
      return;
    }

    triggerHaptic('medium');
    addCustomerReview({
      customerName: newReviewerName.trim(),
      customerEmail: 'customer@example.com',
      rating: newRating,
      headline: newReviewHeadline.trim() || `${product.name} review`,
      comment: newReviewText.trim(),
      productName: product.name,
      productId: product.id,
      category: product.categorySlug,
      location: 'Verified Customer, Chennai',
      verified: true,
      status: 'pending',
    });

    setReviewsList(getApprovedReviews().filter((r) => r.productId === id));
    setNewReviewerName('');
    setNewReviewHeadline('');
    setNewReviewText('');
    setShowReviewForm(false);
    toast.success('Thank you! Your review has been submitted to our patisserie team for moderation.', { duration: 5000 });
  };

  const handleAddCombo = () => {
    if (!product) return;
    addItem(product, 1, {
      customMessage: customMessage.trim() || undefined,
      includeCandles: true,
    });
    // Complementary celebration add-on
    addItem({
      id: 'addon-candles',
      name: 'Sparkling Birthday Candle Pack',
      price: 50,
      image: '/images/products/candles.jpg',
      category: 'Accessories',
      categorySlug: 'accessories',
      description: 'Pack of 6 sparkling birthday celebration candles with safe holders.',
      ingredients: 'Wax, organic color pigment',
      allergens: 'None',
      inStock: true,
      stockQuantity: 99,
      bestseller: false,
      featured: false,
    }, 1);
    toast.success(`Combo added: ${product.name} + Birthday Candle Pack!`);
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen pb-36 lg:pb-12 text-[var(--color-brand-chocolate)]">
      {/* Breadcrumb */}
      <div className="bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)]">
        <div className="container-main py-3.5">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-brand-muted)]">
            <Link to="/" className="hover:text-[var(--color-brand-primary)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[var(--color-brand-primary-dark)] transition-colors">
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/shop?category=${product.categorySlug}`}
              className="hover:text-[var(--color-brand-primary-dark)] transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-brand-chocolate)] font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-main py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-[var(--color-brand-cream-dark)] group">
              <img
                src={displayImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={handleImageError}
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.bestseller && (
                <span className="px-4 py-1.5 bg-[var(--color-brand-primary-dark)] text-white text-xs font-semibold rounded-full shadow-sm">
                  Bestseller
                </span>
              )}
              {product.featured && !product.bestseller && (
                <span className="px-4 py-1.5 bg-[var(--color-brand-primary)] text-white text-xs font-semibold rounded-full shadow-sm">
                  Featured
                </span>
              )}
            </div>

            {/* Top Right Floating Action Buttons: Share & Wishlist */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="w-10 h-10 rounded-full bg-[var(--color-brand-surface)]/90 backdrop-blur-md border border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                title="Share with friends"
              >
                <Share2 size={17} />
              </button>
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`w-10 h-10 rounded-full backdrop-blur-md border border-[var(--color-brand-border)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer ${
                  isInWishlist
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                    : 'bg-[var(--color-brand-surface)]/90 text-[var(--color-brand-chocolate)]'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} className={isInWishlist ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-brand-primary-dark)] font-semibold">
                {product.category}
              </span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-brand-chocolate)] mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-chocolate)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-[var(--color-brand-success)] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
                <CheckCircle size={13} /> In Stock
              </span>
            </div>
            <p className="text-xs text-[var(--color-brand-muted)] mb-6">
              Inclusive of all taxes • Handcrafted small-batch daily bake
            </p>

            <p className="text-base text-[var(--color-brand-chocolate-light)] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Bakery Delivery Promise Box */}
            <div className="bg-[var(--color-brand-surface-elevated)] rounded-xl p-4 mb-6 border border-[var(--color-brand-border)] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--color-brand-chocolate)] font-semibold">
                <Truck size={16} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
                <span>Direct Bakery Delivery across Chennai</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-brand-muted)]">
                <Clock size={16} className="text-green-600 dark:text-green-400" />
                <span>Order within <strong className="text-[var(--color-brand-chocolate)]">3 hrs 40 mins</strong> for Today Evening Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-brand-muted)]">
                <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
                <span>100% Real Belgian Chocolate & Pure Dairy Cream</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-2 block">
                Select Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 hover:bg-[var(--color-brand-cream-dark)] transition-colors text-[var(--color-brand-chocolate)] cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-5 py-2.5 font-bold text-center min-w-[3rem] border-x border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2.5 hover:bg-[var(--color-brand-cream-dark)] transition-colors text-[var(--color-brand-chocolate)] cursor-pointer"
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-xs text-[var(--color-brand-muted)] font-medium">
                  {product.stockQuantity} ready for today's delivery slots
                </span>
              </div>
            </div>

            {/* Cake Customization: Message on Cake & Free Candles */}
            <div className="bg-[var(--color-brand-surface)] rounded-2xl p-5 border border-[var(--color-brand-border)] mb-6 space-y-3.5 shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]" />
                    Message on Cake (Optional)
                  </label>
                  <span className="text-[11px] text-[var(--color-brand-muted)]">{customMessage.length}/35 chars</span>
                </div>
                <input
                  type="text"
                  maxLength={35}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g., Happy Birthday Rahul! 🎉"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brand-border)] focus:border-[var(--color-brand-primary)] outline-none text-base sm:text-sm text-[var(--color-brand-chocolate)] placeholder:text-[var(--color-brand-muted)] bg-[var(--color-brand-surface-elevated)]"
                />
                <p className="text-[11px] text-[var(--color-brand-muted)] mt-1">
                  Hand-piped on the cake surface or placed on a dark chocolate plaque.
                </p>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-3 border-t border-[var(--color-brand-border)]/50">
                <input
                  type="checkbox"
                  checked={includeCandles}
                  onChange={(e) => setIncludeCandles(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-brand-primary-dark)] accent-[var(--color-brand-primary-dark)] cursor-pointer"
                />
                <span className="text-xs text-[var(--color-brand-chocolate)] font-medium">
                  Include complimentary wooden cake knife & birthday candle pack (FREE)
                </span>
              </label>
            </div>

            {/* Action Buttons: Brand Themed Add to Cart + Buy Now + WhatsApp */}
            <div className="space-y-3 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="py-3.5 px-4 rounded-xl bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ShoppingCart size={17} /> Add to Cart — {formatPrice(product.price * quantity)}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="py-3.5 px-4 rounded-xl bg-[var(--color-brand-primary)] hover:opacity-95 text-[#1E1008] font-black text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Zap size={17} /> Buy Now (Instant Checkout)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  title="Order directly with bakery on WhatsApp"
                >
                  <MessageCircle size={18} /> 1-Click WhatsApp Concierge Order
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast.success(
                      isInWishlist
                        ? `${product.name} removed from wishlist`
                        : `${product.name} added to wishlist`
                    );
                  }}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    isInWishlist
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-[var(--color-brand-border)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] bg-[var(--color-brand-surface)]'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-xl border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] bg-[var(--color-brand-surface)] transition-colors cursor-pointer"
                  title="Share treat"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-[var(--color-brand-primary-light)]/20 pt-6">
              <div className="flex gap-6 mb-6 border-b border-[var(--color-brand-primary-light)]/20">
                {(['description', 'ingredients', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-[1px] ${
                      activeTab === tab
                        ? 'border-[var(--color-brand-primary-dark)] text-[var(--color-brand-primary-dark)]'
                        : 'border-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="space-y-4 text-base text-[var(--color-brand-chocolate-light)] leading-relaxed">
                  <p>{product.description}</p>
                  <div className="bg-white rounded-xl p-4 border border-[var(--color-brand-primary)]/15 flex items-start gap-3">
                    <Sparkles size={18} className="text-[var(--color-brand-primary-dark)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-heading font-bold text-sm text-[var(--color-brand-chocolate)]">
                        Artisanal Bakery Standard
                      </p>
                      <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                        Handcrafted daily in small batches using premium Belgian chocolate, real dairy cream, and pure butter. No synthetic preservatives.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-5 text-sm text-[var(--color-brand-chocolate-light)]">
                  <div>
                    <p className="font-semibold text-[var(--color-brand-chocolate)] mb-1.5">
                      Ingredients
                    </p>
                    <p className="leading-relaxed bg-white p-3.5 rounded-xl border border-[var(--color-brand-primary)]/15">
                      {product.ingredients}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-brand-chocolate)] mb-1.5">
                      Allergen Notice
                    </p>
                    <div className="bg-amber-50 text-amber-900 p-3.5 rounded-xl border border-amber-200 flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
                      <p className="text-xs leading-relaxed font-medium">
                        {product.allergens} Prepared in a bakery environment that handles wheat, nuts, and dairy.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[var(--color-brand-primary)]/15">
                    <p className="font-semibold text-xs text-[var(--color-brand-chocolate)] mb-1">
                      Storage & Serving Suggestion
                    </p>
                    <p className="text-xs text-[var(--color-brand-muted)]">
                      Keep refrigerated at 2°C – 5°C. Best enjoyed within 48 hours of delivery. For maximum flavor, rest at room temperature for 10 minutes before slicing.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Summary with Amazon Star Breakdown Bars */}
                  <div className="bg-white p-5 rounded-2xl border border-[var(--color-brand-primary)]/15 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-3xl font-bold text-gray-900">
                            4.9
                          </span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={18} fill="currentColor" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-semibold">out of 5 stars</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {reviewsList.length + 84} verified customer ratings across Chennai
                        </p>
                      </div>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-bold border border-[#FCD200] self-start sm:self-auto shadow-xs"
                      >
                        {showReviewForm ? 'Cancel Review' : 'Write a Customer Review'}
                      </button>
                    </div>

                    {/* 5-Star Breakdown Bars */}
                    <div className="space-y-1.5 text-xs">
                      {[
                        { star: 5, pct: 88, count: '88%' },
                        { star: 4, pct: 9, count: '9%' },
                        { star: 3, pct: 2, count: '2%' },
                        { star: 2, pct: 1, count: '1%' },
                        { star: 1, pct: 0, count: '0%' },
                      ].map((row) => (
                        <div key={row.star} className="flex items-center gap-3 text-gray-600">
                          <span className="w-12 text-right font-medium">{row.star} star</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-gray-500">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission Form */}
                  {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="bg-white p-5 rounded-xl border border-[var(--color-brand-primary)]/20 space-y-4 animate-fade-in">
                      <p className="font-heading font-bold text-sm text-[var(--color-brand-chocolate)]">
                        Write Your Review
                      </p>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-brand-muted)] block mb-1">
                          Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewRating(star)}
                              className={`p-1 text-lg transition-transform hover:scale-110 ${
                                star <= newRating ? 'text-amber-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-brand-muted)] block mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={newReviewerName}
                          onChange={(e) => setNewReviewerName(e.target.value)}
                          placeholder="e.g., Deepika R."
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-brand-cream)] text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-brand-muted)] block mb-1">
                          Headline
                        </label>
                        <input
                          type="text"
                          value={newReviewHeadline}
                          onChange={(e) => setNewReviewHeadline(e.target.value)}
                          placeholder="e.g., Heavenly melt-in-mouth chocolate!"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-brand-cream)] text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[var(--color-brand-muted)] block mb-1">
                          Review Comment
                        </label>
                        <textarea
                          rows={3}
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="What did you love about this dessert?"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-brand-cream)] text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] resize-none"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary py-2 px-6 text-xs">
                        Submit Review
                      </button>
                    </form>
                  )}

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviewsList.length === 0 ? (
                      <div className="bg-white p-6 rounded-xl border border-[var(--color-brand-border)] text-center">
                        <p className="text-xs text-[var(--color-brand-muted)]">
                          No customer reviews published yet. Be the first celebration host to share your review!
                        </p>
                      </div>
                    ) : (
                      reviewsList.map((rev) => (
                        <div key={rev.id} className="bg-white p-4 rounded-xl border border-[var(--color-brand-primary)]/10 space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-[var(--color-brand-chocolate)]">
                                {rev.customerName}
                              </p>
                              {rev.verified && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[var(--color-brand-muted)] font-mono">
                              {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={13} fill="currentColor" />
                            ))}
                          </div>

                          {rev.headline && (
                            <h4 className="font-bold text-xs text-[var(--color-brand-chocolate)]">
                              "{rev.headline}"
                            </h4>
                          )}

                          <p className="text-xs text-[var(--color-brand-chocolate-light)] leading-relaxed">
                            {rev.comment}
                          </p>

                          {/* Official Patisserie Team Response */}
                          {rev.adminResponse && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-500 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-[var(--color-brand-chocolate)] mb-1">
                                <ShieldCheck size={13} className="text-amber-600" />
                                <span>Official YOYO Patisserie Reply:</span>
                              </div>
                              <p className="text-[var(--color-brand-muted)] italic leading-relaxed">
                                "{rev.adminResponse}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amazon-Style Frequently Bought Together */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--color-brand-primary-dark)]" />
            Frequently Bought Together
          </h2>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Product 1 */}
              <div className="flex items-center gap-3">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 bg-gray-50"
                />
                <div>
                  <p className="text-xs font-bold text-gray-900 max-w-[180px] truncate">{product.name}</p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5">{formatPrice(product.price)}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">This item</span>
                </div>
              </div>

              <span className="text-gray-400 font-bold text-xl">+</span>

              {/* Complementary Add-on */}
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl bg-[var(--color-brand-cream)] flex items-center justify-center text-3xl border border-gray-200">
                  🕯️
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 max-w-[180px]">Sparkling Birthday Candle Pack</p>
                  <p className="text-xs font-extrabold text-gray-900 mt-0.5">₹50</p>
                  <span className="text-[10px] text-gray-500">Party accessory</span>
                </div>
              </div>
            </div>

            {/* Bundle Price and 1-Click Action */}
            <div className="lg:border-l lg:border-gray-200 lg:pl-8 flex flex-col gap-2 w-full lg:w-auto">
              <div className="text-xs text-gray-600">
                <span>Total Combo Price: </span>
                <span className="font-heading text-xl font-extrabold text-gray-900 ml-1">
                  {formatPrice(product.price + 50)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddCombo}
                className="py-2.5 px-6 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-xs shadow-xs border border-[#FCD200] transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={15} /> Add both to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Amazon-Style Product Specifications Table */}
        <div className="mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Product Specifications & Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Bake Type</span>
              <span className="font-semibold text-gray-900">Handcrafted Small-Batch</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Chocolate Source</span>
              <span className="font-semibold text-gray-900">Pure Belgian Cocoa & Callebaut</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Dairy Standard</span>
              <span className="font-semibold text-gray-900">100% Real Dairy Cream & Butter</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Preservatives</span>
              <span className="font-semibold text-emerald-700">Zero Synthetic Preservatives</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Storage Instruction</span>
              <span className="font-semibold text-gray-900">Keep refrigerated at 2°C – 5°C</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Best Before</span>
              <span className="font-semibold text-gray-900">48 hours from delivery date</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Delivery Packaging</span>
              <span className="font-semibold text-gray-900">Cold-insulated tamper-proof box</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Bakery Kitchen</span>
              <span className="font-semibold text-gray-900">Anna Nagar / T. Nagar, Chennai</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-brand-chocolate)] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Add to Cart Bar (Positioned above BottomNav with safe-area support) */}
      <div
        className="lg:hidden fixed left-0 right-0 bg-[var(--color-brand-surface)]/95 backdrop-blur-md border-t border-[var(--color-brand-border)] p-3 z-40 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
        style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-2">
          {/* Quick Quantity Stepper */}
          <div className="flex items-center bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="p-1.5 text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] disabled:opacity-40 transition-colors"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="px-2 py-1 text-xs font-bold text-[var(--color-brand-chocolate)] border-x border-[var(--color-brand-border)] min-w-[1.75rem] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setQuantity(quantity + 1);
              }}
              className="p-1.5 text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] disabled:opacity-40 transition-colors"
              disabled={quantity >= product.stockQuantity}
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="leading-tight">
            <span className="text-[10px] text-[var(--color-brand-muted)] block uppercase font-bold">Total</span>
            <span className="font-heading text-sm font-extrabold text-[var(--color-brand-chocolate)] leading-none">
              {formatPrice(product.price * quantity)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            className="bg-[#25D366] text-white p-2.5 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
            title="Order on WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <MessageCircle size={17} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] active:scale-95 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform"
            disabled={!product.inStock}
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="py-2.5 px-3 rounded-xl bg-[var(--color-brand-primary)] hover:opacity-95 active:scale-95 text-[#1E1008] font-black text-xs shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-transform flex-shrink-0"
            disabled={!product.inStock}
          >
            <Zap size={14} /> Buy
          </button>
        </div>
      </div>
    </div>
  );
}
