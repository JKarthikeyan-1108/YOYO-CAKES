import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Clock } from 'lucide-react';
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

export default function ProductCard({ product, showQuickView: _showQuickView = true }: ProductCardProps) {
  const categoryImage = `/images/categories/${product.categorySlug}.jpg`;
  const [imgSrc, setImgSrc] = useState(product.image || categoryImage);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

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
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col justify-between rounded-2xl bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-elevated transition-all overflow-hidden"
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
              <span className="px-2.5 py-1 bg-[#232F3E] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1">
                <span className="text-[#FF9900]">#1</span> Best Seller
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 bg-[#CC0C39] text-white text-[10px] font-bold rounded-sm shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={15} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Product Details (Amazon E-commerce Typography & Layout) */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[var(--color-brand-muted)]">
              {product.category}
            </span>
            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-semibold border border-green-200/60">
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
  );
}
