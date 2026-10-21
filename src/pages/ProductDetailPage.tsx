import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, Star, Share2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductById, getProductsByCategory, formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import ProductCard from '@/components/product/ProductCard';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

const INITIAL_REVIEWS: Record<string, ReviewItem[]> = {
  'cake-002': [
    {
      id: 'rev-1',
      name: 'Priya Sundaram',
      rating: 5,
      date: '2 days ago',
      comment: 'The Matilda cake is honestly the best chocolate cake in Chennai! Incredibly moist, deep cocoa fudge, and decadent without being overly sweet.',
    },
    {
      id: 'rev-2',
      name: 'Karthik Raja',
      rating: 5,
      date: '1 week ago',
      comment: 'Ordered for our anniversary. The presentation was gorgeous and the chocolate fudge melted in our mouths. 10/10 recommend!',
    },
  ],
  'cake-001': [
    {
      id: 'rev-3',
      name: 'Ananya Ramesh',
      rating: 5,
      date: '3 days ago',
      comment: 'Cracking the hard chocolate shell on the 5-in-1 Dream Cake was so satisfying! The 5 layers taste sensational together.',
    },
  ],
};

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-default',
    name: 'Shreya M.',
    rating: 5,
    date: 'Recent verified buyer',
    comment: 'Authentic bakery quality with real Belgian chocolate and rich dairy cream. Arrived fresh and beautifully packaged.',
  },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'reviews'>('description');
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(id || ''));

  const product = id ? getProductById(id) : undefined;
  const categoryImage = product ? `/images/categories/${product.categorySlug}.jpg` : '';
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  // Review submission state
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => {
    return (id && INITIAL_REVIEWS[id]) ? INITIAL_REVIEWS[id] : DEFAULT_REVIEWS;
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

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

  const relatedProducts = getProductsByCategory(product.categorySlug)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const displayImage = imgSrc || product.image || categoryImage;

  const handleImageError = () => {
    if (!hasFailedOnce && displayImage !== categoryImage) {
      setImgSrc(categoryImage);
      setHasFailedOnce(true);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} — YOYO CAKES`,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewText.trim()) {
      toast.error('Please provide your name and review comment');
      return;
    }

    const review: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewerName.trim(),
      rating: newRating,
      date: 'Just now',
      comment: newReviewText.trim(),
    };

    setReviewsList([review, ...reviewsList]);
    setNewReviewerName('');
    setNewReviewText('');
    setShowReviewForm(false);
    toast.success('Thank you! Your review has been submitted.');
  };

  return (
    <div className="bg-[var(--color-brand-cream)] min-h-screen pb-20 lg:pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[var(--color-brand-primary-light)]/20">
        <div className="container-main py-3.5">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-brand-muted)]">
            <Link to="/" className="hover:text-[var(--color-brand-primary-dark)] transition-colors">
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

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-[var(--color-brand-primary-dark)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-[var(--color-brand-success)] font-medium bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle size={14} /> {product.inStock ? 'Freshly Available' : 'Out of Stock'}
              </span>
            </div>

            <p className="text-base text-[var(--color-brand-chocolate-light)] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-[var(--color-brand-chocolate)] mb-3 block">
                Select Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-[var(--color-brand-primary)]/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-[var(--color-brand-cream)] transition-colors text-[var(--color-brand-chocolate)]"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-bold text-center min-w-[3.5rem] border-x border-[var(--color-brand-primary)]/20 text-[var(--color-brand-chocolate)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-[var(--color-brand-cream)] transition-colors text-[var(--color-brand-chocolate)]"
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-[var(--color-brand-muted)] font-medium">
                  {product.stockQuantity} batches ready today
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 min-w-[220px] py-3.5 text-base"
                disabled={!product.inStock}
              >
                <ShoppingCart size={18} /> Add to Cart — {formatPrice(product.price * quantity)}
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(
                    isInWishlist
                      ? `${product.name} removed from wishlist`
                      : `${product.name} added to wishlist`
                  );
                }}
                className={`p-3.5 rounded-full border-2 transition-colors ${
                  isInWishlist
                    ? 'border-[var(--color-brand-error)] bg-[var(--color-brand-error)] text-white'
                    : 'border-[var(--color-brand-primary-light)] hover:border-[var(--color-brand-error)] hover:text-[var(--color-brand-error)] text-[var(--color-brand-chocolate)]'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-3.5 rounded-full border-2 border-[var(--color-brand-primary-light)] hover:border-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-primary-dark)] text-[var(--color-brand-chocolate)] transition-colors"
                title="Share treat"
              >
                <Share2 size={18} />
              </button>
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
                  {/* Reviews Summary */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--color-brand-primary)]/15">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)]">
                          5.0
                        </span>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                        Based on {reviewsList.length} verified customer reviews
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 rounded-full bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] text-xs font-semibold hover:bg-[var(--color-brand-primary-light)] transition-colors"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
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
                        Post Review
                      </button>
                    </form>
                  )}

                  {/* Review List */}
                  <div className="space-y-4">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="bg-white p-4 rounded-xl border border-[var(--color-brand-primary)]/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-[var(--color-brand-chocolate)]">
                            {rev.name}
                          </p>
                          <span className="text-xs text-[var(--color-brand-muted)]">
                            {rev.date}
                          </span>
                        </div>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="currentColor" />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--color-brand-chocolate-light)] leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[var(--color-brand-primary-light)]/40 p-4 z-40 flex items-center justify-between shadow-elevated">
        <div>
          <span className="text-xs text-[var(--color-brand-muted)] block">Total</span>
          <span className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          className="btn-primary py-2.5 px-6 text-sm"
          disabled={!product.inStock}
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
