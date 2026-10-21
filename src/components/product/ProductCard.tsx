import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Clock, Eye, X } from 'lucide-react';
import { useState } from 'react';
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

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  // Simulated ratings & MRP for Amazon e-commerce feel
  const rating = product.bestseller ? 4.9 : 4.8;
  const reviewCount = product.bestseller ? 218 : 84;
  const mrp = Math.round((product.price * 1.18) / 10) * 10;
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
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
        className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-elevated transition-all overflow-hidden relative"
      >
        <div>
          {/* Image & Badges */}
          <div className="relative aspect-square overflow-hidden bg-[var(--color-brand-cream-dark)]">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={handleImageError}
            />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
              {product.bestseller && (
                <span className="badge badge-neutral text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1 border-none py-1">
                  <span className="text-[#FF9900]">#1</span> Best Seller
                </span>
              )}
              {discountPercent > 0 && (
                <span className="badge badge-error text-white text-[10px] font-bold rounded-sm shadow-xs border-none py-1">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Quick View Button on Hover */}
            {showQuickView && (
              <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewOpen(true);
                  }}
                  className="w-full py-2 bg-white/95 hover:bg-white text-gray-900 font-bold text-xs rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] border border-gray-200"
                >
                  <Eye size={14} className="text-[var(--color-brand-primary-dark)]" /> Quick View
                </button>
              </div>
            )}

            {/* Wishlist Button with DaisyUI Tooltip */}
            <div
              className="tooltip tooltip-left absolute top-2.5 right-2.5 z-10"
              data-tip={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <button
                onClick={handleToggleWishlist}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                  isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={15} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Product Details (Amazon E-commerce Typography & Layout) */}
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
              <span className="uppercase tracking-wider font-semibold text-[var(--color-brand-muted)]">
                {product.category}
              </span>
              <span className="badge badge-soft badge-success text-[10px] font-semibold py-0.5">
                Fresh Bake
              </span>
            </div>

            <h3 className="font-heading text-sm sm:text-base font-bold text-gray-900 group-hover:text-[var(--color-brand-primary-dark)] transition-colors line-clamp-2 leading-snug mb-1.5">
              {product.name}
            </h3>

            {/* Star Ratings */}
            <div className="flex items-center gap-1 mb-2.5">
              <div className="flex text-[#FFA41C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{rating}</span>
              <span className="text-[11px] text-gray-500 font-medium">({reviewCount})</span>
            </div>

            {/* Amazon-Style Price Tag */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(mrp)}
              </span>
            </div>

            {/* Delivery Promise */}
            <div className="text-[11px] text-gray-600 flex items-center gap-1 mb-4">
              <Clock size={12} className="text-green-600" />
              <span>FREE Delivery on orders over ₹500</span>
            </div>
          </div>
        </div>

        {/* Amazon-Style Gold Add to Cart Button */}
        <div className="p-4 sm:p-5 pt-0">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 border border-[#FCD200]"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </Link>

      {/* DaisyUI Quick View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickViewOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors z-20"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Product Visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-[var(--color-brand-cream-dark)] border border-gray-100">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="badge badge-soft badge-success text-[10px] font-semibold absolute top-3 left-3 shadow-xs">
                  Fresh Daily Bake
                </span>
              </div>

              {/* Product Info & Fast Actions */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-primary-dark)]">
                    {product.category}
                  </span>
                  <h3 className="font-heading text-xl font-extrabold text-gray-900 mt-0.5 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(mrp)}
                    </span>
                    <span className="badge badge-error text-white text-[10px] font-bold">
                      {discountPercent}% OFF
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Cake Customization (Message & Candles) */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    maxLength={35}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Message on cake (optional)..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none focus:border-[var(--color-brand-primary-dark)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-bold shadow-xs flex items-center justify-center gap-2 border border-[#FCD200]"
                  >
                    <ShoppingCart size={15} /> Add to Cart — {formatPrice(product.price)}
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

