import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, Eye, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const categoryImage = `/images/categories/${product.categorySlug}.jpg`;
  const [imgSrc, setImgSrc] = useState(product.image || categoryImage);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [includeCandles, setIncludeCandles] = useState(false);

  // Accessible Escape key listener & body scroll lock
  useEffect(() => {
    if (!quickViewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = orig;
    };
  }, [quickViewOpen]);

  const cartItem = useCartStore((s) => s.items.find((i) => i.product.id === product.id));
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity <= 1) {
      removeItem(product.id);
      toast.success(`${product.name} removed from cart`);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(
      isInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist`
    );
  };

  const handleImageError = () => {
    if (!hasFailedOnce && imgSrc !== categoryImage) {
      setImgSrc(categoryImage);
      setHasFailedOnce(true);
    }
  };

  return (
    <>
      <Link
        to={`/product/${product.id}`}
        className="group flex flex-col justify-between rounded-2xl bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-primary)]/50 hover:shadow-lg transition-all overflow-hidden relative"
      >
        <div>
          {/* Image & Badges */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-brand-cream-dark)]">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={handleImageError}
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
              {product.bestseller && (
                <span className="badge bg-[var(--color-brand-primary-dark)] text-white text-[10px] font-bold tracking-wider rounded-md shadow-xs border-none py-1 px-2 uppercase">
                  Bestseller
                </span>
              )}
            </div>

            {/* Quick View Button on Hover */}
            {showQuickView && (
              <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className="w-full py-2 bg-[var(--color-brand-surface)]/95 hover:bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] font-bold text-xs rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] border border-[var(--color-brand-border)]"
                >
                  <Eye size={14} className="text-[var(--color-brand-primary-dark)]" /> Quick View
                </button>
              </div>
            )}

            {/* Wishlist Button */}
            <div
              className="tooltip tooltip-left absolute top-2.5 right-2.5 z-10"
              data-tip={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-[var(--color-brand-surface)]/90 text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-surface)] hover:text-red-500'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={15} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Product Details (Swiggy-inspired Clean Food Card) */}
          <div className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-[11px] text-[var(--color-brand-muted)] mb-1">
              <span className="uppercase tracking-wider font-semibold text-[var(--color-brand-muted)]">
                {product.category}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Check size={10} /> Fresh Bake
              </span>
            </div>

            <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-brand-chocolate)] group-hover:text-[var(--color-brand-primary-dark)] transition-colors line-clamp-2 leading-snug mb-1">
              {product.name}
            </h3>

            {/* Price Tag */}
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-base sm:text-lg font-extrabold text-[var(--color-brand-chocolate)]">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Swiggy-Style Add / Stepper Button */}
        <div className="p-3 sm:p-4 pt-0">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-[var(--color-brand-primary-dark)] text-white rounded-xl py-1 px-1.5 sm:px-3 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg hover:bg-black/15 active:scale-90 transition-all text-white font-bold"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus size={14} />
              </button>
              <span className="text-xs sm:text-sm font-black tracking-wider text-center px-1">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg hover:bg-black/15 active:scale-90 transition-all text-white font-bold"
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[var(--color-brand-cream-light)] text-[var(--color-brand-primary-dark)] hover:text-[var(--color-brand-chocolate)] border-2 border-[var(--color-brand-primary-dark)]/40 hover:border-[var(--color-brand-primary-dark)] text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1 active:scale-[0.98] min-h-[38px]"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={14} /> ADD
            </button>
          )}
        </div>
      </Link>

      {/* DaisyUI Quick View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view for ${product.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickViewOpen(false);
          }}
        >
          <div
            className="bg-[var(--color-brand-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--color-brand-border)] relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-3 right-3 min-w-[40px] min-h-[40px] rounded-full bg-[var(--color-brand-surface-elevated)] hover:opacity-80 text-[var(--color-brand-chocolate)] flex items-center justify-center transition-colors z-20 border border-[var(--color-brand-border)]"
              aria-label="Close quick view dialog"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Product Visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-[var(--color-brand-cream-dark)] border border-[var(--color-brand-border)]">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="badge bg-emerald-700 text-white text-[10px] font-semibold absolute top-3 left-3 shadow-xs border-none">
                  Fresh Daily Bake
                </span>
              </div>

              {/* Product Info & Actions */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]">
                    {product.category}
                  </span>
                  <h3 className="font-heading text-xl font-extrabold text-[var(--color-brand-chocolate)] mt-0.5 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-[var(--color-brand-chocolate)]">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Cake Customization (Message & Candles) */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-brand-border)]">
                  <input
                    type="text"
                    maxLength={35}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Message on cake (optional)..."
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-chocolate)] text-xs outline-none focus:border-[var(--color-brand-primary-dark)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCandles}
                      onChange={(e) => setIncludeCandles(e.target.checked)}
                      className="rounded accent-[var(--color-brand-primary-dark)]"
                    />
                    <span>Complimentary candles & wooden knife</span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(product, 1, {
                        customMessage: customMessage.trim() || undefined,
                        includeCandles,
                      });
                      toast.success(`${product.name} added to cart`);
                      setQuickViewOpen(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={15} /> Add to Cart — {formatPrice(product.price)}
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    onClick={() => setQuickViewOpen(false)}
                    className="block text-center text-xs font-bold text-[var(--color-brand-primary-dark)] hover:underline pt-1"
                  >
                    View Full Product Details & Ingredients →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
