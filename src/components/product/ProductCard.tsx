import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

// Generate placeholder dessert images using gradient backgrounds
function getProductImage(product: Product): string {
  // Returns a gradient-based placeholder keyed to category
  return '';
}

const CATEGORY_COLORS: Record<string, { from: string; to: string; emoji: string }> = {
  'cakes': { from: '#E8D5C4', to: '#C9A184', emoji: '🎂' },
  'tiramisu-desserts': { from: '#D4C4B0', to: '#8B7355', emoji: '🍮' },
  'brownies': { from: '#6B4C3B', to: '#3D2417', emoji: '🍫' },
  'tea-cakes-pies': { from: '#F5E6D3', to: '#D4A574', emoji: '🍰' },
  'mini-jar-cakes': { from: '#FFE4E1', to: '#E8A598', emoji: '🧁' },
};

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export default function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const [imageError, setImageError] = useState(true); // Start with placeholder
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const colors = CATEGORY_COLORS[product.categorySlug] || CATEGORY_COLORS['cakes'];

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

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block card overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {imageError ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
            }}
          >
            <span className="text-5xl mb-2">{colors.emoji}</span>
            <span className="text-white/80 text-xs font-medium px-3 text-center leading-tight">
              {product.name}
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[var(--color-brand-primary-dark)] hover:text-white transition-colors"
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                isInWishlist
                  ? 'bg-[var(--color-brand-error)] text-white'
                  : 'bg-white hover:bg-[var(--color-brand-error)] hover:text-white'
              }`}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            {showQuickView && (
              <Link
                to={`/product/${product.id}`}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[var(--color-brand-primary-dark)] hover:text-white transition-colors"
                title="Quick view"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.bestseller && (
            <span className="px-2.5 py-1 bg-[var(--color-brand-primary-dark)] text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.featured && !product.bestseller && (
            <span className="px-2.5 py-1 bg-[var(--color-brand-primary)] text-white text-[10px] font-semibold rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist - Top Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isInWishlist
              ? 'bg-[var(--color-brand-error)] text-white'
              : 'bg-white/80 text-[var(--color-brand-chocolate-light)] hover:bg-white'
          }`}
        >
          <Heart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-brand-muted)] mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-base font-semibold text-[var(--color-brand-chocolate)] mb-2 group-hover:text-[var(--color-brand-primary-dark)] transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--color-brand-primary-dark)]">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="px-3 py-1.5 bg-[var(--color-brand-primary-dark)] text-white text-xs font-semibold rounded-full hover:bg-[var(--color-brand-chocolate)] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
